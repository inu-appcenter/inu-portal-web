import { useState, useMemo, useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import styled from "styled-components";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ImagePlus,
  X,
  Smartphone,
  ImageIcon,
} from "lucide-react";
import { useNavigate, useSearchParams, useBlocker, useBeforeUnload } from "react-router-dom";
import { useHeader } from "@/context/HeaderContext";
import { backHandler } from "@/utils/backHandler";
import Modal from "@/components/common/Modal";
import CapsuleButton from "@/components/common/CapsuleButton";
import { useTimetableStore } from "@/stores/useTimetableStore";
import { useCreateTimeTableCourseItem, useTimeTables } from "@/hooks/useTimeTables";
import { getCourseOfferingsPage, searchCourseOfferings } from "@/apis/courseOfferings";
import type { CourseOffering } from "@/types/courseOfferings";
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

type Match = {
  group: DetectedCourseGroup;
  candidates: CourseOffering[];
  selectedId: number | null;
};

type ViewState = "intro" | "analyzing" | "result";

const DAY_LABEL: Record<string, string> = {
  MONDAY: "월",
  TUESDAY: "화",
  WEDNESDAY: "수",
  THURSDAY: "목",
  FRIDAY: "금",
  SATURDAY: "토",
};

const formatOfferingMeetings = (offering: CourseOffering) =>
  offering.meetings
    .map(
      (meeting) =>
        `${DAY_LABEL[meeting.day] ?? meeting.day} ${meeting.startTime.slice(0, 5)}~${meeting.endTime.slice(0, 5)}`,
    )
    .join(", ");

