import { useState, useMemo, useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import styled from "styled-components";
import { AnimatePresence, motion } from "framer-motion";
import {
  ImagePlus,
  Pencil,
  Search,
  Clock,
  User,
  BookOpen,
  Calendar,
  ChevronDown,
  Check,
} from "lucide-react";
import Icon from "@/components/common/Icon";
import { useNavigate, useSearchParams, useBlocker } from "react-router-dom";
import { useHeader } from "@/context/HeaderContext";
import { backHandler } from "@/utils/backHandler";
import Modal from "@/components/common/Modal";
import CapsuleButton from "@/components/common/CapsuleButton";
import BottomSheet from "@/components/common/BottomSheet";
import { useTimetableStore } from "@/stores/useTimetableStore";
import { TERM_LABELS } from "@/utils/semester";
import {
  useCreateTimeTableCourseItem,
  useTimeTables,
} from "@/hooks/useTimeTables";
import { recognizeTimeTableImage } from "@/apis/timetables";
import {
  getCourseOfferingsPage,
  searchCourseOfferings,
} from "@/apis/courseOfferings";
import type { CourseOffering } from "@/types/courseOfferings";
import type { Term, TimeTableDay } from "@/types/timetables";
import {
  sugangAppLogo as sugangAppLogoSvg,
  sampleImagePicker as timetableSampleWebp,
} from "@/resources/assets/illustrations/timetable";
import {
  findUniqueTitleOffering,
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

const getTimetableCredits = (events: any[]) => {
  const seenItemIds = new Set<number>();
  return events.reduce((total, item) => {
    if (item.itemId) {
      if (seenItemIds.has(item.itemId)) return total;
      seenItemIds.add(item.itemId);
    }
    const credits = item.credits || 0;
    return credits > 0 ? total + credits : total;
  }, 0);
};

export default function MobileTimetableImageImportPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useTimeTables();
  const { timetables, activeTimetableId, setActiveTimetable, setSemester } =
    useTimetableStore();

  const [isTimetableSheetOpen, setIsTimetableSheetOpen] = useState(false);

  const groupedTimetables = useMemo(() => {
    const map = new Map<string, typeof timetables>();
    timetables.forEach((t) => {
      const list = map.get(t.semester) || [];
      list.push(t);
      map.set(t.semester, list);
    });
    return map;
  }, [timetables]);

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
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [openCandidateGroupId, setOpenCandidateGroupId] = useState<
    string | null
  >(null);
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
    return () =>
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
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

  // Vision AI 분석 실행 로직
  const analyze = async (file: File) => {
    setView("analyzing");
    setMatches([]);
    setProgress(15);
    setStatus("횃불이가 열심히 분석하고 있어요.");

    let progressTimer: ReturnType<typeof setInterval> | null = null;
    try {
      progressTimer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 85) return prev;
          return prev + 5;
        });
      }, 400);

      const recognized = await recognizeTimeTableImage(file, year, term);
      if (progressTimer) clearInterval(progressTimer);

      setProgress(90);

      if (!recognized || recognized.length === 0) {
        throw new Error("분석 가능한 강의 정보를 찾지 못했습니다.");
      }

      const dummyCanvas = document.createElement("canvas");
      const nextMatches: Match[] = recognized.map((item, index) => {
        const group: DetectedCourseGroup = {
          id: `vision-${index}`,
          title: item.title,
          professor: item.professor || "",
          rawText: [item.title, item.professor, item.classroom, item.subjectNumber]
            .filter(Boolean)
            .join(" "),
          blocks: (item.meetings || []).map((m, mIdx) => ({
            id: `vision-${index}-${mIdx}`,
            crop: dummyCanvas,
            day: m.day,
            startTime: m.startTime,
            endTime: m.endTime,
            rawText: m.classroom || item.classroom || "",
            confidence: 100,
          })),
        };

        const candidates = item.candidates || [];
        let selectedId = item.recommendedOfferingId;

        // 추천 ID가 없더라도 매칭된 후보가 단 1개뿐인 경우 자동 선택
        if (!selectedId && candidates.length === 1) {
          selectedId = candidates[0].id;
        }

        return {
          group,
          candidates,
          selectedId,
        };
      });

      setProgress(100);
      setMatches(nextMatches);
      setView("result");
    } catch (error) {
      if (progressTimer) clearInterval(progressTimer);
      alert(
        error instanceof Error ? error.message : "이미지 분석에 실패했습니다.",
      );
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

  const handleSelectOffering = (matchId: string, offering: CourseOffering) => {
    setMatches((prev) =>
      prev.map((match) => {
        if (match.group.id !== matchId) return match;
        return {
          ...match,
          selectedId: offering.id,
          candidates: [
            offering,
            ...match.candidates.filter((c) => c.id !== offering.id),
          ],
          group: {
            ...match.group,
            title: offering.courseTitle,
            professor: offering.professor ?? match.group.professor,
          },
        };
      }),
    );
    setEditingMatch(null);
  };

  const handleSaveManual = (
    matchId: string,
    title: string,
    professor: string,
    day: TimeTableDay,
    startTime: string,
    endTime: string,
  ) => {
    setMatches((prev) =>
      prev.map((match) => {
        if (match.group.id !== matchId) return match;
        const updatedBlocks = match.group.blocks.map((b, i) =>
          i === 0 ? { ...b, day, startTime, endTime } : b,
        );
        return {
          ...match,
          group: {
            ...match.group,
            title: title || match.group.title,
            professor,
            blocks: updatedBlocks,
          },
        };
      }),
    );
    setEditingMatch(null);
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
            <HeadlineGroup>
              <Headline>
                {"사진 속 강의를 인식해\n현재 시간표에 등록할 수 있어요."}
              </Headline>
              <TargetTimetableBadge
                type="button"
                onClick={() => setIsTimetableSheetOpen(true)}
              >
                <Calendar className="calendar" size={15} />
                <span>
                  {year}년 {TERM_LABELS[term]} · {activeTimetable?.name ?? "기본 시간표"}
                </span>
                <ChevronDown className="chevron" size={14} />
              </TargetTimetableBadge>
            </HeadlineGroup>

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
                <SampleImage
                  src={timetableSampleWebp}
                  alt="시간표 캡처 이미지 예시"
                />
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
                    <GuideItemSubtitle>
                      수강신청 앱 내역 화면 (권장)
                    </GuideItemSubtitle>
                  </GuideItemLeft>
                  <AppIconImg src={sugangAppLogoSvg} alt="수강신청 앱 로고" />
                </GuideItem>

                <GuideDivider />

                <GuideItem>
                  <GuideItemLeft>
                    <GuideItemTitle>에브리타임</GuideItemTitle>
                    <GuideItemSubtitle>시간표 전체 화면</GuideItemSubtitle>
                  </GuideItemLeft>
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
                  <Icon name="circle-check" size={14} />
                ) : (
                  <Icon name="circle-warning" size={14} />
                )}
                <span>
                  {isSelectionComplete ? "선택 완료" : "분반 확인 필요"}
                </span>
              </ResultStatusBadge>
            </ResultHeaderRow>

            <ResultDescription>
              {
                "과목명·요일·시간을 확인해 주세요.\n글자가 잘못 인식되었거나 분반 목록에 없는 경우, 연필(✏️) 버튼을 눌러 과목명을 수정하거나 분반을 검색해 보세요."
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
                const displaySchedule = (() => {
                  if (selectedOffering) {
                    if (
                      selectedOffering.meetings &&
                      selectedOffering.meetings.length > 0
                    ) {
                      return formatOfferingMeetings(selectedOffering);
                    }
                    return "시간 미지정";
                  }
                  if (match.group.blocks && match.group.blocks.length > 0) {
                    const text = match.group.blocks
                      .filter((b) => b.startTime && b.endTime)
                      .map(
                        (block) =>
                          `${DAY_LABEL[block.day] ?? block.day} ${block.startTime}~${block.endTime}`,
                      )
                      .join(", ");
                    if (text) return text;
                  }
                  return "시간 미지정";
                })();

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
                        <EditButton
                          type="button"
                          aria-label={`${match.group.title} 정보 수정 및 분반 검색`}
                          onClick={() => setEditingMatch(match)}
                        >
                          <Pencil size={14} />
                        </EditButton>
                        <RemoveButton
                          type="button"
                          aria-label={`${match.group.title} 제외`}
                          onClick={() => {
                            setMatches((prev) =>
                              prev.filter((m) => m.group.id !== match.group.id),
                            );
                          }}
                        >
                          <Icon name="close-md" size={18} />
                        </RemoveButton>
                      </CardActionGroup>
                    </CardHeaderRow>

                    <CardScheduleText>
                      {displaySchedule}
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
                            aria-expanded={
                              openCandidateGroupId === match.group.id
                            }
                            onClick={() => {
                              setOpenCandidateGroupId((current) =>
                                current === match.group.id
                                  ? null
                                  : match.group.id,
                              );
                            }}
                          >
                            <TriggerText $placeholder={!isCardCompleted}>
                              {selectedOffering
                                ? `${selectedOffering.courseTitle} · ${selectedOffering.professor || "교수 미정"} · ${selectedOffering.subjectNumber}`
                                : "분반을 선택해 주세요"}
                            </TriggerText>
                            <Icon
                              name="chevron-down"
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
                                  const meetingLabel =
                                    formatOfferingMeetings(candidate);
                                  const isSelected =
                                    match.selectedId === candidate.id;
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
                                          <span>
                                            {candidate.professor || "교수 미정"}
                                          </span>
                                        </strong>
                                        <small>
                                          수강번호 {candidate.subjectNumber}
                                        </small>
                                        {meetingLabel && (
                                          <em>{meetingLabel}</em>
                                        )}
                                      </PopoverOptionText>
                                      <OptionCheck $selected={isSelected}>
                                        {isSelected && (
                                          <Icon name="circle-check" size={16} />
                                        )}
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
                      <WarningText>
                        일치하는 개설 강좌를 찾지 못했습니다.
                      </WarningText>
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
        closeOnBack={false}
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

      {/* 강의 정보 직접 수정 & 분반 실시간 검색 모달 */}
      <CourseEditModal
        isOpen={editingMatch !== null}
        match={editingMatch}
        year={year}
        term={term}
        onClose={() => setEditingMatch(null)}
        onSelectOffering={handleSelectOffering}
        onSaveManual={handleSaveManual}
      />

      {/* 등록 대상 시간표 선택 바텀시트 */}
      <BottomSheet
        open={isTimetableSheetOpen}
        onOpenChange={setIsTimetableSheetOpen}
        height="auto"
        maxHeight="75%"
      >
        <SheetContainer>
          <SheetHeader>
            <SheetTitle>등록할 시간표 선택</SheetTitle>
            <SheetSubtitle>
              인식된 강의를 추가할 시간표를 선택해 주세요.
            </SheetSubtitle>
          </SheetHeader>

          <SheetContent>
            {Array.from(groupedTimetables.entries()).map(([semName, list]) => (
              <SemesterSection key={semName}>
                <SemesterSectionTitle>{semName}</SemesterSectionTitle>
                <TimetableCardList>
                  {list.map((t) => {
                    const isSelected = t.id === targetTimetableId;
                    const credit = getTimetableCredits(t.events);
                    return (
                      <TimetableRowButton
                        key={t.id}
                        type="button"
                        $selected={isSelected}
                        onClick={() => {
                          setSearchParams({ id: String(t.id) });
                          setActiveTimetable(t.id);
                          setSemester(t.semester);
                          setIsTimetableSheetOpen(false);
                        }}
                      >
                        <TimetableRowLeft>
                          <TimetableRowName $selected={isSelected}>
                            {t.name}
                            {t.isRepresentative && (
                              <PrimaryBadge>대표</PrimaryBadge>
                            )}
                          </TimetableRowName>
                          <TimetableRowMeta>
                            {credit > 0 ? `${credit}학점` : "0학점"} · 과목{" "}
                            {t.events.length}개
                          </TimetableRowMeta>
                        </TimetableRowLeft>
                        {isSelected && (
                          <Check size={20} color="#0061ff" strokeWidth={2.5} />
                        )}
                      </TimetableRowButton>
                    );
                  })}
                </TimetableCardList>
              </SemesterSection>
            ))}
          </SheetContent>
        </SheetContainer>
      </BottomSheet>
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
  padding-top: 0;
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

const HeadlineGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Headline = styled.h1`
  /* heading-1 */
  font-family: Pretendard;
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  line-height: 32px; /* 160% */
  white-space: pre-line;
  margin: 0;
`;

const TargetTimetableBadge = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  align-self: flex-start;
  padding: 6px 12px;
  background: #f2f4f6;
  border: 1px solid transparent;
  border-radius: 8px;
  font-family: Pretendard;
  font-size: 13px;
  font-weight: 600;
  color: #4e5968;
  line-height: 18px;
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease;

  &:hover {
    background: #e5e8eb;
  }

  &:active {
    background: #d1d6db;
  }

  svg.calendar {
    color: #0061ff;
  }

  svg.chevron {
    color: #8b95a1;
  }
`;

const SheetContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px 16px 24px 16px;
  max-height: 70vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
`;

const SheetHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 16px;
`;

const SheetTitle = styled.h2`
  font-family: Pretendard;
  font-size: 18px;
  font-weight: 700;
  color: #191f28;
  margin: 0;
`;

const SheetSubtitle = styled.p`
  font-family: Pretendard;
  font-size: 13px;
  font-weight: 400;
  color: #8b95a1;
  margin: 0;
`;

const SheetContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SemesterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SemesterSectionTitle = styled.div`
  font-family: Pretendard;
  font-size: 13px;
  font-weight: 600;
  color: #6b7684;
  padding: 0 4px;
`;

const TimetableCardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TimetableRowButton = styled.button<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1.5px solid ${({ $selected }) => ($selected ? "#0061ff" : "#e5e8eb")};
  background: ${({ $selected }) => ($selected ? "#f0f6ff" : "#ffffff")};
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;

  &:hover {
    background: ${({ $selected }) => ($selected ? "#e5f0ff" : "#f9fafb")};
  }
`;

const TimetableRowLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const TimetableRowName = styled.div<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: Pretendard;
  font-size: 15px;
  font-weight: 600;
  color: ${({ $selected }) => ($selected ? "#0061ff" : "#191f28")};
`;

const TimetableRowMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: Pretendard;
  font-size: 12px;
  color: #8b95a1;
`;

const PrimaryBadge = styled.span`
  display: inline-flex;
  padding: 2px 6px;
  border-radius: 4px;
  background: #e5f0ff;
  color: #0061ff;
  font-size: 11px;
  font-weight: 600;
`;

const DropzoneCard = styled.button`
  width: 100%;
  border: 1.5px dashed #0061ff;
  border-radius: 20px;
  background: var(--bg-brand, #eff6ff);
  padding: 20px 16px 0 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  cursor: pointer;
  box-sizing: border-box;
  text-align: left;
  overflow: hidden;
  transition:
    background 0.2s,
    border-color 0.2s;

  &:hover {
    background: #e5f0ff;
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
  background: transparent;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  box-sizing: border-box;
`;

const SampleImage = styled.img`
  width: 100%;
  height: auto;
  max-height: 220px;
  object-fit: contain;
  object-position: bottom center;
  display: block;
  vertical-align: bottom;
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

const AppIconImg = styled.img`
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 10px;
  display: block;
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
  transition:
    background 0.2s,
    border-color 0.2s;
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
  border: 0;
  transition: background 0.15s;

  &:hover {
    background: #e5e8eb;
    color: #4e5968;
  }
`;

const EditButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #f1f3f5;
  color: #4e5968;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 0;
  transition: background 0.15s;

  &:hover {
    background: #e5e8eb;
    color: #191f28;
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
  font-size: 14px;
  line-height: 20px;
  color: ${({ $placeholder }) => ($placeholder ? "#8b95a1" : "#191f28")};
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CandidatePopover = styled(motion.div)<{ $openUpward: boolean }>`
  position: absolute;
  left: 0;
  right: 0;
  ${({ $openUpward }) => ($openUpward ? "bottom: calc(100% + 4px);" : "top: calc(100% + 4px);")}
  background: #ffffff;
  border: 1px solid #e5e8eb;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
  z-index: 50;
  padding: 4px;
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
    rgba(248, 249, 251, 0.45) 45%,
    rgba(248, 249, 251, 0.85) 100%
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

// --- Course Edit Modal Component ---

interface CourseEditModalProps {
  isOpen: boolean;
  match: Match | null;
  year: number;
  term: Term;
  onClose: () => void;
  onSelectOffering: (matchId: string, offering: CourseOffering) => void;
  onSaveManual: (
    matchId: string,
    title: string,
    professor: string,
    day: TimeTableDay,
    startTime: string,
    endTime: string,
  ) => void;
}

function CourseEditModal({
  isOpen,
  match,
  year,
  term,
  onClose,
  onSelectOffering,
  onSaveManual,
}: CourseEditModalProps) {
  if (!isOpen || !match) return null;

  const [title, setTitle] = useState(
    match.group.title === "인식 실패" ? "" : match.group.title,
  );
  const [professor, setProfessor] = useState(match.group.professor);
  const [day, setDay] = useState<TimeTableDay>(
    match.group.blocks[0]?.day ?? "MONDAY",
  );
  const [startTime, setStartTime] = useState(
    match.group.blocks[0]?.startTime ?? "09:00",
  );
  const [endTime, setEndTime] = useState(
    match.group.blocks[0]?.endTime ?? "10:30",
  );

  const [debouncedKeyword, setDebouncedKeyword] = useState(title);
  const [searchResults, setSearchResults] = useState<CourseOffering[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(title.trim());
    }, 200);
    return () => clearTimeout(timer);
  }, [title]);

  useEffect(() => {
    let active = true;
    const fetchOfferings = async () => {
      setIsSearching(true);
      try {
        const promises: Promise<CourseOffering[]>[] = [];
        if (debouncedKeyword.length >= 1) {
          promises.push(searchCourseOfferings(year, term, debouncedKeyword));
        }
        if (professor.trim().length >= 2) {
          promises.push(searchCourseOfferings(year, term, professor.trim()));
        }
        promises.push(
          getCourseOfferingsPage(year, term, 0, 50)
            .then((res) => res.content)
            .catch(() => []),
        );

        const results = await Promise.all(promises);
        if (!active) return;

        const pool = new Map<number, CourseOffering>();
        results.flat().forEach((offering) => {
          pool.set(offering.id, offering);
        });

        const dummyGroup: DetectedCourseGroup = {
          id: "temp",
          title: title.trim() || match.group.title,
          professor: professor.trim(),
          rawText: "",
          blocks: [
            {
              id: "temp-block",
              crop: {} as any,
              day,
              startTime,
              endTime,
              rawText: "",
              confidence: 100,
            },
          ],
        };

        const sorted = [...pool.values()]
          .map((offering) => ({
            offering,
            score: scoreOffering(dummyGroup, offering),
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 15)
          .map(({ offering }) => offering);

        setSearchResults(sorted);
      } catch (err) {
        console.warn("Live search failed:", err);
      } finally {
        if (active) setIsSearching(false);
      }
    };

    fetchOfferings();
    return () => {
      active = false;
    };
  }, [
    debouncedKeyword,
    professor,
    day,
    startTime,
    endTime,
    year,
    term,
    match.group.title,
  ]);

  const handleSelect = (offering: CourseOffering) => {
    onSelectOffering(match.group.id, offering);
  };

  const handleManualSave = () => {
    onSaveManual(
      match.group.id,
      title.trim() || match.group.title,
      professor.trim(),
      day,
      startTime,
      endTime,
    );
  };

  return (
    <ModalBackdrop onClick={onClose}>
      <ModalContentSheet onClick={(e) => e.stopPropagation()}>
        <ModalSheetHeader>
          <div>
            <ModalSheetTitle>강의 정보 수정 & 분반 검색</ModalSheetTitle>
            <ModalSheetSubtitle>
              과목명이나 교수명을 수정하면 개설 강좌가 검색됩니다.
            </ModalSheetSubtitle>
          </div>
          <ModalCloseButton type="button" onClick={onClose}>
            <Icon name="close-md" size={20} />
          </ModalCloseButton>
        </ModalSheetHeader>

        <ModalSheetBody>
          <FormGroup>
            <FormLabel>
              <BookOpen size={14} /> 과목명
            </FormLabel>
            <FormInput
              type="text"
              placeholder="과목명을 입력해 주세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </FormGroup>

          <FormGroup>
            <FormLabel>
              <User size={14} /> 교수명
            </FormLabel>
            <FormInput
              type="text"
              placeholder="교수명을 입력해 주세요 (선택사항)"
              value={professor}
              onChange={(e) => setProfessor(e.target.value)}
            />
          </FormGroup>

          <FormRow>
            <FormGroup style={{ flex: 1 }}>
              <FormLabel>
                <Clock size={14} /> 요일
              </FormLabel>
              <DayChipGroup>
                {(
                  [
                    "MONDAY",
                    "TUESDAY",
                    "WEDNESDAY",
                    "THURSDAY",
                    "FRIDAY",
                    "SATURDAY",
                  ] as TimeTableDay[]
                ).map((d) => (
                  <DayChip
                    key={d}
                    type="button"
                    $active={day === d}
                    onClick={() => setDay(d)}
                  >
                    {DAY_LABEL[d]}
                  </DayChip>
                ))}
              </DayChipGroup>
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup style={{ flex: 1 }}>
              <FormLabel>시작 시간</FormLabel>
              <FormInput
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </FormGroup>
            <FormGroup style={{ flex: 1 }}>
              <FormLabel>종료 시간</FormLabel>
              <FormInput
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </FormGroup>
          </FormRow>

          <ResultsSection>
            <ResultsSectionTitle>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Search size={14} color="#0061ff" />
                <span>검색된 개설 분반 ({searchResults.length}개)</span>
              </div>
              {isSearching && (
                <SearchLoadingBadge>검색 중...</SearchLoadingBadge>
              )}
            </ResultsSectionTitle>

            <OfferingsScrollList>
              {searchResults.length > 0 ? (
                searchResults.map((offering) => {
                  const isSelected = match.selectedId === offering.id;
                  const meetings = formatOfferingMeetings(offering);
                  return (
                    <OfferingItemCard
                      key={offering.id}
                      $selected={isSelected}
                      onClick={() => handleSelect(offering)}
                    >
                      <OfferingMainInfo>
                        <OfferingTitleRow>
                          <OfferingCourseTitle>
                            {offering.courseTitle}
                          </OfferingCourseTitle>
                          <OfferingBadge>
                            {offering.deptName ||
                              offering.isuName ||
                              "개설"}
                          </OfferingBadge>
                        </OfferingTitleRow>
                        <OfferingSubInfo>
                          <span>{offering.professor || "교수 미정"}</span>
                          <span>·</span>
                          <span>{offering.subjectNumber}</span>
                          {meetings && (
                            <>
                              <span>·</span>
                              <span style={{ color: "#0061ff" }}>{meetings}</span>
                            </>
                          )}
                        </OfferingSubInfo>
                      </OfferingMainInfo>
                      <SelectActionButton type="button" $selected={isSelected}>
                        {isSelected ? "선택됨" : "선택"}
                      </SelectActionButton>
                    </OfferingItemCard>
                  );
                })
              ) : (
                <EmptyResultsText>
                  {isSearching
                    ? "일치하는 개설 강좌를 검색 중입니다..."
                    : "일치하는 개설 강좌를 찾지 못했습니다. 과목명을 검색해 보세요."}
                </EmptyResultsText>
              )}
            </OfferingsScrollList>
          </ResultsSection>
        </ModalSheetBody>

        <ModalSheetFooter>
          <CapsuleButton
            variant="secondary"
            onClick={onClose}
            style={{ flex: 1 }}
          >
            취소
          </CapsuleButton>
          <CapsuleButton
            variant="primary"
            onClick={handleManualSave}
            style={{ flex: 2 }}
          >
            직접 입력으로 적용
          </CapsuleButton>
        </ModalSheetFooter>
      </ModalContentSheet>
    </ModalBackdrop>
  );
}

// --- Edit Modal Styled Components ---

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.48);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  backdrop-filter: blur(2px);
`;

const ModalContentSheet = styled.div`
  width: 100%;
  max-width: 600px;
  max-height: 85vh;
  background: #ffffff;
  border-radius: 20px 20px 0 0;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.12);
  animation: slideUpModal 0.25s cubic-bezier(0.16, 1, 0.3, 1);

  @keyframes slideUpModal {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
`;

const ModalSheetHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 20px 20px 14px;
  border-bottom: 1px solid #f2f4f6;
`;

const ModalSheetTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #191f28;
`;

const ModalSheetSubtitle = styled.p`
  margin: 4px 0 0;
  font-size: 13px;
  color: #8b95a1;
`;

const ModalCloseButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f2f4f6;
  border: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7684;
  cursor: pointer;
  flex-shrink: 0;

  &:hover {
    background: #e5e8eb;
  }
`;

const ModalSheetBody = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FormRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const FormLabel = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: #4e5968;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const FormInput = styled.input`
  width: 100%;
  height: 44px;
  padding: 0 14px;
  border: 1px solid #e5e8eb;
  border-radius: 10px;
  font-size: 14px;
  color: #191f28;
  background: #fdfdfe;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.15s;

  &:focus {
    border-color: #0061ff;
    background: #ffffff;
  }
`;

const DayChipGroup = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const DayChip = styled.button<{ $active: boolean }>`
  flex: 1;
  min-width: 40px;
  height: 38px;
  border-radius: 8px;
  border: 1px solid ${({ $active }) => ($active ? "#0061ff" : "#e5e8eb")};
  background: ${({ $active }) => ($active ? "#0061ff" : "#ffffff")};
  color: ${({ $active }) => ($active ? "#ffffff" : "#4e5968")};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
`;

const ResultsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
`;

const ResultsSectionTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 700;
  color: #191f28;
`;

const SearchLoadingBadge = styled.span`
  font-size: 11px;
  color: #0061ff;
  font-weight: 600;
`;

const OfferingsScrollList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 220px;
  overflow-y: auto;
  padding-right: 2px;
`;

const OfferingItemCard = styled.div<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 12px;
  background: ${({ $selected }) => ($selected ? "#f0f6ff" : "#f8f9fb")};
  border: 1px solid ${({ $selected }) => ($selected ? "#0061ff" : "#e5484d")};
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: ${({ $selected }) => ($selected ? "#e5f0ff" : "#f1f3f5")};
  }
`;

const OfferingMainInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
`;

const OfferingTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
`;

const OfferingCourseTitle = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: #191f28;
`;

const OfferingBadge = styled.span`
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  background: #eef3ff;
  color: #0061ff;
`;

const OfferingSubInfo = styled.div`
  font-size: 12px;
  color: #6b7684;
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
`;

const SelectActionButton = styled.button<{ $selected: boolean }>`
  padding: 6px 12px;
  border-radius: 8px;
  border: 0;
  font-size: 12px;
  font-weight: 700;
  background: ${({ $selected }) => ($selected ? "#0061ff" : "#ffffff")};
  color: ${({ $selected }) => ($selected ? "#ffffff" : "#0061ff")};
  border: 1px solid ${({ $selected }) => ($selected ? "#0061ff" : "#d3e5ff")};
  cursor: pointer;
  flex-shrink: 0;
`;

const EmptyResultsText = styled.div`
  padding: 24px 16px;
  text-align: center;
  font-size: 13px;
  color: #8b95a1;
  background: #f8f9fb;
  border-radius: 10px;
  line-height: 20px;
`;

const ModalSheetFooter = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 20px calc(14px + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid #f2f4f6;
  background: #ffffff;
`;

