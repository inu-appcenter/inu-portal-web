import { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import {
  Download,
  School,
  RefreshCw,
  AlertCircle,
  Check,
  Clock,
  MapPin,
  User,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ScanLine,
  ChevronRight,
  Sparkles,
  GraduationCap,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import BottomSheet from "@/components/common/BottomSheet";
import CapsuleButton from "@/components/common/CapsuleButton";
import { PortalAccountModal } from "@/components/mobile/agent/PortalAccountModal";
import {
  checkPortalAccountLinked,
  fetchStudentTimetableFromApp,
  fetchFullAcademicReportFromApp,
  isMobileAppEnvironment,
} from "@/apis/mobileAgentBridge";
import {
  resolvePortalTimetableItems,
  ResolvedPortalTimetableItem,
} from "@/utils/resolvePortalTimetableOfferings";
import { useSemesters } from "@/hooks/useSemesters";
import {
  useCreateTimeTable,
  useCreateTimeTableCourseItem,
  syncTimeTableDetail,
} from "@/hooks/useTimeTables";
import { useTimetableStore } from "@/stores/useTimetableStore";
import {
  formatSemester,
  pickCurrentSemester,
  termToTmGbn,
} from "@/utils/semester";
import { mixpanelTrack } from "@/utils/mixpanel";
import { ROUTES } from "@/constants/routes";
import { savePortalGradesToCalculatorStorage } from "@/utils/portalGradeSync";
import type { Term } from "@/types/timetables";

interface PortalTimetableImportSheetProps {
  isOpen: boolean;
  onClose: () => void;
  targetTimetableId?: number | null;
  initialSemester?: string;
  onSuccess?: (addedCount: number) => void;
}

type ImportStep =
  | "READY"
  | "FETCHING"
  | "REVIEW"
  | "SAVING"
  | "ASK_GRADE_IMPORT"
  | "FETCHING_GRADES"
  | "GRADE_SUCCESS";

export interface SemesterCourseGroup {
  semesterId: number;
  year: number;
  term: Term;
  label: string;
  courses: ResolvedPortalTimetableItem[];
  isExpanded: boolean;
}

export default function PortalTimetableImportSheet({
  isOpen,
  onClose,
  targetTimetableId,
  initialSemester,
  onSuccess,
}: PortalTimetableImportSheetProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { semesters } = useSemesters();
  const { timetables, setActiveTimetable, setSemester } = useTimetableStore();
  const createTimeTableMutation = useCreateTimeTable();
  const createItemMutation = useCreateTimeTableCourseItem();

  const [step, setStep] = useState<ImportStep>("READY");
  const [isPortalModalOpen, setIsPortalModalOpen] = useState(false);
  const [selectedSemesterIds, setSelectedSemesterIds] = useState<number[]>([]);
  const [semesterGroups, setSemesterGroups] = useState<SemesterCourseGroup[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loadingMessage, setLoadingMessage] = useState("");
  const [createNewTimetable, setCreateNewTimetable] = useState(false);

  // 성적 연동 관련 상태
  const [savedTimetableResult, setSavedTimetableResult] = useState<{
    totalAdded: number;
    totalSkipped: number;
    semesterCount: number;
  }>({ totalAdded: 0, totalSkipped: 0, semesterCount: 0 });

  const [gradeResult, setGradeResult] = useState<{
    semestersCount: number;
    subjectsCount: number;
  }>({ semestersCount: 0, subjectsCount: 0 });

  // 학기 옵션 설정
  const semesterOptions = useMemo(
    () =>
      semesters.map((s) => ({
        id: s.id,
        year: s.year,
        term: s.term,
        label: formatSemester(s.year, s.term),
      })),
    [semesters],
  );

  // 대상 시간표 설정
  const activeTimetable = useMemo(
    () => timetables.find((t) => t.id === targetTimetableId) ?? null,
    [timetables, targetTimetableId],
  );

  // 기존 시간표에 포함된 개설강의 ID / 수강번호 목록
  const existingOfferingIds = useMemo(() => {
    if (!activeTimetable || createNewTimetable) return [];
    return activeTimetable.events
      .map((e) => e.courseOfferingId)
      .filter((id): id is number => id !== undefined);
  }, [activeTimetable, createNewTimetable]);

  const existingSubjectNumbers = useMemo(() => {
    if (!activeTimetable || createNewTimetable) return [];
    return activeTimetable.events
      .map((e) => e.courseId)
      .filter((id): id is string => Boolean(id));
  }, [activeTimetable, createNewTimetable]);

  // 시트 열릴 때 초기화
  useEffect(() => {
    if (!isOpen) {
      setStep("READY");
      setSemesterGroups([]);
      setErrorMessage("");
      setLoadingMessage("");
      return;
    }

    const current = pickCurrentSemester(semesters);
    const matched = semesterOptions.find((s) => s.label === initialSemester);
    const initialId = matched?.id ?? current?.id ?? semesterOptions[0]?.id ?? null;
    setSelectedSemesterIds(initialId ? [initialId] : []);
    setCreateNewTimetable(!targetTimetableId);
  }, [isOpen, initialSemester, semesters, semesterOptions, targetTimetableId]);

  // 학기 다중 선택 토글
  const toggleSemesterSelection = (semesterId: number) => {
    setSelectedSemesterIds((prev) =>
      prev.includes(semesterId)
        ? prev.filter((id) => id !== semesterId)
        : [...prev, semesterId],
    );
  };

  // 모든 학기 전체 선택 / 해제
  const toggleAllSemesters = () => {
    if (selectedSemesterIds.length === semesterOptions.length) {
      // 모두 선택되어 있으면 1개(현재 학기)만 남김
      const current = pickCurrentSemester(semesters);
      setSelectedSemesterIds(current ? [current.id] : [semesterOptions[0]?.id]);
    } else {
      setSelectedSemesterIds(semesterOptions.map((s) => s.id));
    }
  };

  // 포털 시간표 다중 학기 조회 실행 함수
  const executeFetchAllTimetables = async () => {
    const targets = semesterOptions.filter((s) =>
      selectedSemesterIds.includes(s.id),
    );
    if (targets.length === 0) return;

    setStep("FETCHING");
    setErrorMessage("");

    const fetchedGroups: SemesterCourseGroup[] = [];
    let emptyCount = 0;

    for (let i = 0; i < targets.length; i++) {
      const sem = targets[i];
      setLoadingMessage(
        `${sem.label} 시간표를 가져오는 중이에요... (${i + 1}/${targets.length})`,
      );

      const tmGbn = termToTmGbn(sem.term);

      try {
        const res = await fetchStudentTimetableFromApp({
          yy: String(sem.year),
          tmGbn,
        });

        if (!res.success) {
          if (res.errorCode === "AUTH_REQUIRED") {
            setIsPortalModalOpen(true);
            setStep("READY");
            return;
          }
          console.warn(`${sem.label} 조회 실패:`, res.errorMessage);
          continue;
        }

        const rawItems = res.data ?? [];
        if (rawItems.length === 0) {
          emptyCount += 1;
          continue;
        }

        const isCurrentTarget = activeTimetable && activeTimetable.year === sem.year && activeTimetable.term === sem.term;
        const resolved = await resolvePortalTimetableItems(
          rawItems,
          sem.year,
          sem.term,
          isCurrentTarget ? existingOfferingIds : [],
          isCurrentTarget ? existingSubjectNumbers : [],
        );

        fetchedGroups.push({
          semesterId: sem.id,
          year: sem.year,
          term: sem.term,
          label: sem.label,
          courses: resolved,
          isExpanded: true,
        });
      } catch (err) {
        console.error(`${sem.label} 조회 중 오류:`, err);
      }
    }

    if (fetchedGroups.length === 0) {
      setErrorMessage(
        targets.length === 1
          ? `${targets[0].label} 포털에 등록된 수강신청 내역이 없어요.`
          : `선택한 ${targets.length}개 학기에 등록된 포털 수강신청 내역이 없어요.`,
      );
      setStep("READY");
      return;
    }

    setSemesterGroups(fetchedGroups);
    setStep("REVIEW");
  };

  // 시작 버튼 클릭
  const handleStartFetch = async () => {
    if (!isMobileAppEnvironment()) {
      alert("포털 시간표 가져오기는 INTIP 모바일 앱 환경에서 이용할 수 있어요.");
      return;
    }

    if (selectedSemesterIds.length === 0) {
      alert("가져올 학기를 하나 이상 선택해 주세요.");
      return;
    }

    const isLinked = await checkPortalAccountLinked();
    if (!isLinked) {
      setIsPortalModalOpen(true);
      return;
    }

    mixpanelTrack.timetableFeatureClicked(
      "포털 시간표 다중 가져오기 시작",
      "포털 가져오기 시트",
      { selectedCount: selectedSemesterIds.length },
    );

    await executeFetchAllTimetables();
  };

  // 계정 연동 완료 후 자동 재조회
  const handlePortalAccountSuccess = () => {
    void executeFetchAllTimetables();
  };

  // 특정 학기의 특정 강의 선택 토글
  const toggleCourseSelection = (groupIndex: number, courseIndex: number) => {
    setSemesterGroups((prev) =>
      prev.map((g, gIdx) => {
        if (gIdx !== groupIndex) return g;
        return {
          ...g,
          courses: g.courses.map((c, cIdx) =>
            cIdx === courseIndex && !c.isAlreadyAdded
              ? { ...c, isSelected: !c.isSelected }
              : c,
          ),
        };
      }),
    );
  };

  // 특정 학기 전체 선택/해제 토글
  const toggleGroupSelectAll = (groupIndex: number) => {
    setSemesterGroups((prev) =>
      prev.map((g, gIdx) => {
        if (gIdx !== groupIndex) return g;
        const selectable = g.courses.filter((c) => !c.isAlreadyAdded && c.offering);
        const allSelected = selectable.every((c) => c.isSelected);
        return {
          ...g,
          courses: g.courses.map((c) =>
            c.isAlreadyAdded || !c.offering
              ? c
              : { ...c, isSelected: !allSelected },
          ),
        };
      }),
    );
  };

  // 학기 아코디언 펼침/접힘 토글
  const toggleGroupExpand = (groupIndex: number) => {
    setSemesterGroups((prev) =>
      prev.map((g, gIdx) =>
        gIdx === groupIndex ? { ...g, isExpanded: !g.isExpanded } : g,
      ),
    );
  };

  // 시간표에 최종 등록 저장
  const handleApplyToTimetable = async () => {
    const groupsWithSelections = semesterGroups
      .map((g) => ({
        ...g,
        selectedCourses: g.courses.filter(
          (c) => c.isSelected && c.offering && !c.isAlreadyAdded,
        ),
      }))
      .filter((g) => g.selectedCourses.length > 0);

    if (groupsWithSelections.length === 0) {
      alert("등록할 강의를 선택해 주세요.");
      return;
    }

    setStep("SAVING");
    let totalAdded = 0;
    let totalSkipped = 0;
    let lastCreatedTimetableId: number | null = null;
    let lastSemesterLabel = "";

    try {
      for (const group of groupsWithSelections) {
        setLoadingMessage(`${group.label} 시간표를 저장하고 있어요...`);

        let destTimetableId: number | null = null;

        // 단일 학기 선택이고 현재 시간표에 추가 모드인 경우
        if (
          groupsWithSelections.length === 1 &&
          !createNewTimetable &&
          targetTimetableId
        ) {
          destTimetableId = targetTimetableId;
        } else {
          // 새 시간표 생성
          const termShort = group.term === "FIRST" ? "1" : group.term === "SECOND" ? "2" : group.term === "SUMMER" ? "여름" : "겨울";
          const created = await createTimeTableMutation.mutateAsync({
            semesterId: group.semesterId,
            timeTableName: `${group.year}-${termShort} 포털시간표`,
          });
          destTimetableId = created.id;
        }

        lastCreatedTimetableId = destTimetableId;
        lastSemesterLabel = group.label;

        // 과목 등록
        for (const item of group.selectedCourses) {
          if (!item.offering) continue;
          try {
            await createItemMutation.mutateAsync({
              timeTableId: destTimetableId,
              body: { courseOfferingId: item.offering.id },
            });
            totalAdded += 1;
          } catch (error: any) {
            const status = error.response?.status;
            const msg = String(error.response?.data?.msg ?? "");
            if (
              status === 409 ||
              msg.includes("중복") ||
              msg.includes("동일") ||
              msg.includes("존재")
            ) {
              totalSkipped += 1;
            } else {
              console.error("강의 등록 실패:", item.rawItem.courseName, error);
            }
          }
        }

        // 캐시 동기화
        await syncTimeTableDetail(queryClient, destTimetableId);
      }

      if (lastCreatedTimetableId) {
        setSemester(lastSemesterLabel);
        setActiveTimetable(lastCreatedTimetableId);
      }

      mixpanelTrack.timetableFeatureClicked(
        "포털 시간표 가져오기 완료",
        "포털 가져오기 시트",
        {
          semesterCount: groupsWithSelections.length,
          totalAdded,
          totalSkipped,
        },
      );

      setSavedTimetableResult({
        totalAdded,
        totalSkipped,
        semesterCount: groupsWithSelections.length,
      });

      // 성적 정보를 학점 계산기에 불러올까요? 스텝으로 전환
      setStep("ASK_GRADE_IMPORT");
    } catch (err: any) {
      console.error("시간표 일괄 등록 중 오류:", err);
      alert(err?.response?.data?.msg || err?.message || "강의 등록에 실패했어요.");
      setStep("REVIEW");
    }
  };

  const handleSkipGrade = () => {
    const message =
      savedTimetableResult.totalSkipped > 0
        ? `총 ${savedTimetableResult.totalAdded}개 강의를 ${savedTimetableResult.semesterCount}개 학기 시간표에 등록했어요. (중복/충돌 ${savedTimetableResult.totalSkipped}개 제외)`
        : `총 ${savedTimetableResult.totalAdded}개 강의를 ${savedTimetableResult.semesterCount}개 학기 시간표에 등록했어요.`;

    alert(message);
    onSuccess?.(savedTimetableResult.totalAdded);
    onClose();
  };

  const handleImportGrades = async () => {
    setStep("FETCHING_GRADES");
    setLoadingMessage("포털에서 전체 학기 성적을 불러와 학점 계산기에 저장하고 있어요...");

    try {
      const reportRes = await fetchFullAcademicReportFromApp();
      if (!reportRes.success || !reportRes.data) {
        throw new Error(reportRes.errorMessage || "성적 정보를 불러오지 못했어요.");
      }

      const saveResult = savePortalGradesToCalculatorStorage(
        reportRes.data.courseGrades,
      );

      setGradeResult({
        semestersCount: saveResult.semestersCount,
        subjectsCount: saveResult.subjectsCount,
      });
      setStep("GRADE_SUCCESS");
    } catch (err: any) {
      console.error("성적 불러오기 오류:", err);
      alert(err?.message || "성적 정보를 불러오지 못했습니다.");
      handleSkipGrade();
    }
  };

  const totalSelectedCount = semesterGroups.reduce(
    (sum, g) => sum + g.courses.filter((c) => c.isSelected).length,
    0,
  );

  const totalFoundCourses = semesterGroups.reduce(
    (sum, g) => sum + g.courses.length,
    0,
  );

  const isSingleSemester = selectedSemesterIds.length === 1;

  return (
    <>
      <BottomSheet
        open={isOpen}
        onOpenChange={(open) => !open && onClose()}
        height="auto"
        maxHeight="90%"
      >
        <Container>
          <Header>
            <TitleRow>
              <School size={22} color="#0061ff" />
              <Title>시간표 및 성적 가져오기</Title>
            </TitleRow>
            <SubTitle>
              인천대 포털(학사행정)에 등록된 내 시간표와 전 학기 성적을 안전하게 연동해요.
            </SubTitle>
          </Header>

          {step === "READY" && (
            <ReadyContent>
              <ImageImportLinkCard
                type="button"
                onClick={() => {
                  onClose();
                  navigate(
                    `${ROUTES.TIMETABLE.IMAGE_IMPORT}${targetTimetableId ? `?id=${targetTimetableId}` : ""}`,
                  );
                }}
              >
                <ImageImportLinkLeft>
                  <ScanLine size={18} color="#0061ff" />
                  <div>
                    <ImageImportLinkTitle>
                      시간표 이미지(캡처)로 등록하기
                    </ImageImportLinkTitle>
                    <ImageImportLinkSub>
                      수강신청 앱, 에브리타임 캡처본이 있다면 이미지로 등록할 수 있어요
                    </ImageImportLinkSub>
                  </div>
                </ImageImportLinkLeft>
                <ChevronRight size={18} color="#8b95a1" />
              </ImageImportLinkCard>

              <SectionGroup>
                <SemesterHeaderRow>
                  <Label>가져올 학기 선택 (여러 개 선택할 수 있어요)</Label>
                  <SelectAllButton type="button" onClick={toggleAllSemesters}>
                    {selectedSemesterIds.length === semesterOptions.length
                      ? "최신 학기만 선택"
                      : "전체 선택"}
                  </SelectAllButton>
                </SemesterHeaderRow>

                <SemesterCheckList>
                  {semesterOptions.map((sem) => {
                    const isChecked = selectedSemesterIds.includes(sem.id);
                    return (
                      <SemesterCheckCard
                        key={sem.id}
                        $selected={isChecked}
                        onClick={() => toggleSemesterSelection(sem.id)}
                      >
                        <Checkbox $checked={isChecked}>
                          {isChecked && (
                            <Check size={14} color="#ffffff" strokeWidth={3} />
                          )}
                        </Checkbox>
                        <SemesterLabelText>{sem.label}</SemesterLabelText>
                      </SemesterCheckCard>
                    );
                  })}
                </SemesterCheckList>
              </SectionGroup>

              {isSingleSemester && activeTimetable && (
                <SectionGroup>
                  <Label>등록 방식</Label>
                  <OptionCard
                    $selected={!createNewTimetable}
                    onClick={() => setCreateNewTimetable(false)}
                  >
                    <RadioCircle $selected={!createNewTimetable}>
                      {!createNewTimetable && <RadioDot />}
                    </RadioCircle>
                    <OptionInfo>
                      <OptionTitle>현재 시간표에 추가</OptionTitle>
                      <OptionDesc>
                        "{activeTimetable.name}"에 과목들을 추가해요.
                      </OptionDesc>
                    </OptionInfo>
                  </OptionCard>

                  <OptionCard
                    $selected={createNewTimetable}
                    onClick={() => setCreateNewTimetable(true)}
                  >
                    <RadioCircle $selected={createNewTimetable}>
                      {createNewTimetable && <RadioDot />}
                    </RadioCircle>
                    <OptionInfo>
                      <OptionTitle>새 시간표로 만들기</OptionTitle>
                      <OptionDesc>
                        새로운 시간표를 만들어 과목들을 등록해요.
                      </OptionDesc>
                    </OptionInfo>
                  </OptionCard>
                </SectionGroup>
              )}

              {errorMessage && (
                <ErrorBox>
                  <AlertCircle size={16} color="#f04452" />
                  <span>{errorMessage}</span>
                </ErrorBox>
              )}

              <InfoBanner>
                <InfoBannerIcon>
                  <School size={16} color="#0061ff" />
                </InfoBannerIcon>
                <InfoBannerText>
                  로그인 정보는 기기 보안 영역(Keystore)에만 안전하게 보관돼요.
                </InfoBannerText>
              </InfoBanner>

              <CapsuleButton
                variant="brand"
                fullWidth
                leftIcon={<Download size={18} />}
                disabled={selectedSemesterIds.length === 0}
                onClick={handleStartFetch}
              >
                {selectedSemesterIds.length > 1
                  ? `포털에서 ${selectedSemesterIds.length}개 학기 시간표 불러오기`
                  : "포털에서 시간표 불러오기"}
              </CapsuleButton>
            </ReadyContent>
          )}

          {(step === "FETCHING" ||
            step === "SAVING" ||
            step === "FETCHING_GRADES") && (
            <LoadingContainer>
              <Spinner />
              <LoadingTitle>
                {step === "FETCHING"
                  ? "포털 연동 중"
                  : step === "FETCHING_GRADES"
                    ? "성적 정보 가져오는 중"
                    : "시간표 저장 중"}
              </LoadingTitle>
              <LoadingDesc>{loadingMessage}</LoadingDesc>
            </LoadingContainer>
          )}

          {step === "REVIEW" && (
            <ReviewContent>
              <ReviewHeader>
                <SummaryText>
                  총 <strong>{semesterGroups.length}개 학기</strong>, <strong>{totalFoundCourses}개</strong> 과목을 찾았어요
                </SummaryText>
              </ReviewHeader>

              <SemesterGroupsWrapper>
                {semesterGroups.map((group, gIdx) => {
                  const groupSelectable = group.courses.filter(
                    (c) => !c.isAlreadyAdded && c.offering,
                  );
                  const isGroupAllSelected =
                    groupSelectable.length > 0 &&
                    groupSelectable.every((c) => c.isSelected);

                  return (
                    <GroupCard key={group.semesterId}>
                      <GroupHeaderRow onClick={() => toggleGroupExpand(gIdx)}>
                        <GroupTitleArea>
                          <GroupCheckboxSlot
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleGroupSelectAll(gIdx);
                            }}
                          >
                            <Checkbox $checked={isGroupAllSelected}>
                              {isGroupAllSelected && (
                                <Check size={14} color="#ffffff" strokeWidth={3} />
                              )}
                            </Checkbox>
                          </GroupCheckboxSlot>
                          <GroupTitle>{group.label}</GroupTitle>
                          <GroupCountBadge>
                            {group.courses.length}과목
                          </GroupCountBadge>
                        </GroupTitleArea>

                        <ExpandIconSlot>
                          {group.isExpanded ? (
                            <ChevronUp size={18} color="#8b95a1" />
                          ) : (
                            <ChevronDown size={18} color="#8b95a1" />
                          )}
                        </ExpandIconSlot>
                      </GroupHeaderRow>

                      {group.isExpanded && (
                        <GroupCourseList>
                          {group.courses.map((c, cIdx) => (
                            <CourseItemCard
                              key={cIdx}
                              $disabled={c.isAlreadyAdded || !c.offering}
                              onClick={() => toggleCourseSelection(gIdx, cIdx)}
                            >
                              <CheckSlot>
                                <Checkbox
                                  $checked={c.isSelected}
                                  $disabled={c.isAlreadyAdded || !c.offering}
                                >
                                  {c.isSelected && (
                                    <Check
                                      size={14}
                                      color="#ffffff"
                                      strokeWidth={3}
                                    />
                                  )}
                                </Checkbox>
                              </CheckSlot>

                              <CourseMain>
                                <CourseTitleRow>
                                  <CourseTitle>{c.rawItem.courseName}</CourseTitle>
                                  {c.isAlreadyAdded ? (
                                    <Badge $variant="muted">이미 등록됨</Badge>
                                  ) : c.matchStatus === "MATCHED_EXACT" ? (
                                    <Badge $variant="success">자동 매칭</Badge>
                                  ) : c.matchStatus === "MATCHED_FUZZY" ? (
                                    <Badge $variant="warning">유사 매칭</Badge>
                                  ) : (
                                    <Badge $variant="danger">개설 미확인</Badge>
                                  )}
                                </CourseTitleRow>

                                <MetaRow>
                                  <MetaItem>
                                    <User size={13} />
                                    <span>
                                      {c.offering?.professor ||
                                        c.rawItem.professorName ||
                                        "교수 미정"}
                                    </span>
                                  </MetaItem>
                                  <MetaItem>
                                    <BookOpen size={13} />
                                    <span>
                                      {c.offering?.credit || c.rawItem.credits}학점 ·{" "}
                                      {c.rawItem.courseType}
                                    </span>
                                  </MetaItem>
                                </MetaRow>

                                {c.rawItem.timeSlots.length > 0 && (
                                  <TimeSlotList>
                                    {c.rawItem.timeSlots.map((slot, sIdx) => (
                                      <TimeSlotRow key={sIdx}>
                                        <TimeSlotBadge>
                                          <Clock size={12} />
                                          <span>
                                            {slot.day} {slot.periods}
                                          </span>
                                        </TimeSlotBadge>
                                        {(slot.building || slot.room) && (
                                          <TimeSlotBadge>
                                            <MapPin size={12} />
                                            <span>
                                              {slot.building} {slot.room}
                                            </span>
                                          </TimeSlotBadge>
                                        )}
                                      </TimeSlotRow>
                                    ))}
                                  </TimeSlotList>
                                )}
                              </CourseMain>
                            </CourseItemCard>
                          ))}
                        </GroupCourseList>
                      )}
                    </GroupCard>
                  );
                })}
              </SemesterGroupsWrapper>

              <ButtonGroup>
                <CapsuleButton
                  variant="secondary"
                  leftIcon={<RefreshCw size={16} />}
                  onClick={() => setStep("READY")}
                >
                  다시 설정하기
                </CapsuleButton>
                <CapsuleButton
                  variant="brand"
                  fullWidth
                  disabled={totalSelectedCount === 0}
                  onClick={handleApplyToTimetable}
                >
                  선택한 {totalSelectedCount}개 강의 등록하기
                </CapsuleButton>
              </ButtonGroup>
            </ReviewContent>
          )}

          {step === "ASK_GRADE_IMPORT" && (
            <GradePromptContent>
              <PromptBadge>
                <Sparkles size={16} color="#0061ff" />
                <span>시간표 등록 완료</span>
              </PromptBadge>

              <PromptTitle>
                성적 정보를 학점 계산기에 불러올까요?
              </PromptTitle>
              <PromptDesc>
                방금 등록한 시간표와 함께 포털에 등록된 전체 학기 성적(과목별 성적, 취득학점, 평점)을 학점 계산기에 자동으로 연동할 수 있어요.
              </PromptDesc>

              <PromptFeatureCard>
                <FeatureItem>
                  <FeatureIconBox>
                    <GraduationCap size={18} color="#0061ff" />
                  </FeatureIconBox>
                  <FeatureTextBox>
                    <FeatureTextTitle>전 학기 과목 및 평점 자동 등록</FeatureTextTitle>
                    <FeatureTextDesc>
                      과목명, 취득학점, 성적(A+, A0 등), 전공/교양 이수구분이 자동으로 채워져요.
                    </FeatureTextDesc>
                  </FeatureTextBox>
                </FeatureItem>
                <FeatureItem>
                  <FeatureIconBox>
                    <CheckCircle2 size={18} color="#0061ff" />
                  </FeatureIconBox>
                  <FeatureTextBox>
                    <FeatureTextTitle>서버 전송 없는 안전한 기기 내 저장</FeatureTextTitle>
                    <FeatureTextDesc>
                      성적 정보는 오직 내 휴대폰 로컬 저장소에만 안전하게 보관돼요.
                    </FeatureTextDesc>
                  </FeatureTextBox>
                </FeatureItem>
              </PromptFeatureCard>

              <ButtonGroup>
                <CapsuleButton
                  variant="secondary"
                  fullWidth
                  onClick={handleSkipGrade}
                >
                  다음에 할게요
                </CapsuleButton>
                <CapsuleButton
                  variant="brand"
                  fullWidth
                  leftIcon={<Sparkles size={16} />}
                  onClick={handleImportGrades}
                >
                  불러올게요
                </CapsuleButton>
              </ButtonGroup>
            </GradePromptContent>
          )}

          {step === "GRADE_SUCCESS" && (
            <GradeSuccessContent>
              <SuccessIconCircle>
                <CheckCircle2 size={36} color="#0061ff" />
              </SuccessIconCircle>
              <SuccessTitle>성적 연동이 완료되었어요!</SuccessTitle>
              <SuccessDesc>
                총 <strong>{gradeResult.semestersCount}개 학기</strong>,{" "}
                <strong>{gradeResult.subjectsCount}개 과목</strong> 성적이 학점 계산기에 안전하게 저장되었어요.
              </SuccessDesc>

              <ButtonGroup>
                <CapsuleButton
                  variant="secondary"
                  fullWidth
                  onClick={() => {
                    onSuccess?.(savedTimetableResult.totalAdded);
                    onClose();
                    navigate(ROUTES.TIMETABLE.CALCULATOR);
                  }}
                >
                  학점 계산기 보러가기
                </CapsuleButton>
                <CapsuleButton
                  variant="brand"
                  fullWidth
                  onClick={() => {
                    onSuccess?.(savedTimetableResult.totalAdded);
                    onClose();
                  }}
                >
                  완료
                </CapsuleButton>
              </ButtonGroup>
            </GradeSuccessContent>
          )}
        </Container>
      </BottomSheet>

      <PortalAccountModal
        isOpen={isPortalModalOpen}
        onClose={() => setIsPortalModalOpen(false)}
        onSuccess={handlePortalAccountSuccess}
      />
    </>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px 16px 24px;
  gap: 16px;
  max-height: 80vh;
  overflow-y: auto;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: #191f28;
  margin: 0;
`;

const SubTitle = styled.p`
  font-size: 13px;
  color: #8b95a1;
  margin: 0;
  line-height: 1.45;
`;

const ReadyContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SectionGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SemesterHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Label = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #4e5968;
`;

const SelectAllButton = styled.button`
  background: none;
  border: none;
  font-size: 13px;
  color: #0061ff;
  font-weight: 500;
  cursor: pointer;
`;

const SemesterCheckList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  max-height: 220px;
  overflow-y: auto;
  padding: 2px;
`;

const SemesterCheckCard = styled.div<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-radius: 12px;
  border: 1.5px solid ${({ $selected }) => ($selected ? "#0061ff" : "#e5e8eb")};
  background-color: ${({ $selected }) => ($selected ? "#f0f6ff" : "#ffffff")};
  cursor: pointer;
  transition: all 0.15s ease;
`;

const SemesterLabelText = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #191f28;
`;

const OptionCard = styled.div<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1.5px solid ${({ $selected }) => ($selected ? "#0061ff" : "#e5e8eb")};
  background-color: ${({ $selected }) => ($selected ? "#f0f6ff" : "#ffffff")};
  cursor: pointer;
  transition: all 0.2s ease;
`;

const RadioCircle = styled.div<{ $selected: boolean }>`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid ${({ $selected }) => ($selected ? "#0061ff" : "#b0b8c1")};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const RadioDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #0061ff;
`;

const OptionInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const OptionTitle = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #191f28;
`;

const OptionDesc = styled.span`
  font-size: 12px;
  color: #8b95a1;
`;

const ErrorBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  background-color: #fff0f1;
  color: #f04452;
  font-size: 12.5px;
  line-height: 1.4;
`;

const InfoBanner = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  background-color: #f2f4f6;
`;

const InfoBannerIcon = styled.div`
  display: flex;
  align-items: center;
  margin-top: 1px;
`;

const InfoBannerText = styled.span`
  font-size: 12px;
  color: #4e5968;
  line-height: 1.45;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
  gap: 12px;
  text-align: center;
`;

const Spinner = styled.div`
  width: 36px;
  height: 36px;
  border: 3px solid #e5e8eb;
  border-top-color: #0061ff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #191f28;
  margin: 0;
`;

const LoadingDesc = styled.p`
  font-size: 13px;
  color: #8b95a1;
  margin: 0;
  max-width: 280px;
  line-height: 1.45;
`;

const ReviewContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ReviewHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 4px;
`;

const SummaryText = styled.span`
  font-size: 14px;
  color: #333d4b;

  strong {
    color: #0061ff;
  }
`;

const SemesterGroupsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 52vh;
  overflow-y: auto;
  padding-right: 2px;
`;

const GroupCard = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid #e5e8eb;
  border-radius: 14px;
  overflow: hidden;
  background-color: #ffffff;
`;

const GroupHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background-color: #f8f9fb;
  border-bottom: 1px solid #e5e8eb;
  cursor: pointer;
`;

const GroupTitleArea = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const GroupCheckboxSlot = styled.div`
  display: flex;
  align-items: center;
`;

const GroupTitle = styled.span`
  font-size: 14.5px;
  font-weight: 700;
  color: #191f28;
`;

const GroupCountBadge = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #0061ff;
  background-color: #e8f3ff;
  padding: 2px 8px;
  border-radius: 10px;
`;

const ExpandIconSlot = styled.div`
  display: flex;
  align-items: center;
`;

const GroupCourseList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
`;

const CourseItemCard = styled.div<{ $disabled?: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #e5e8eb;
  background-color: ${({ $disabled }) => ($disabled ? "#fafafb" : "#ffffff")};
  opacity: ${({ $disabled }) => ($disabled ? 0.65 : 1)};
  cursor: ${({ $disabled }) => ($disabled ? "default" : "pointer")};
  transition: all 0.15s ease;

  &:hover {
    border-color: ${({ $disabled }) => ($disabled ? "#e5e8eb" : "#0061ff")};
  }
`;

const CheckSlot = styled.div`
  margin-top: 2px;
`;

const Checkbox = styled.div<{ $checked?: boolean; $disabled?: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 1.5px solid
    ${({ $checked, $disabled }) =>
      $disabled ? "#d1d6db" : $checked ? "#0061ff" : "#b0b8c1"};
  background-color: ${({ $checked, $disabled }) =>
    $disabled ? "#e5e8eb" : $checked ? "#0061ff" : "transparent"};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
`;

const CourseMain = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const CourseTitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const CourseTitle = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: #191f28;
`;

const Badge = styled.span<{
  $variant: "success" | "warning" | "danger" | "muted";
}>`
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 6px;
  white-space: nowrap;

  ${({ $variant }) => {
    switch ($variant) {
      case "success":
        return "background-color: #e8f8f0; color: #1b633d;";
      case "warning":
        return "background-color: #fff8e6; color: #d97706;";
      case "danger":
        return "background-color: #fee2e2; color: #dc2626;";
      case "muted":
      default:
        return "background-color: #f2f4f6; color: #8b95a1;";
    }
  }}
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12.5px;
  color: #6b7684;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const TimeSlotList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 2px;
`;

const TimeSlotRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const TimeSlotBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11.5px;
  color: #4e5968;
  background-color: #f2f4f6;
  padding: 2px 6px;
  border-radius: 4px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 4px;
`;

const ImageImportLinkCard = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 14px;
  background-color: #f7f9fc;
  border: 1px solid #e5e8eb;
  border-radius: 12px;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: #f0f4fa;
  }
`;

const ImageImportLinkLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ImageImportLinkTitle = styled.div`
  font-size: 13.5px;
  font-weight: 600;
  color: #191f28;
`;

const ImageImportLinkSub = styled.div`
  font-size: 11.5px;
  color: #8b95a1;
  margin-top: 2px;
`;

const GradePromptContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 8px 4px 16px;
  gap: 16px;
`;

const PromptBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background-color: #e8f3ff;
  border-radius: 20px;
  font-size: 12.5px;
  font-weight: 600;
  color: #0061ff;
`;

const PromptTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: #191f28;
  margin: 0;
  line-height: 1.4;
`;

const PromptDesc = styled.p`
  font-size: 13.5px;
  color: #6b7684;
  margin: 0;
  line-height: 1.5;
  word-break: keep-all;
`;

const PromptFeatureCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  padding: 16px;
  background-color: #f9fafb;
  border: 1px solid #f2f4f6;
  border-radius: 14px;
  text-align: left;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
`;

const FeatureIconBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background-color: #e8f3ff;
  flex-shrink: 0;
`;

const FeatureTextBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const FeatureTextTitle = styled.div`
  font-size: 13.5px;
  font-weight: 600;
  color: #333d4b;
`;

const FeatureTextDesc = styled.div`
  font-size: 12px;
  color: #8b95a1;
  line-height: 1.4;
`;

const GradeSuccessContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px 4px 16px;
  gap: 16px;
`;

const SuccessIconCircle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: #e8f3ff;
`;

const SuccessTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: #191f28;
  margin: 0;
`;

const SuccessDesc = styled.p`
  font-size: 14px;
  color: #4e5968;
  margin: 0;
  line-height: 1.5;
  word-break: keep-all;

  strong {
    color: #0061ff;
  }
`;
