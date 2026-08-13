import { useRef, useState } from "react";
import styled from "styled-components";
import { Drawer } from "vaul";
import { X } from "lucide-react";
import { getCourseOfferingsPage, searchCourseOfferings } from "@/apis/courseOfferings";
import { useCreateTimeTableCourseItem } from "@/hooks/useTimeTables";
import { useSheetBackHandler } from "@/hooks/useSheetBackHandler";
import type { CourseOffering } from "@/types/courseOfferings";
import type { Term } from "@/types/timetables";
import {
  detectTimetableBlocks,
  detectTimetableImageLayout,
  extractBracketedSubjectNumbers,
  findConfidentOffering,
  findUniqueTitleOffering,
  isOfferingFragmentMatch,
  parseAndGroupBlocks,
  scoreOffering,
  type DetectedCourseGroup,
} from "@/utils/timetableImageImport";

type Props = {
  open: boolean;
  onClose: () => void;
  timetableId: number;
  year: number;
  term: Term;
  existingOfferingIds: number[];
  existingSubjectNumbers: string[];
};
type Match = { group: DetectedCourseGroup; candidates: CourseOffering[]; selectedId: number | null };

const DAY_LABEL: Record<string, string> = {
  MONDAY: "월", TUESDAY: "화", WEDNESDAY: "수", THURSDAY: "목", FRIDAY: "금", SATURDAY: "토",
};

const formatOfferingMeetings = (offering: CourseOffering) =>
  offering.meetings
    .map(
      (meeting) =>
        `${DAY_LABEL[meeting.day] ?? meeting.day} ${meeting.startTime.slice(0, 5)}~${meeting.endTime.slice(0, 5)}`,
    )
    .join(", ");

