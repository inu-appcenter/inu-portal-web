import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Drawer } from "vaul";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ImagePlus,
  ShieldCheck,
  Smartphone,
  X,
} from "lucide-react";
import { getCourseOfferingsPage, searchCourseOfferings } from "@/apis/courseOfferings";
import { useCreateTimeTableCourseItem } from "@/hooks/useTimeTables";
import { useSheetBackHandler } from "@/hooks/useSheetBackHandler";
import type { CourseOffering } from "@/types/courseOfferings";
import type { Term } from "@/types/timetables";
import { formatSemester } from "@/utils/semester";
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [openCandidateGroupId, setOpenCandidateGroupId] = useState<string | null>(null);
  const createMutation = useCreateTimeTableCourseItem();
  useSheetBackHandler(open, onClose, !isSaving);

  useEffect(() => {
    if (!openCandidateGroupId) return;
    const closeOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target;
      if (
        target instanceof Element &&
        target.closest('[data-candidate-popover="true"]')
      ) return;
      setOpenCandidateGroupId(null);
    };
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, [openCandidateGroupId]);

  if (!open) return null;

  const analyze = async (file: File) => {
    setIsAnalyzing(true);
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
    } finally {
      setIsAnalyzing(false);
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
  const completedCount = matches.filter((match) => match.selectedId !== null).length;

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
              <HeaderSection>
                <HeaderTitleRow>
                  <Title>시간표 이미지로 등록</Title>
                  <SemesterBadge>{formatSemester(year, term)}</SemesterBadge>
                </HeaderTitleRow>
                <SemesterDescription>
                  분석한 강의는 현재 보고 있는 {formatSemester(year, term)} 시간표에 등록돼요.
                </SemesterDescription>
              </HeaderSection>

              <SupportedSection>
                <SectionLabel>지원하는 화면</SectionLabel>
                <SupportedGrid>
                  <SupportedItem>
                    <Smartphone size={18} />
                    <span>
                      <SupportedTitleRow><strong>수강신청 앱</strong><RecommendedBadge>가장 정확해요</RecommendedBadge></SupportedTitleRow>
                      수강신청 내역 화면 권장
                    </span>
                  </SupportedItem>
                  <SupportedItem>
                    <Smartphone size={18} />
                    <span><strong>에브리타임</strong>시간표 전체 화면</span>
                  </SupportedItem>
                </SupportedGrid>
              </SupportedSection>

              <HiddenFileInput ref={inputRef} type="file" accept="image/*" onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void analyze(file);
                event.currentTarget.value = "";
              }} />
              <UploadButton
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={isAnalyzing || isSaving}
              >
                <UploadIcon><ImagePlus size={22} /></UploadIcon>
                <UploadText>
                  <strong>{matches.length ? "다른 이미지로 다시 분석" : "시간표 이미지 선택"}</strong>
                  <span>PNG, JPG 등 휴대폰 캡처 이미지를 선택해 주세요</span>
                </UploadText>
              </UploadButton>

              {isAnalyzing && (
                <AnalysisStatus>
                  <Spinner />
                  <AnalysisText>
                    <strong>{status}</strong>
                    <ProgressTrack><ProgressBar $progress={progress} /></ProgressTrack>
                  </AnalysisText>
                  <ProgressValue>{progress}%</ProgressValue>
                </AnalysisStatus>
              )}

              {!matches.length && !isAnalyzing && (
                <>
                  {status && (
                    <ErrorNotice><AlertCircle size={17} />{status}</ErrorNotice>
                  )}
                  <GuideCard>
                    <GuideTitle><ShieldCheck size={18} />등록 전에 알아두세요</GuideTitle>
                    <GuideList>
                      <li>이미지는 서버에 저장하지 않고 기기에서만 분석해요.</li>
                      <li>요일과 시간이 보이도록 시간표 전체를 캡처해 주세요.</li>
                      <li>분석 결과는 반드시 실제 시간표와 비교해 주세요.</li>
                    </GuideList>
                  </GuideCard>
                </>
              )}

              {matches.length > 0 && (
                <ResultSummary>
                  <SummaryText>
                    <strong>분석 결과 {matches.length}개</strong>
                    <span>선택 완료 {completedCount} · 확인 필요 {matches.length - completedCount}</span>
                  </SummaryText>
                  <SummaryBadge $completed={isSelectionComplete}>
                    {isSelectionComplete ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                    {isSelectionComplete ? "등록 준비 완료" : "분반 확인 필요"}
                  </SummaryBadge>
                </ResultSummary>
              )}

              {matches.length > 0 && (
                <ResultNotice>
                  <AlertCircle size={17} />
                  <span>
                    과목명·요일·시간이 맞는지 확인해 주세요. 완전히 잘못 인식된 과목은
                    오른쪽 X로 제외하고, 등록 후 시간표 편집에서 직접 추가해 주세요.
                  </span>
                </ResultNotice>
              )}

              <Results $popoverOpen={openCandidateGroupId !== null}>
                {matches.map((match, matchIndex) => (
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
                      <CandidateField>
                        <CandidateLabel>등록할 분반</CandidateLabel>
                        <SelectWrapper
                          $selected={match.selectedId !== null}
                          $open={openCandidateGroupId === match.group.id}
                          data-candidate-popover="true"
                        >
                          <SelectTrigger
                            type="button"
                            aria-label={`${match.group.title} 분반 선택`}
                            aria-haspopup="listbox"
                            aria-expanded={openCandidateGroupId === match.group.id}
                            onClick={() => {
                              setOpenCandidateGroupId((current) =>
                                current === match.group.id ? null : match.group.id,
                              );
                            }}
                          >
                            <TriggerText $placeholder={match.selectedId === null}>
                              {(() => {
                                const selected = match.candidates.find(
                                  (candidate) => candidate.id === match.selectedId,
                                );
                                return selected
                                  ? `${selected.courseTitle} · ${selected.professor || "교수 미정"} · ${selected.subjectNumber}`
                                  : "분반을 선택해 주세요";
                              })()}
                            </TriggerText>
                          <ChevronDown size={18} />
                          </SelectTrigger>
                          <AnimatePresence>
                            {openCandidateGroupId === match.group.id && (
                            <CandidatePopover
                              role="listbox"
                              $openUpward={matchIndex >= matches.length - 2}
                              initial={{
                                opacity: 0,
                                y: matchIndex >= matches.length - 2 ? 6 : -6,
                                scale: 0.98,
                              }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{
                                opacity: 0,
                                y: matchIndex >= matches.length - 2 ? 4 : -4,
                                scale: 0.985,
                              }}
                              transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                            >
                              {match.candidates.map((candidate) => {
                                const meetingLabel = formatOfferingMeetings(candidate);
                                const selected = match.selectedId === candidate.id;
                                return (
                                  <PopoverOption
                                    key={candidate.id}
                                    type="button"
                                    role="option"
                                    aria-selected={selected}
                                    $selected={selected}
                                    onClick={() => {
                                      setMatches((current) =>
                                        current.map((item) =>
                                          item.group.id === match.group.id
                                            ? { ...item, selectedId: candidate.id }
                                            : item,
                                        ),
                                      );
                                      setOpenCandidateGroupId(null);
                                    }}
                                  >
                                    <PopoverOptionText>
                                      <strong>{candidate.courseTitle}<span>{candidate.professor || "교수 미정"}</span></strong>
                                      <small>수강번호 {candidate.subjectNumber}</small>
                                      {meetingLabel && <em>{meetingLabel}</em>}
                                    </PopoverOptionText>
                                    <OptionCheck $selected={selected}>
                                      {selected && <CheckCircle2 size={16} />}
                                    </OptionCheck>
                                  </PopoverOption>
                                );
                              })}
                            </CandidatePopover>
                            )}
                          </AnimatePresence>
                        </SelectWrapper>
                      </CandidateField>
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
const Body = styled.div`flex: 1; min-height: 0; overflow-y: auto; padding: 8px 20px 28px; box-sizing: border-box; overscroll-behavior: contain; -webkit-overflow-scrolling: touch;`;
const HeaderSection = styled.div`margin-bottom: 18px;`;
const HeaderTitleRow = styled.div`display: flex; align-items: center; justify-content: space-between; gap: 10px;`;
const Title = styled.h2`margin: 0; font-size: 22px; line-height: 30px; color: #191f28; letter-spacing: -.2px;`;
const SemesterBadge = styled.span`flex: 0 0 auto; padding: 6px 9px; border-radius: 999px; background: #eef4ff; color: #0061ff; font-size: 12px; font-weight: 700;`;
const SemesterDescription = styled.p`margin: 6px 0 0; color: #6b7684; font-size: 13px; line-height: 19px; word-break: keep-all;`;
const SupportedSection = styled.section`margin-bottom: 16px;`;
const SectionLabel = styled.div`margin-bottom: 8px; color: #4e5968; font-size: 13px; font-weight: 700;`;
const SupportedGrid = styled.div`display: grid; grid-template-columns: 1fr; gap: 8px;`;
const SupportedItem = styled.div`display: flex; align-items: center; gap: 9px; min-width: 0; padding: 12px; border-radius: 12px; background: #f7f8fa; color: #0061ff; span { display: flex; min-width: 0; flex-direction: column; color: #6b7684; font-size: 11px; line-height: 16px; } strong { color: #333d4b; font-size: 13px; white-space: nowrap; }`;
const SupportedTitleRow = styled.span`display: flex !important; flex-direction: row !important; align-items: center; gap: 6px;`;
const RecommendedBadge = styled.em`padding: 2px 6px; border-radius: 999px; background: #e8f2ff; color: #0061ff; font-size: 9px; line-height: 14px; font-style: normal; font-weight: 700; white-space: nowrap;`;
const HiddenFileInput = styled.input`display: none !important;`;
const UploadButton = styled.button`width: 100%; display: flex; align-items: center; gap: 12px; padding: 15px 16px; border: 1px solid #b8d2ff; border-radius: 14px; background: #f5f9ff; text-align: left; cursor: pointer; transition: background .2s, border-color .2s; &:hover { border-color: #0061ff; background: #eef5ff; } &:disabled { cursor: default; opacity: .65; }`;
const UploadIcon = styled.div`width: 40px; height: 40px; flex: 0 0 40px; display: flex; align-items: center; justify-content: center; border-radius: 12px; background: #0061ff; color: #fff;`;
const UploadText = styled.span`display: flex; min-width: 0; flex-direction: column; gap: 2px; strong { color: #0061ff; font-size: 15px; line-height: 21px; } span { color: #8b95a1; font-size: 12px; line-height: 18px; }`;
const GuideCard = styled.div`margin-top: 16px; padding: 15px 16px; border-radius: 14px; background: #f7f8fa;`;
const GuideTitle = styled.div`display: flex; align-items: center; gap: 7px; margin-bottom: 9px; color: #4e5968; font-size: 14px; font-weight: 700;`;
const GuideList = styled.ul`display: flex; flex-direction: column; gap: 5px; margin: 0; padding-left: 18px; color: #6b7684; font-size: 13px; line-height: 19px; word-break: keep-all;`;
const AnalysisStatus = styled.div`display: flex; align-items: center; gap: 11px; margin-top: 14px; padding: 13px 14px; border-radius: 12px; background: #f7f8fa;`;
const Spinner = styled.div`width: 18px; height: 18px; flex: 0 0 18px; border: 2px solid #d7e6ff; border-top-color: #0061ff; border-radius: 50%; animation: spin .8s linear infinite; @keyframes spin { to { transform: rotate(360deg); } }`;
const AnalysisText = styled.div`display: flex; min-width: 0; flex: 1; flex-direction: column; gap: 7px; strong { overflow: hidden; color: #4e5968; font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }`;
const ProgressTrack = styled.div`height: 4px; overflow: hidden; border-radius: 999px; background: #e5e8eb;`;
const ProgressBar = styled.div<{ $progress: number }>`width: ${({ $progress }) => `${Math.max(4, $progress)}%`}; height: 100%; border-radius: inherit; background: #0061ff; transition: width .2s;`;
const ProgressValue = styled.span`color: #0061ff; font-size: 12px; font-weight: 700;`;
const ResultSummary = styled.div`display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 20px; padding: 14px 15px; border-radius: 14px; background: #f7f8fa;`;
const SummaryText = styled.div`display: flex; flex-direction: column; gap: 2px; strong { color: #333d4b; font-size: 15px; } span { color: #8b95a1; font-size: 12px; }`;
const SummaryBadge = styled.span<{ $completed: boolean }>`display: flex; align-items: center; gap: 5px; padding: 6px 9px; border-radius: 999px; background: ${({ $completed }) => $completed ? "#e8f2ff" : "#fff0f0"}; color: ${({ $completed }) => $completed ? "#0061ff" : "#e5484d"}; font-size: 11px; font-weight: 700; white-space: nowrap;`;
const Results = styled.div<{ $popoverOpen: boolean }>`display: flex; flex-direction: column; gap: 10px; margin-top: 12px; padding-bottom: ${({ $popoverOpen }) => $popoverOpen ? "220px" : "0"}; transition: padding-bottom .2s ease;`;
const ResultCard = styled.div<{ $completed: boolean }>`padding: 15px; border: 1px solid ${({ $completed }) => $completed ? "#b8d2ff" : "#f0caca"}; border-radius: 16px; background: ${({ $completed }) => $completed ? "#f7faff" : "#fffafa"}; box-shadow: 0 2px 8px rgba(0,0,0,.025); transition: border-color .2s, background .2s;`;
const ResultHeader = styled.div`display: flex; align-items: flex-start; justify-content: space-between; gap: 8px;`;
const Detected = styled.div`font-size: 15px; color: #333d4b;`;
const ResultActions = styled.div`display: flex; flex: 0 0 auto; align-items: center; gap: 6px;`;
const SelectionStatus = styled.span<{ $completed: boolean }>`padding: 4px 7px; border-radius: 999px; background: ${({ $completed }) => $completed ? "#e8f2ff" : "#fff0f0"}; color: ${({ $completed }) => $completed ? "#0061ff" : "#e5484d"}; font-size: 11px; font-weight: 700; white-space: nowrap;`;
const RemoveButton = styled.button`flex: 0 0 auto; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; padding: 0; border: 0; border-radius: 8px; background: #f2f4f6; color: #6b7684; cursor: pointer; &:hover { background: #e5e8eb; }`;
const Schedule = styled.div`margin: 5px 0 10px; font-size: 13px; color: #6b7684;`;
const CandidateField = styled.div`display: flex; flex-direction: column; gap: 6px; margin-top: 2px;`;
const CandidateLabel = styled.div`color: #6b7684; font-size: 12px; font-weight: 700;`;
const SelectWrapper = styled.div<{ $selected: boolean; $open: boolean }>`position: relative; z-index: ${({ $open }) => $open ? 30 : 1}; border: 1px solid ${({ $selected }) => $selected ? "#0061ff" : "#d1d6db"}; border-radius: 12px; background: ${({ $selected }) => $selected ? "#f5f9ff" : "#fff"}; color: ${({ $selected }) => $selected ? "#0061ff" : "#6b7684"}; transition: border-color .15s, background .15s;`;
const SelectTrigger = styled.button`width: 100%; min-width: 0; display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 12px 12px 12px 13px; border: 0; border-radius: inherit; outline: 0; background: transparent; color: inherit; font-family: inherit; cursor: pointer; svg { flex: 0 0 auto; transition: transform .15s; } &[aria-expanded="true"] svg { transform: rotate(180deg); }`;
const TriggerText = styled.span<{ $placeholder: boolean }>`min-width: 0; overflow: hidden; color: ${({ $placeholder }) => $placeholder ? "#8b95a1" : "#333d4b"}; font-size: 13px; line-height: 20px; text-align: left; text-overflow: ellipsis; white-space: nowrap;`;
const CandidatePopover = styled(motion.div)<{ $openUpward: boolean }>`position: absolute; left: -1px; right: -1px; top: ${({ $openUpward }) => $openUpward ? "auto" : "calc(100% + 7px)"}; bottom: ${({ $openUpward }) => $openUpward ? "calc(100% + 7px)" : "auto"}; z-index: 24; max-height: 260px; overflow-y: auto; padding: 6px; border: 1px solid #d1d6db; border-radius: 14px; background: #fff; box-shadow: 0 12px 32px rgba(0,0,0,.16); overscroll-behavior: contain; transform-origin: ${({ $openUpward }) => $openUpward ? "bottom center" : "top center"};`;
const PopoverOption = styled.button<{ $selected: boolean }>`width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 11px 10px; border: 0; border-radius: 10px; background: ${({ $selected }) => $selected ? "#eef5ff" : "transparent"}; text-align: left; cursor: pointer; &:hover { background: ${({ $selected }) => $selected ? "#eef5ff" : "#f7f8fa"}; }`;
const PopoverOptionText = styled.span`display: flex; min-width: 0; flex: 1; flex-direction: column; gap: 2px; strong { display: flex; align-items: baseline; gap: 6px; color: #333d4b; font-size: 13px; line-height: 19px; } strong span { color: #6b7684; font-size: 11px; font-weight: 500; } small { color: #8b95a1; font-size: 10px; line-height: 15px; } em { color: #4e5968; font-size: 11px; line-height: 17px; font-style: normal; word-break: keep-all; }`;
const OptionCheck = styled.span<{ $selected: boolean }>`width: 20px; height: 20px; flex: 0 0 20px; display: flex; align-items: center; justify-content: center; color: ${({ $selected }) => $selected ? "#0061ff" : "transparent"};`;
const Warning = styled.div`font-size: 13px; color: #e5484d;`;
const ResultNotice = styled.div`display: flex; align-items: flex-start; gap: 8px; margin-top: 10px; padding: 12px 13px; border-radius: 12px; background: #fff8e8; color: #8a6218; font-size: 12px; line-height: 18px; word-break: keep-all; svg { flex: 0 0 auto; margin-top: 1px; }`;
const ErrorNotice = styled.div`display: flex; align-items: flex-start; gap: 8px; margin-top: 14px; padding: 12px 13px; border-radius: 12px; background: #fff0f0; color: #d93d3d; font-size: 13px; line-height: 19px; svg { flex: 0 0 auto; margin-top: 1px; }`;
const Actions = styled.div`flex: 0 0 auto; display: grid; grid-template-columns: 1fr 2fr; gap: 8px; padding: 12px 20px calc(12px + env(safe-area-inset-bottom, 0px)); border-top: 1px solid #f2f4f6; background: #fff; box-shadow: 0 -8px 20px rgba(0,0,0,.04);`;
const CancelButton = styled.button`padding: 14px; border: 0; border-radius: 12px; background: #f2f4f6; color: #4e5968; font-weight: 600;`;
const SaveButton = styled.button`padding: 14px; border: 0; border-radius: 12px; background: #0061ff; color: #fff; font-weight: 600; &:disabled { background: #d1d6db; }`;