export default function MobileTimetableImageImportPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useTimeTables();
  const { timetables, activeTimetableId } = useTimetableStore();

  const targetTimetableId = useMemo(() => {
    const paramId = searchParams.get("id");
    if (paramId && !Number.isNaN(Number(paramId))) {
      return Number(paramId);
    }
    return activeTimetableId;
  }, [searchParams, activeTimetableId]);

  const activeTimetable = useMemo(() => {
    return timetables.find((t) => t.id === targetTimetableId) || null;
  }, [timetables, targetTimetableId]);

  const year = activeTimetable?.year ?? new Date().getFullYear();
  const term = activeTimetable?.term ?? "FIRST";
  const existingOfferingIds = useMemo(() => {
    return (
      activeTimetable?.events
        .map((event) => event.courseOfferingId)
        .filter((id): id is number => id !== undefined) ?? []
    );
  }, [activeTimetable]);
  const existingSubjectNumbers = useMemo(() => {
    return (
      activeTimetable?.events
        .map((event) => event.courseId)
        .filter((id): id is string => Boolean(id)) ?? []
    );
  }, [activeTimetable]);

  const inputRef = useRef<HTMLInputElement>(null);
  const [view, setView] = useState<ViewState>("intro");
  const [status, setStatus] = useState("강의 블록을 찾고 있어요.");
  const [progress, setProgress] = useState(0);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [openCandidateGroupId, setOpenCandidateGroupId] = useState<string | null>(null);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [hasPushState, setHasPushState] = useState(false);
  const isSavingRef = useRef(false);

  const createMutation = useCreateTimeTableCourseItem();

  const isOverlayOpen = openCandidateGroupId !== null;

  // 1. Candidate Popover 외부 클릭 닫기
  useEffect(() => {
    if (!openCandidateGroupId) return;
    const closeOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target;
      if (
        target instanceof Element &&
        target.closest('[data-candidate-popover="true"]')
      )
        return;
      setOpenCandidateGroupId(null);
    };
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, [openCandidateGroupId]);

  // 2. Candidate Popover 팝업 시 1회성 pushState 관리
  useEffect(() => {
    if (isOverlayOpen) {
      if (!hasPushState) {
        window.history.pushState({ candidateOverlayOpen: true }, "");
        setHasPushState(true);
      }

      const handlePopState = () => {
        setHasPushState(false);
        setOpenCandidateGroupId(null);
      };

      window.addEventListener("popstate", handlePopState);
      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    } else {
      if (hasPushState) {
        window.history.back();
        setTimeout(() => {
          setHasPushState(false);
        }, 150);
      }
    }
  }, [isOverlayOpen, hasPushState]);

  // 3. 페이지 이탈 방지 (Unsaved Changes)
  const hasChanges = view === "result" && matches.length > 0;
  const shouldBlockNavigation =
    !hasPushState && !isSaving && !isSavingRef.current && hasChanges;
  const blocker = useBlocker(shouldBlockNavigation);

  useEffect(() => {
    if (blocker.state === "blocked" && !isSavingRef.current && !isSaving) {
      setShowUnsavedModal(true);
    }
  }, [blocker.state, isSaving]);

  useBeforeUnload(
    (event) => {
      if (!hasChanges || isSaving) return;
      event.preventDefault();
      event.returnValue = "";
    },
    { capture: true },
  );

  useEffect(() => {
    const handlePageBack = () => {
      if (isSavingRef.current || isSaving) return false;
      if (view === "result" && hasChanges) {
        setShowUnsavedModal(true);
        return true;
      }
      return false;
    };

    if (view === "result" && hasChanges && !isSaving) {
      backHandler.setPageUnsavedChanges(true, handlePageBack);
    } else {
      backHandler.setPageUnsavedChanges(false);
    }

    return () => {
      backHandler.setPageUnsavedChanges(false);
    };
  }, [view, hasChanges, isSaving]);

  const handleHeaderBack = () => {
    if (view === "result" && hasChanges) {
      setShowUnsavedModal(true);
    } else if (view === "analyzing") {
      setView("intro");
    } else {
      navigate(-1);
    }
  };

  useHeader({
    title: "시간표 이미지로 등록",
    hasback: true,
    showAlarm: false,
    onBack: handleHeaderBack,
    pageBgColor: "var(--bg-subtle, #f8f9fb)",
  });

  const handleStayOnPage = () => {
    setShowUnsavedModal(false);
    if (blocker.state === "blocked") {
      blocker.reset();
    }
  };

  const handleLeaveWithoutSaving = () => {
    setShowUnsavedModal(false);
    backHandler.setPageUnsavedChanges(false);

    if (blocker.state === "blocked") {
      blocker.proceed();
      return;
    }

    isSavingRef.current = true;
    flushSync(() => {
      setIsSaving(true);
    });

    if (
      window.AndroidBridge &&
      typeof window.AndroidBridge.goBack === "function"
    ) {
      window.AndroidBridge.goBack();
    } else {
      navigate(-1);
    }
  };

  // OCR 분석 실행 로직
  const analyze = async (file: File) => {
    setView("analyzing");
    setMatches([]);
    setProgress(0);
    setStatus("강의 블록을 찾고 있어요.");
    try {
      let detectedBlocks: Awaited<ReturnType<typeof detectTimetableBlocks>> = [];
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("kor+eng", 1, {
        logger: (message) => {
          if (message.status === "recognizing text") {
            setProgress(Math.round(message.progress * 100));
          }
        },
      });
      try {
        setStatus("시간표 이미지 형식을 확인하고 있어요.");
        const fullImageResult = await worker.recognize(file);
        const subjectNumbers = extractBracketedSubjectNumbers(fullImageResult.data.text);

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
              selectedId:
                existingOfferingIds.includes(offering.id) ||
                existingSubjectNumbers.includes(offering.subjectNumber)
                  ? null
                  : offering.id,
            });
          }
          setMatches(numberMatches);
          setView("result");
          return;
        }

        const layout = detectTimetableImageLayout(fullImageResult.data.text);
        detectedBlocks = await detectTimetableBlocks(file, layout);
        if (!detectedBlocks.length) {
          throw new Error("분석 가능한 강의 정보를 찾지 못했습니다.");
        }
        for (let index = 0; index < detectedBlocks.length; index += 1) {
          setStatus(`강의 글자를 읽고 있어요. (${index + 1}/${detectedBlocks.length})`);
          const result = await worker.recognize(detectedBlocks[index].crop);
          detectedBlocks[index].rawText = result.data.text.trim();
          detectedBlocks[index].confidence = result.data.confidence;
        }
      } finally {
        await worker.terminate();
      }

      const groups = parseAndGroupBlocks(detectedBlocks);
      setStatus("개설 강좌와 비교하고 있어요.");
      const preliminaryMatches: Match[] = [];
      for (const group of groups) {
        const keywords = [
          ...new Set([
            group.title,
            group.professor,
            group.title.replace(/\s/g, "").slice(0, 2),
          ]),
        ].filter((keyword) => keyword.length >= 2);
        const candidateMap = new Map<number, CourseOffering>();
        for (const keyword of keywords) {
          const found = await searchCourseOfferings(year, term, keyword);
          found.forEach((offering) => candidateMap.set(offering.id, offering));
          if (candidateMap.size >= 10) break;
        }
        const meetingPage = await getCourseOfferingsPage(year, term, 0, 50, {
          meetingFilterMode: "HAS_CLASS",
          meetings: group.blocks.map(
            (block) => `${block.day}|${block.startTime}|${block.endTime}`,
          ),
        });
        meetingPage.content.forEach((offering) =>
          candidateMap.set(offering.id, offering),
        );
        const candidates = [...candidateMap.values()]
          .filter((offering) => !existingOfferingIds.includes(offering.id))
          .map((offering) => ({ offering, score: scoreOffering(group, offering) }))
          .sort((a, b) => b.score - a.score)
          .map(({ offering }) => offering);
        preliminaryMatches.push({ group, candidates, selectedId: null });
      }

      const merged = new Map<string, Match>();
      preliminaryMatches.forEach((match) => {
        const fragmentCandidates = match.candidates.filter((offering) =>
          isOfferingFragmentMatch(match.group, offering),
        );
        const offering =
          fragmentCandidates.length === 1
            ? fragmentCandidates[0]
            : findConfidentOffering(match.group, match.candidates);
        const mergeKey = offering ? `offering-${offering.id}` : `ocr-${match.group.id}`;
        const current = merged.get(mergeKey);
        if (current) {
          current.group.blocks.push(...match.group.blocks);
          match.candidates.forEach((candidate) => {
            if (!current.candidates.some((item) => item.id === candidate.id))
              current.candidates.push(candidate);
          });
        } else {
          merged.set(mergeKey, {
            group: offering
              ? {
                  ...match.group,
                  title: offering.courseTitle,
                  professor: offering.professor ?? match.group.professor,
                }
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
      setView("result");
    } catch (error) {
      alert(error instanceof Error ? error.message : "이미지 분석에 실패했습니다.");
      setView("intro");
    }
  };

  const handleSave = async () => {
    if (!targetTimetableId) {
      alert("등록할 시간표를 찾을 수 없습니다.");
      return;
    }
    if (!matches.length || matches.some((match) => match.selectedId === null)) {
      alert("모든 항목의 분반을 선택하거나 불필요한 항목을 제외해 주세요.");
      return;
    }
    const selectedOfferings = matches
      .map((match) =>
        match.candidates.find((candidate) => candidate.id === match.selectedId),
      )
      .filter((offering): offering is CourseOffering => offering !== undefined);

    const uniqueOfferings = [
      ...new Map(
        selectedOfferings.map((offering) => [
          offering.subjectNumber || `id-${offering.id}`,
          offering,
        ]),
      ).values(),
    ].filter(
      (offering) =>
        !existingOfferingIds.includes(offering.id) &&
        !existingSubjectNumbers.includes(offering.subjectNumber),
    );

    if (!uniqueOfferings.length) {
      alert("선택한 강의는 이미 시간표에 등록되어 있습니다.");
      return;
    }

    setIsSaving(true);
    isSavingRef.current = true;
    let addedCount = 0;
    let skippedCount = selectedOfferings.length - uniqueOfferings.length;
    try {
      for (const offering of uniqueOfferings) {
        try {
          await createMutation.mutateAsync({
            timeTableId: targetTimetableId,
            body: { courseOfferingId: offering.id },
          });
          addedCount += 1;
        } catch (error: any) {
          const status = error.response?.status;
          const message = String(
            error.response?.data?.msg ??
              error.response?.data?.message ??
              error.message ??
              "",
          );
          if (
            status === 409 ||
            message.includes("중복") ||
            message.includes("동일") ||
            message.includes("이미") ||
            message.includes("존재") ||
            message.includes("충돌")
          ) {
            skippedCount += 1;
            continue;
          }
          throw error;
        }
      }

      backHandler.setPageUnsavedChanges(false);
      setShowUnsavedModal(false);
      isSavingRef.current = true;
      flushSync(() => {
        setIsSaving(true);
      });

      if (addedCount > 0) {
        const skippedMessage =
          skippedCount > 0
            ? ` 이미 등록되었거나 시간이 겹치는 ${skippedCount}개는 제외했습니다.`
            : "";
        alert(`${addedCount}개 강의를 시간표에 추가했습니다.${skippedMessage}`);
        navigate(-1);
        return;
      }

      if (skippedCount > 0) {
        alert(
          "선택한 강의가 이미 시간표에 등록되어 있거나 시간이 겹쳐 추가되지 않았습니다.",
        );
        navigate(-1);
        return;
      }

      alert("추가할 수 있는 강의가 없습니다.");
      isSavingRef.current = false;
      setIsSaving(false);
    } catch (error: any) {
      alert(
        error.response?.data?.msg ||
          error.message ||
          "일부 강의를 추가하지 못했습니다.",
      );
      if (addedCount > 0) {
        backHandler.setPageUnsavedChanges(false);
        setShowUnsavedModal(false);
        isSavingRef.current = true;
        flushSync(() => {
          setIsSaving(true);
        });
        navigate(-1);
        return;
      }
      isSavingRef.current = false;
      setIsSaving(false);
    }
  };

  const isSelectionComplete =
    matches.length > 0 && matches.every((match) => match.selectedId !== null);

  return (
    <PageWrapper>
      <HiddenFileInput
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void analyze(file);
          event.currentTarget.value = "";
        }}
      />

      <ScrollContent>
        {view === "intro" && (
          <IntroContainer>
            <Headline>
              {"사진 속 강의를 인식해\n현재 시간표에 등록할 수 있어요."}
            </Headline>

            <DropzoneCard
              type="button"
              onClick={() => inputRef.current?.click()}
            >
              <DropzoneHeader>
                <IconBox>
                  <ImagePlus size={22} color="#ffffff" />
                </IconBox>
                <DropzoneTextGroup>
                  <DropzoneTitle>시간표 이미지 선택하기</DropzoneTitle>
                  <DropzoneSubtitle>
                    PNG, JPG 등 휴대폰 캡처 이미지를 선택해 주세요.
                  </DropzoneSubtitle>
                </DropzoneTextGroup>
              </DropzoneHeader>

              <SampleImageWrapper>
                {/* 추후 /images/timetable/image-import-sample.png 등의 에셋이 들어갈 영역 */}
                <SamplePlaceholder>
                  <ImageIcon size={36} color="#93c5fd" />
                  <span>시간표 캡처 이미지 예시</span>
                </SamplePlaceholder>
              </SampleImageWrapper>
            </DropzoneCard>

            <GuideSection>
              <GuideSectionTitle>이런 화면이 잘 인식돼요</GuideSectionTitle>
              <GuideCard>
                <GuideItem>
                  <GuideItemLeft>
                    <GuideItemTitleRow>
                      <GuideItemTitle>인천대학교 수강신청 앱</GuideItemTitle>
                      <AccuracyBadge>가장 정확해요</AccuracyBadge>
                    </GuideItemTitleRow>
                    <GuideItemSubtitle>수강신청 앱 내역 화면 (권장)</GuideItemSubtitle>
                  </GuideItemLeft>
                  <AppIconSlot>
                    {/* 수강신청 앱 아이콘 에셋 placeholder */}
                    <Smartphone size={22} color="#0061ff" />
                  </AppIconSlot>
                </GuideItem>

                <GuideDivider />

                <GuideItem>
                  <GuideItemLeft>
                    <GuideItemTitle>에브리타임</GuideItemTitle>
                    <GuideItemSubtitle>시간표 전체 화면</GuideItemSubtitle>
                  </GuideItemLeft>
                  <AppIconSlot>
                    <Smartphone size={22} color="#6b7684" />
                  </AppIconSlot>
                </GuideItem>
              </GuideCard>
            </GuideSection>
          </IntroContainer>
        )}

        {view === "analyzing" && (
          <AnalyzingContainer>
            <AnalyzingCenterCard>
              <AnalyzingStatusText>{status}</AnalyzingStatusText>
              <ProgressTrack>
                <ProgressBar $progress={progress} />
              </ProgressTrack>
              <ProgressPercent>{progress}%</ProgressPercent>
            </AnalyzingCenterCard>
          </AnalyzingContainer>
        )}

        {view === "result" && (
          <ResultContainer $popoverOpen={openCandidateGroupId !== null}>
            <ResultHeaderRow>
              <ResultTitle>분석 결과 {matches.length}개</ResultTitle>
              <ResultStatusBadge $completed={isSelectionComplete}>
                {isSelectionComplete ? (
                  <CheckCircle2 size={14} />
                ) : (
                  <AlertCircle size={14} />
                )}
                <span>{isSelectionComplete ? "선택 완료" : "분반 확인 필요"}</span>
              </ResultStatusBadge>
            </ResultHeaderRow>

            <ResultDescription>
              {
                "과목명·요일·시간을 확인해 주세요.\n완전히 잘못 인식된 과목은 X를 눌러 제외하고, 등록 후 시간표 편집에서 직접 추가해 주세요."
              }
            </ResultDescription>

            <ResultCardsList>
              {matches.map((match, matchIndex) => {
                const isCardCompleted = match.selectedId !== null;
                const selectedOffering = match.candidates.find(
                  (c) => c.id === match.selectedId,
                );
                const displayTitle =
                  selectedOffering?.courseTitle ??
                  findUniqueTitleOffering(match.group.title, match.candidates)
                    ?.courseTitle ??
                  match.group.title;
                const displayProfessor =
                  selectedOffering?.professor ??
                  (match.group.professor || "교수 미정");

                return (
                  <ResultCard key={match.group.id} $completed={isCardCompleted}>
                    <CardHeaderRow>
                      <CardTitleGroup>
                        <CardCourseTitle>{displayTitle}</CardCourseTitle>
                        <CardDot>·</CardDot>
                        <CardProfessor>{displayProfessor}</CardProfessor>
                      </CardTitleGroup>

                      <CardActionGroup>
                        <CardStatusBadge $completed={isCardCompleted}>
                          {isCardCompleted ? "선택 완료" : "선택 필요"}
                        </CardStatusBadge>
                        <RemoveButton
                          type="button"
                          aria-label={`${match.group.title} 제외`}
                          onClick={() => {
                            setMatches((prev) =>
                              prev.filter((m) => m.group.id !== match.group.id),
                            );
                          }}
                        >
                          <X size={18} />
                        </RemoveButton>
                      </CardActionGroup>
                    </CardHeaderRow>

                    <CardScheduleText>
                      {match.group.blocks
                        .map(
                          (block) =>
                            `${DAY_LABEL[block.day] ?? block.day} ${block.startTime}~${block.endTime}`,
                        )
                        .join(", ")}
                    </CardScheduleText>

                    {match.candidates.length > 0 ? (
                      <CandidateField>
                        <CandidateLabel>등록할 분반</CandidateLabel>
                        <SelectWrapper
                          $selected={isCardCompleted}
                          $open={openCandidateGroupId === match.group.id}
                          data-candidate-popover="true"
                        >
                          <SelectTrigger
                            type="button"
                            aria-expanded={openCandidateGroupId === match.group.id}
                            onClick={() => {
                              setOpenCandidateGroupId((current) =>
                                current === match.group.id ? null : match.group.id,
                              );
                            }}
                          >
                            <TriggerText $placeholder={!isCardCompleted}>
                              {selectedOffering
                                ? `${selectedOffering.courseTitle} · ${selectedOffering.professor || "교수 미정"} · ${selectedOffering.subjectNumber}`
                                : "분반을 선택해 주세요"}
                            </TriggerText>
                            <ChevronDown
                              size={18}
                              color={isCardCompleted ? "#0061ff" : "#e5484d"}
                            />
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
                                transition={{
                                  duration: 0.16,
                                  ease: [0.22, 1, 0.36, 1],
                                }}
                              >
                                {match.candidates.map((candidate) => {
                                  const meetingLabel = formatOfferingMeetings(candidate);
                                  const isSelected = match.selectedId === candidate.id;
                                  return (
                                    <PopoverOption
                                      key={candidate.id}
                                      type="button"
                                      role="option"
                                      aria-selected={isSelected}
                                      $selected={isSelected}
                                      onClick={() => {
                                        setMatches((current) =>
                                          current.map((item) =>
                                            item.group.id === match.group.id
                                              ? {
                                                  ...item,
                                                  selectedId: candidate.id,
                                                }
                                              : item,
                                          ),
                                        );
                                        setOpenCandidateGroupId(null);
                                      }}
                                    >
                                      <PopoverOptionText>
                                        <strong>
                                          {candidate.courseTitle}
                                          <span>{candidate.professor || "교수 미정"}</span>
                                        </strong>
                                        <small>수강번호 {candidate.subjectNumber}</small>
                                        {meetingLabel && <em>{meetingLabel}</em>}
                                      </PopoverOptionText>
                                      <OptionCheck $selected={isSelected}>
                                        {isSelected && <CheckCircle2 size={16} />}
                                      </OptionCheck>
                                    </PopoverOption>
                                  );
                                })}
                              </CandidatePopover>
                            )}
                          </AnimatePresence>
                        </SelectWrapper>
                      </CandidateField>
                    ) : (
                      <WarningText>일치하는 개설 강좌를 찾지 못했습니다.</WarningText>
                    )}
                  </ResultCard>
                );
              })}
            </ResultCardsList>
          </ResultContainer>
        )}
      </ScrollContent>

      {/* 하단 고정 액션바 */}
      <FixedBottomArea>
        <FixedBottomContent>
          {view !== "result" && (
            <SecurityCaption>
              이미지는 서버에 저장하지 않고 기기에서만 분석해요
            </SecurityCaption>
          )}
          <FixedButtonRow>
            <CancelBottomButton
              variant="secondary"
              onClick={handleHeaderBack}
              disabled={isSaving}
            >
              취소
            </CancelBottomButton>

            {view === "intro" && (
              <PrimaryBottomButton
                variant="primary"
                onClick={() => inputRef.current?.click()}
              >
                이미지 선택
              </PrimaryBottomButton>
            )}

            {view === "analyzing" && (
              <PrimaryBottomButton variant="primary" disabled loading>
                분석 중...
              </PrimaryBottomButton>
            )}

            {view === "result" && (
              <PrimaryBottomButton
                variant="primary"
                onClick={handleSave}
                disabled={!isSelectionComplete || isSaving}
                loading={isSaving}
              >
                {isSaving
                  ? "등록 중..."
                  : isSelectionComplete
                    ? "선택 강의 등록"
                    : "모든 분반을 선택해 주세요"}
              </PrimaryBottomButton>
            )}
          </FixedButtonRow>
        </FixedBottomContent>
      </FixedBottomArea>

      {/* 미저장 이탈 확인 모달 */}
      <Modal
        isOpen={showUnsavedModal}
        onClose={handleStayOnPage}
        title="시간표 등록 취소"
        description="분석된 시간표 정보가 있습니다. 등록하지 않고 나갈까요?"
        primaryButton={{
          text: "나가기",
          onClick: handleLeaveWithoutSaving,
          variant: "danger",
        }}
        secondaryButton={{
          text: "계속 진행",
          onClick: handleStayOnPage,
        }}
      />
    </PageWrapper>
  );
}