export default function TimetableImageImportModal({
  open,
  onClose,
  timetableId,
  year,
  term,
  existingOfferingIds,
  existingSubjectNumbers,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const createMutation = useCreateTimeTableCourseItem();
  useSheetBackHandler(open, onClose, !isSaving);

  if (!open) return null;

  const analyze = async (file: File) => {
    setMatches([]);
    setProgress(0);
    setStatus("강의 블록을 찾고 있어요.");
    try {
      let detectedBlocks: Awaited<ReturnType<typeof detectTimetableBlocks>> = [];
      // OCR 런타임은 이 기능을 열었을 때만 내려받아 기본 시간표 번들에 싣지 않는다.
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("kor+eng", 1, {
        logger: (message) => {
          if (message.status === "recognizing text") setProgress(Math.round(message.progress * 100));
        },
      });
      try {
        setStatus("시간표 이미지 형식을 확인하고 있어요.");
        const fullImageResult = await worker.recognize(file);
        const subjectNumbers = extractBracketedSubjectNumbers(
          fullImageResult.data.text,
        );

        if (subjectNumbers.length > 0) {
          setStatus("수강번호로 개설 강좌를 찾고 있어요.");
          const numberMatches: Match[] = [];
          for (const subjectNumber of subjectNumbers) {
            const offerings = await searchCourseOfferings(year, term, subjectNumber);
            const offering = offerings.find(
              (candidate) => candidate.subjectNumber === subjectNumber,
            );
            if (!offering) {
              numberMatches.push({
                group: {
                  id: `subject-${subjectNumber}`,
                  title: subjectNumber,
                  professor: "",
                  rawText: subjectNumber,
                  blocks: [],
                },
                candidates: [],
                selectedId: null,
              });
              continue;
            }
            numberMatches.push({
              group: {
                id: `subject-${subjectNumber}`,
                title: offering.courseTitle,
                professor: offering.professor ?? "",
                rawText: subjectNumber,
                blocks: offering.meetings.map((meeting, index) => ({
                  id: `subject-${subjectNumber}-${index}`,
                  crop: document.createElement("canvas"),
                  day: meeting.day,
                  startTime: meeting.startTime.slice(0, 5),
                  endTime: meeting.endTime.slice(0, 5),
                  rawText: subjectNumber,
                  confidence: fullImageResult.data.confidence,
                })),
              },
              candidates: [offering],
              selectedId: existingOfferingIds.includes(offering.id) ||
                existingSubjectNumbers.includes(offering.subjectNumber)
                ? null
                : offering.id,
            });
          }
          setMatches(numberMatches);
          setStatus(`${subjectNumbers.length}개의 수강번호를 인식했습니다.`);
          return;
        }

        const layout = detectTimetableImageLayout(fullImageResult.data.text);
        detectedBlocks = await detectTimetableBlocks(file, layout);
        if (!detectedBlocks.length) throw new Error("분석 가능한 강의 정보를 찾지 못했습니다.");
        for (let index = 0; index < detectedBlocks.length; index += 1) {
          setStatus(`강의 글자를 읽고 있어요. (${index + 1}/${detectedBlocks.length})`);
          const result = await worker.recognize(detectedBlocks[index].crop);
          detectedBlocks[index].rawText = result.data.text.trim();
          detectedBlocks[index].confidence = result.data.confidence;
        }
      } finally {
        await worker.terminate();
      }
      // 위 try 블록에서 격자 분석을 완료한 경우에만 아래 로직에 도달한다.
      const groups = parseAndGroupBlocks(detectedBlocks);
      setStatus("개설 강좌와 비교하고 있어요.");
      const preliminaryMatches: Match[] = [];
      for (const group of groups) {
        // OCR 한 글자가 틀려도 교수명이나 과목명 앞부분으로 한 번 더 후보를 찾는다.
        const keywords = [...new Set([group.title, group.professor, group.title.replace(/\s/g, "").slice(0, 2)])]
          .filter((keyword) => keyword.length >= 2);
        const candidateMap = new Map<number, CourseOffering>();
        for (const keyword of keywords) {
          const found = await searchCourseOfferings(year, term, keyword);
          found.forEach((offering) => candidateMap.set(offering.id, offering));
          if (candidateMap.size >= 10) break;
        }
        // 과목명이 오염돼도 좌표로 얻은 요일·시간은 신뢰할 수 있으므로 후보를 보충한다.
        const meetingPage = await getCourseOfferingsPage(year, term, 0, 50, {
          meetingFilterMode: "HAS_CLASS",
          meetings: group.blocks.map(
            (block) => `${block.day}|${block.startTime}|${block.endTime}`,
          ),
        });
        meetingPage.content.forEach((offering) => candidateMap.set(offering.id, offering));
        const candidates = [...candidateMap.values()]
          .filter((offering) => !existingOfferingIds.includes(offering.id))
          .map((offering) => ({ offering, score: scoreOffering(group, offering) }))
          .sort((a, b) => b.score - a.score)
          .map(({ offering }) => offering);
        preliminaryMatches.push({ group, candidates, selectedId: null });
      }

      // 문자열끼리 직접 묶지 않고, 유일하게 일치한 실제 개설 분반 ID를 기준으로 병합한다.
      const merged = new Map<string, Match>();
      preliminaryMatches.forEach((match) => {
        const fragmentCandidates = match.candidates.filter((offering) =>
          isOfferingFragmentMatch(match.group, offering),
        );
        const offering = fragmentCandidates.length === 1
          ? fragmentCandidates[0]
          : findConfidentOffering(match.group, match.candidates);
        const mergeKey = offering ? `offering-${offering.id}` : `ocr-${match.group.id}`;
        const current = merged.get(mergeKey);
        if (current) {
          current.group.blocks.push(...match.group.blocks);
          match.candidates.forEach((candidate) => {
            if (!current.candidates.some((item) => item.id === candidate.id)) current.candidates.push(candidate);
          });
        } else {
          merged.set(mergeKey, {
            group: offering
              ? { ...match.group, title: offering.courseTitle, professor: offering.professor ?? match.group.professor }
              : { ...match.group },
            candidates: [...match.candidates],
            selectedId: null,
          });
        }
      });

      const nextMatches = [...merged.values()].map((match) => {
        const candidates = match.candidates
          .map((offering) => ({ offering, score: scoreOffering(match.group, offering) }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .map(({ offering }) => offering);
        const confidentOffering = findConfidentOffering(match.group, candidates);
        return {
          ...match,
          candidates,
          selectedId: confidentOffering?.id ?? null,
        };
      });
      setMatches(nextMatches);
      setStatus("분석 결과를 확인해 주세요.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "이미지 분석에 실패했습니다.");
    }
  };

  const save = async () => {
    if (!matches.length || matches.some((match) => match.selectedId === null)) {
      alert("모든 항목의 분반을 선택하거나 불필요한 항목을 제외해 주세요.");
      return;
    }
    const selectedOfferings = matches
      .map((match) =>
        match.candidates.find((candidate) => candidate.id === match.selectedId),
      )
      .filter((offering): offering is CourseOffering => offering !== undefined);
    // 같은 분반이 서로 다른 OCR 카드나 내부 ID로 잡혀도 수강번호 기준으로 한 번만 저장한다.
    const uniqueOfferings = [...new Map(
      selectedOfferings.map((offering) => [
        offering.subjectNumber || `id-${offering.id}`,
        offering,
      ]),
    ).values()].filter(
      (offering) =>
        !existingOfferingIds.includes(offering.id) &&
        !existingSubjectNumbers.includes(offering.subjectNumber),
    );
    if (!uniqueOfferings.length) {
      alert("선택한 강의는 이미 시간표에 등록되어 있습니다.");
      return;
    }
    setIsSaving(true);
    let addedCount = 0;
    let skippedCount = selectedOfferings.length - uniqueOfferings.length;
    try {
      for (const offering of uniqueOfferings) {
        try {
          await createMutation.mutateAsync({
            timeTableId: timetableId,
            body: { courseOfferingId: offering.id },
          });
          addedCount += 1;
        } catch (error: any) {
          const message = String(error.response?.data?.msg ?? "");
          if (message.includes("동일한 과목") || message.includes("이미 존재")) {
            skippedCount += 1;
            continue;
          }
          throw error;
        }
      }
      const skippedMessage = skippedCount > 0 ? ` 이미 등록된 ${skippedCount}개는 제외했습니다.` : "";
      alert(`${addedCount}개 강의를 시간표에 추가했습니다.${skippedMessage}`);
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.msg || "일부 강의를 추가하지 못했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const isSelectionComplete =
    matches.length > 0 && matches.every((match) => match.selectedId !== null);

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isSaving) onClose();
      }}
      dismissible={!isSaving}
      modal
    >
      <Drawer.Portal>
        <StyledOverlay />
        <StyledContent aria-label="시간표 이미지로 등록">
          <Sheet>
            <DragHeader><HandleBar /></DragHeader>
            <Body>
              <Title>시간표 이미지로 등록</Title>
              <Description>장바구니 시간표 캡처를 올리면 기기 안에서만 분석합니다. 선택 결과를 확인한 뒤 등록해 주세요.</Description>
              <input ref={inputRef} hidden type="file" accept="image/*" onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void analyze(file);
                event.currentTarget.value = "";
              }} />
              <UploadButton type="button" onClick={() => inputRef.current?.click()}>이미지 선택</UploadButton>
              {status && <Status>{status}{progress > 0 && progress < 100 ? ` ${progress}%` : ""}</Status>}
              <Results>
                {matches.map((match) => (
                  <ResultCard
                    key={match.group.id}
                    $completed={match.selectedId !== null}
                  >
                    <ResultHeader>
                      <Detected>
                        <strong>
                          {match.candidates.find((candidate) => candidate.id === match.selectedId)?.courseTitle ??
                            findUniqueTitleOffering(match.group.title, match.candidates)?.courseTitle ??
                            match.group.title}
                        </strong>
                        {" · "}
                        {(match.candidates.find((candidate) => candidate.id === match.selectedId)?.professor ?? match.group.professor) || "교수 인식 안 됨"}
                      </Detected>
                      <ResultActions>
                        <SelectionStatus $completed={match.selectedId !== null}>
                          {match.selectedId !== null ? "선택 완료" : "선택 필요"}
                        </SelectionStatus>
                        <RemoveButton
                          type="button"
                          aria-label={`${match.group.title} 분석 결과 제외`}
                          title="분석 결과에서 제외"
                          onClick={() =>
                            setMatches((current) =>
                              current.filter((item) => item.group.id !== match.group.id),
                            )
                          }
                        >
                          <X size={18} />
                        </RemoveButton>
                      </ResultActions>
                    </ResultHeader>
                    <Schedule>{match.group.blocks.map((block) => `${DAY_LABEL[block.day]} ${block.startTime}~${block.endTime}`).join(", ")}</Schedule>
                    {match.candidates.length ? (
                      <Select value={match.selectedId ?? ""} onChange={(event) => {
                        const selectedId = event.target.value ? Number(event.target.value) : null;
                        setMatches((current) => current.map((item) => item.group.id === match.group.id ? { ...item, selectedId } : item));
                      }}>
                        <option value="">등록할 분반을 선택하세요</option>
                        {match.candidates.map((candidate) => {
                          const meetingLabel = formatOfferingMeetings(candidate);
                          return (
                            <option key={candidate.id} value={candidate.id}>
                              {candidate.courseTitle} · {candidate.professor || "교수 미정"} · {candidate.subjectNumber}
                              {meetingLabel ? ` · ${meetingLabel}` : ""}
                            </option>
                          );
                        })}
                      </Select>
                    ) : <Warning>일치하는 개설 강좌를 찾지 못했습니다.</Warning>}
                  </ResultCard>
                ))}
              </Results>
            </Body>
            <Actions>
              <CancelButton type="button" onClick={onClose} disabled={isSaving}>취소</CancelButton>
              <SaveButton type="button" onClick={() => void save()} disabled={isSaving || !isSelectionComplete}>
                {isSaving
                  ? "등록 중..."
                  : isSelectionComplete
                    ? "선택 강의 등록"
                    : "모든 분반을 선택해 주세요"}
              </SaveButton>
            </Actions>
          </Sheet>
        </StyledContent>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

const StyledOverlay = styled(Drawer.Overlay)`position: fixed; inset: 0; z-index: 10999; background: rgba(15, 23, 42, .28);`;
const StyledContent = styled(Drawer.Content)`position: fixed; left: 0; right: 0; bottom: 0; z-index: 11000; height: 90dvh; max-width: 1024px; margin: 0 auto; outline: none;`;
const Sheet = styled.div`width: 100%; height: 100%; display: flex; flex-direction: column; overflow: hidden; border-radius: 24px 24px 0 0; background: #fff;`;
const DragHeader = styled.div`height: 28px; flex: 0 0 28px; display: flex; align-items: center; justify-content: center;`;
const HandleBar = styled.div`width: 42px; height: 5px; border-radius: 999px; background: #d7deea;`;
const Body = styled.div`flex: 1; min-height: 0; overflow-y: auto; padding: 8px 20px 24px; box-sizing: border-box; overscroll-behavior: contain; -webkit-overflow-scrolling: touch;`;
const Title = styled.h2`margin: 0 0 8px; font-size: 20px; color: #191f28;`;
const Description = styled.p`margin: 0 0 18px; font-size: 14px; line-height: 21px; color: #6b7684; word-break: keep-all;`;
const UploadButton = styled.button`width: 100%; padding: 13px; border: 1px solid #0061ff; border-radius: 12px; background: #fff; color: #0061ff; font-weight: 600;`;
const Status = styled.p`margin: 14px 0 0; font-size: 14px; color: #4e5968;`;
const Results = styled.div`display: flex; flex-direction: column; gap: 10px; margin-top: 16px;`;
const ResultCard = styled.div<{ $completed: boolean }>`padding: 14px; border: 1px solid ${({ $completed }) => $completed ? "#8bb8ff" : "#f0b8b8"}; border-radius: 14px; background: ${({ $completed }) => $completed ? "#f5f9ff" : "#fffafa"}; transition: border-color .2s, background .2s;`;
const ResultHeader = styled.div`display: flex; align-items: flex-start; justify-content: space-between; gap: 8px;`;
const Detected = styled.div`font-size: 15px; color: #333d4b;`;
const ResultActions = styled.div`display: flex; flex: 0 0 auto; align-items: center; gap: 6px;`;
const SelectionStatus = styled.span<{ $completed: boolean }>`padding: 4px 7px; border-radius: 999px; background: ${({ $completed }) => $completed ? "#e8f2ff" : "#fff0f0"}; color: ${({ $completed }) => $completed ? "#0061ff" : "#e5484d"}; font-size: 11px; font-weight: 700; white-space: nowrap;`;
const RemoveButton = styled.button`flex: 0 0 auto; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; padding: 0; border: 0; border-radius: 8px; background: #f2f4f6; color: #6b7684; cursor: pointer; &:hover { background: #e5e8eb; }`;
const Schedule = styled.div`margin: 5px 0 10px; font-size: 13px; color: #6b7684;`;
const Select = styled.select`width: 100%; padding: 11px; border: 1px solid #d1d6db; border-radius: 10px; background: #fff; color: #333d4b;`;
const Warning = styled.div`font-size: 13px; color: #e5484d;`;
const Actions = styled.div`flex: 0 0 auto; display: grid; grid-template-columns: 1fr 2fr; gap: 8px; padding: 12px 20px calc(12px + env(safe-area-inset-bottom, 0px)); border-top: 1px solid #f2f4f6; background: #fff; box-shadow: 0 -8px 20px rgba(0,0,0,.04);`;
const CancelButton = styled.button`padding: 14px; border: 0; border-radius: 12px; background: #f2f4f6; color: #4e5968; font-weight: 600;`;
const SaveButton = styled.button`padding: 14px; border: 0; border-radius: 12px; background: #0061ff; color: #fff; font-weight: 600; &:disabled { background: #d1d6db; }`;