// --- styled-components ---

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--header-height, 56px));
  width: 100%;
  box-sizing: border-box;
  background-color: var(--bg-subtle, #f8f9fb);
  position: relative;
  overflow: hidden;
`;

const ScrollContent = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 24px 16px 140px;
  -webkit-overflow-scrolling: touch;
`;

const HiddenFileInput = styled.input`
  display: none !important;
`;

// --- Intro Styles ---

const IntroContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Headline = styled.h1`
  font-family: Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  font-weight: 600;
  font-size: 20px;
  line-height: 32px;
  color: var(--text-primary, #191f28);
  margin: 0;
  white-space: pre-line;
`;

const DropzoneCard = styled.button`
  width: 100%;
  border: 1.5px dashed #0061ff;
  border-radius: 20px;
  background: #f8faff;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  cursor: pointer;
  box-sizing: border-box;
  text-align: left;
  transition: background 0.2s, border-color 0.2s;

  &:hover {
    background: #f0f5ff;
  }
`;

const DropzoneHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const IconBox = styled.div`
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 12px;
  background: #0061ff;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DropzoneTextGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const DropzoneTitle = styled.div`
  font-family: Pretendard;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
  color: #0061ff;
`;

const DropzoneSubtitle = styled.div`
  font-family: Pretendard;
  font-weight: 400;
  font-size: 12px;
  line-height: 18px;
  color: #8b95a1;
`;

const SampleImageWrapper = styled.div`
  width: 100%;
  height: 140px;
  border-radius: 14px;
  background: #edf3fe;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const SamplePlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;

  span {
    font-size: 12px;
    color: #8b95a1;
  }
`;

const GuideSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const GuideSectionTitle = styled.h2`
  font-family: Pretendard;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
  color: #333d4b;
  margin: 0;
`;

const GuideCard = styled.div`
  background: #ffffff;
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const GuideItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const GuideItemLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const GuideItemTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const GuideItemTitle = styled.span`
  font-family: Pretendard;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: #333d4b;
`;

const AccuracyBadge = styled.span`
  padding: 2px 6px;
  border-radius: 999px;
  background: #e8f2ff;
  color: #0061ff;
  font-size: 10px;
  font-weight: 700;
  line-height: 14px;
`;

const GuideItemSubtitle = styled.span`
  font-family: Pretendard;
  font-weight: 400;
  font-size: 12px;
  line-height: 18px;
  color: #8b95a1;
`;

const GuideDivider = styled.div`
  height: 1px;
  background: var(--border-default, #f1f3f5);
  width: 100%;
`;

const AppIconSlot = styled.div`
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 10px;
  background: #f1f3f5;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// --- Analyzing Styles ---

const AnalyzingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  height: 100%;
`;

const AnalyzingCenterCard = styled.div`
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 32px 16px;
`;

const AnalyzingStatusText = styled.div`
  font-family: Pretendard;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
  color: #333d4b;
  text-align: center;
`;

const ProgressTrack = styled.div`
  width: 100%;
  height: 8px;
  border-radius: 999px;
  background: #e5e8eb;
  overflow: hidden;
`;

const ProgressBar = styled.div<{ $progress: number }>`
  width: ${({ $progress }) => `${Math.max(4, $progress)}%`};
  height: 100%;
  border-radius: inherit;
  background: #0061ff;
  transition: width 0.2s ease;
`;

const ProgressPercent = styled.div`
  font-family: Pretendard;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
  color: #0061ff;
  text-align: center;
`;

// --- Result Styles ---

const ResultContainer = styled.div<{ $popoverOpen: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: ${({ $popoverOpen }) => ($popoverOpen ? "200px" : "0")};
  transition: padding-bottom 0.2s ease;
`;

const ResultHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const ResultTitle = styled.h2`
  font-family: Pretendard;
  font-weight: 600;
  font-size: 20px;
  line-height: 32px;
  color: #191f28;
  margin: 0;
`;

const ResultStatusBadge = styled.div<{ $completed: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  background: ${({ $completed }) => ($completed ? "#e8f2ff" : "#fff0f0")};
  border: 1px solid ${({ $completed }) => ($completed ? "#d3e5ff" : "#ffd5d5")};
  color: ${({ $completed }) => ($completed ? "#0061ff" : "#e5484d")};
`;

const ResultDescription = styled.p`
  margin: 0;
  font-family: Pretendard;
  font-weight: 400;
  font-size: 13px;
  line-height: 20px;
  color: #6b7684;
  white-space: pre-line;
  word-break: keep-all;
`;

const ResultCardsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 4px;
`;

const ResultCard = styled.div<{ $completed: boolean }>`
  padding: 16px;
  border-radius: 16px;
  background: ${({ $completed }) => ($completed ? "#ffffff" : "#fffafa")};
  border: 1px solid ${({ $completed }) => ($completed ? "#d3e5ff" : "#fecaca")};
  box-sizing: border-box;
  transition: background 0.2s, border-color 0.2s;
`;

const CardHeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
`;

const CardTitleGroup = styled.div`
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 4px;
  min-width: 0;
`;

const CardCourseTitle = styled.span`
  font-family: Pretendard;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
  color: #191f28;
`;

const CardDot = styled.span`
  color: #6b7684;
  font-size: 14px;
`;

const CardProfessor = styled.span`
  font-family: Pretendard;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: #6b7684;
`;

const CardActionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
`;

const CardStatusBadge = styled.span<{ $completed: boolean }>`
  padding: 3px 6px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  background: ${({ $completed }) => ($completed ? "#e8f2ff" : "#fff0f0")};
  color: ${({ $completed }) => ($completed ? "#0061ff" : "#e5484d")};
  white-space: nowrap;
`;

const RemoveButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #f1f3f5;
  color: #8b95a1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: #e5e8eb;
    color: #4e5968;
  }
`;

const CardScheduleText = styled.div`
  font-family: Pretendard;
  font-weight: 400;
  font-size: 13px;
  line-height: 19px;
  color: #6b7684;
  margin: 6px 0 12px;
`;

const CandidateField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const CandidateLabel = styled.div`
  font-family: Pretendard;
  font-weight: 500;
  font-size: 12px;
  line-height: 18px;
  color: #6b7684;
`;

const SelectWrapper = styled.div<{ $selected: boolean; $open: boolean }>`
  position: relative;
  z-index: ${({ $open }) => ($open ? 30 : 1)};
  border: 1px solid ${({ $selected }) => ($selected ? "#0061ff" : "#fca5a5")};
  border-radius: 12px;
  background: ${({ $selected }) => ($selected ? "#f5f9ff" : "#ffffff")};
`;

const SelectTrigger = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 14px;
  border: 0;
  background: transparent;
  cursor: pointer;
`;

const TriggerText = styled.span<{ $placeholder: boolean }>`
  font-family: Pretendard;
  font-weight: 500;
  font-size: 13px;
  line-height: 20px;
  color: ${({ $placeholder }) => ($placeholder ? "#e5484d" : "#191f28")};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
`;

const CandidatePopover = styled(motion.div)<{ $openUpward: boolean }>`
  position: absolute;
  left: -1px;
  right: -1px;
  top: ${({ $openUpward }) => ($openUpward ? "auto" : "calc(100% + 6px)")};
  bottom: ${({ $openUpward }) => ($openUpward ? "calc(100% + 6px)" : "auto")};
  z-index: 40;
  max-height: 240px;
  overflow-y: auto;
  padding: 6px;
  border: 1px solid #d1d6db;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.16);
  overscroll-behavior: contain;
`;

const PopoverOption = styled.button<{ $selected: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px;
  border-radius: 10px;
  background: ${({ $selected }) => ($selected ? "#e8f2ff" : "transparent")};
  cursor: pointer;

  &:hover {
    background: ${({ $selected }) => ($selected ? "#e8f2ff" : "#f8f9fb")};
  }
`;

const PopoverOptionText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  text-align: left;

  strong {
    display: flex;
    align-items: baseline;
    gap: 6px;
    font-size: 13px;
    color: #191f28;

    span {
      font-size: 11px;
      color: #6b7684;
      font-weight: 500;
    }
  }

  small {
    font-size: 11px;
    color: #8b95a1;
  }

  em {
    font-style: normal;
    font-size: 11px;
    color: #4e5968;
  }
`;

const OptionCheck = styled.div<{ $selected: boolean }>`
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $selected }) => ($selected ? "#0061ff" : "transparent")};
`;

const WarningText = styled.div`
  font-size: 13px;
  color: #e5484d;
`;

// --- Fixed Bottom Area ---

const FixedBottomArea = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  background: linear-gradient(
    180deg,
    rgba(248, 249, 251, 0) 0%,
    rgba(248, 249, 251, 0.9) 24%,
    rgba(248, 249, 251, 1) 100%
  );
  z-index: 100;
  pointer-events: none;
`;

const FixedBottomContent = styled.div`
  width: 100%;
  max-width: 768px;
  margin: 0 auto;
  padding: 12px 16px calc(16px + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: auto;
`;

const SecurityCaption = styled.div`
  font-family: Pretendard;
  font-weight: 400;
  font-size: 12px;
  line-height: 18px;
  color: #8b95a1;
  text-align: center;
`;

const FixedButtonRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
`;

const CancelBottomButton = styled(CapsuleButton)`
  width: 120px;
  height: 56px;
  min-height: 56px;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 600;
`;

const PrimaryBottomButton = styled(CapsuleButton)`
  flex: 1;
  height: 56px;
  min-height: 56px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
`;
