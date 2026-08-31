import { Drawer } from "vaul";
import styled from "styled-components";
import { ClassItem } from "./TimetableGrid";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import Icon from "@/components/common/Icon";
import { useState, useEffect, useRef, useMemo } from "react";
import { useTimetableStore } from "@/stores/useTimetableStore";
import { useCourses } from "@/hooks/useCourses";
import { useCourseOfferings } from "@/hooks/useCourseOfferings";
import { getOnlineTypeLabel } from "@/components/mobile/timetable/filter/courseFilterModel";
import { useSheetBackHandler } from "@/hooks/useSheetBackHandler";

const SYLLABUS_UNAVAILABLE_MESSAGE =
  "현 시점에는 제공되지 않아요. 원동력을 위해 학우 여러분의 많은 관심과 성원을 부탁드립니다!";
const LECTURE_REVIEW_NOTICE_KEY = "lectureReviewEverytimeNoticeShown";
const LECTURE_REVIEW_NOTICE_MESSAGE =
  "현 시점에는 에브리타임 강의평 페이지로 이동해요. 다음학기부터 강의평 서비스가 제공될 예정이에요.";

interface ClassDetailBottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedClass: ClassItem | null;
  allEvents: ClassItem[];
  colorMap: Map<string, string>;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  // 실제 내 시간표 요소가 아닌 읽기 전용 미리보기(예: 마법사 후보 강의)에서 사용.
  // 메모 표시/편집을 막아, 미리보기 항목의 memo 저장 시도가 activeTimetable의
  // 이름이 같은 실제 요소를 잘못 덮어쓰는 것을 방지한다.
  readOnly?: boolean;
}

const formatHour = (hour: number) => {
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export default function ClassDetailBottomSheet({
  open,
  onOpenChange,
  selectedClass,
  allEvents,
  colorMap,
  onEdit,
  onDelete,
  readOnly = false,
}: ClassDetailBottomSheetProps) {
  useSheetBackHandler(open, () => onOpenChange(false));
  const navigate = useNavigate();
  const { activeTimetableId, timetables, updateTimetableEvents } =
    useTimetableStore();

  const isQueryEnabled =
    open && Boolean(selectedClass) && !selectedClass?.isCustom;
  const { courses } = useCourses(undefined, { enabled: isQueryEnabled });
  const { courseOfferings } = useCourseOfferings(
    undefined,
    undefined,
    undefined,
    { enabled: isQueryEnabled },
  );

  const courseById = useMemo(
    () => new Map(courses.map((c) => [c.id, c])),
    [courses],
  );

  const offeringById = useMemo(
    () => new Map(courseOfferings.map((o) => [o.id, o])),
    [courseOfferings],
  );

  // 동일 학수번호의 분반 중 첫 번째 개설강의 유지
  const offeringBySubNum = useMemo(() => {
    const map = new Map<string, (typeof courseOfferings)[0]>();
    for (const offering of courseOfferings) {
      if (offering.subjectNumber && !map.has(offering.subjectNumber)) {
        map.set(offering.subjectNumber, offering);
      }
    }
    return map;
  }, [courseOfferings]);

  const [isEditingMemo, setIsEditingMemo] = useState(false);
  const [memoInput, setMemoInput] = useState("");
  const memoInputRef = useRef<HTMLTextAreaElement>(null);

  const liveClass = selectedClass
    ? allEvents.find(
        (e) =>
          e.id === selectedClass.id &&
          Boolean(e.isFriendOwned) === Boolean(selectedClass.isFriendOwned) &&
          e.ownerName === selectedClass.ownerName,
      ) || selectedClass
    : null;

  const offering = liveClass
    ? (liveClass.courseOfferingId
        ? offeringById.get(liveClass.courseOfferingId)
        : null) ||
      (liveClass.courseId ? offeringBySubNum.get(liveClass.courseId) : null)
    : null;

  // offering이 존재하면 offering.courseId로 조회하고, 그렇지 않으면 liveClass.numericCourseId로 직접 조회
  const course = offering
    ? courseById.get(offering.courseId)
    : liveClass?.numericCourseId
      ? courseById.get(liveClass.numericCourseId)
      : null;

  const adjustHeight = (element: HTMLTextAreaElement) => {
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  };

  useEffect(() => {
    if (liveClass) {
      setMemoInput(liveClass.memo || "");
      setIsEditingMemo(false);
    }
  }, [selectedClass, allEvents]);

  useEffect(() => {
    if (isEditingMemo && memoInputRef.current) {
      memoInputRef.current.focus();
      adjustHeight(memoInputRef.current);
      const len = memoInputRef.current.value.length;
      memoInputRef.current.setSelectionRange(len, len);
    }
  }, [isEditingMemo]);

  if (!liveClass) return null;

  const professorName =
    liveClass.professor?.trim() || offering?.professor?.trim() || "-";

  const creditsVal =
    liveClass.credits ?? offering?.credit ?? course?.credit ?? 0;

  const evaluationVal =
    offering?.gradeEvaluationName || liveClass.evaluation || "";

  const lectureReviewUrl =
    professorName && professorName !== "-"
      ? `https://everytime.kr/lecture/search?keyword=${encodeURIComponent(professorName)}&condition=professor`
      : "";
  const handleLectureReviewClick = () => {
    if (!lectureReviewUrl) {
      alert("교수명 정보가 없어 강의평을 바로 찾을 수 없어요.");
      return;
    }
    if (!localStorage.getItem(LECTURE_REVIEW_NOTICE_KEY)) {
      alert(LECTURE_REVIEW_NOTICE_MESSAGE);
      localStorage.setItem(LECTURE_REVIEW_NOTICE_KEY, "true");
    }
    window.open(lectureReviewUrl, "_blank", "noopener,noreferrer");
  };

  const matchingClasses = allEvents
    .filter((e) => e.name === liveClass.name)
    .sort((a, b) => a.day - b.day || a.startTime - b.startTime);

  const dotColor = colorMap.get(liveClass.name) || "var(--text-brand, #0061FF)";

  const gradeStr = offering?.hyName
    ? offering.hyName === "0"
      ? "전학년"
      : `${offering.hyName}학년`
    : course?.targetGradeName
      ? `${course.targetGradeName}`
      : liveClass.grade
        ? typeof liveClass.grade === "number" || !isNaN(Number(liveClass.grade))
          ? `${liveClass.grade}학년`
          : liveClass.grade
        : "";

  const courseTypeStr =
    offering?.isuName ||
    offering?.isuFldName ||
    course?.completionDivisionName ||
    liveClass.courseType ||
    "";

  const courseIdStr = offering?.subjectNumber || liveClass.courseId || "";

  const onlineTypeStr = getOnlineTypeLabel(
    offering?.ssupTypeName || liveClass.ssupTypeName,
    offering?.ssupTypeCode || liveClass.ssupTypeCode,
  );

  const detailsList = [gradeStr, courseTypeStr, onlineTypeStr, courseIdStr].filter(Boolean);
  const detailsText = detailsList.join("  ");

  const scheduleText = matchingClasses
    .filter((item) => !item.isUntimed)
    .map((item) => {
      const dayChar =
        ["월", "화", "수", "목", "금", "토", "일"][item.day] || "";
      return `${dayChar} (${formatHour(item.startTime)}~${formatHour(item.endTime)})`;
    })
    .join(", ");

  const roomVal = liveClass.room || offering?.meetings[0]?.location || "-";
  // 일반 강의(학교 수업)는 수정 대상이 아니다. isCustom은 상세 응답의
  // type === "CUSTOM"으로 정확히 채워지므로(utils/timetable.ts) 이것만 본다.
  // courseId/courseOfferingId가 비었는지로 추정하면, 둘 다 없는 일반 강의가
  // 커스텀으로 오판돼 수정 버튼이 뜬다(눌러도 handleEdit 가드에 걸려 무반응).
  const isCustomCourse = Boolean(liveClass.isCustom);

  // 메모는 본인만 보는 개인 메모. 친구 소유 항목은 조회/편집 모두 불가하다.
  const hasMemo = Boolean(liveClass.memo && liveClass.memo.trim());
  const canEditMemo = !liveClass.isFriendOwned && !readOnly;

  const handleSaveMemo = () => {
    if (activeTimetableId === null) return;
    const activeTimetable = timetables.find((t) => t.id === activeTimetableId);
    if (!activeTimetable) return;

    const updatedEvents = activeTimetable.events.map((e) => {
      if (e.id === liveClass.id || e.name === liveClass.name) {
        return { ...e, memo: memoInput };
      }
      return e;
    });

    updateTimetableEvents(activeTimetableId, updatedEvents);
    setIsEditingMemo(false);
  };

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} modal={true}>
      <Drawer.Portal>
        <StyledOverlay />
        <StyledContent>
          <SheetInner>
            <DragHeader>
              <HandleBar />
            </DragHeader>

            <ContentArea>
              <ScrollableBody>
                <ClassInfoContainer>
                  <CourseHeaderRow>
                    <HeaderMain>
                      <TitleLine>
                        <ColorDot $color={dotColor} />
                        <ClassTitle>{liveClass.name}</ClassTitle>
                        {liveClass.ownerName && (
                          <OwnerBadge>{liveClass.ownerName}</OwnerBadge>
                        )}
                      </TitleLine>
                      <SubtitleLine>
                        <ProfessorName>{professorName}</ProfessorName>
                        <CreditText>{creditsVal}학점</CreditText>
                        <EvaluationText>{evaluationVal}</EvaluationText>
                      </SubtitleLine>
                    </HeaderMain>

                    <HeaderActions>
                      {isCustomCourse && onEdit && (
                        <EditButton
                          type="button"
                          onClick={() => {
                            onEdit(liveClass.id);
                            onOpenChange(false);
                          }}
                        >
                          <Icon name="edit-pencil-01" size={18} />
                        </EditButton>
                      )}
                      {!readOnly && !liveClass.isFriendOwned && onDelete && (
                        <DeleteButton
                          type="button"
                          onClick={() => {
                            onDelete(liveClass.id);
                            onOpenChange(false);
                          }}
                        >
                          <Icon name="trash-full" size={18} />
                        </DeleteButton>
                      )}
                    </HeaderActions>
                  </CourseHeaderRow>

                  <DetailsSection>
                    {detailsText && (
                      <DetailsTextRow>{detailsText}</DetailsTextRow>
                    )}
                    {scheduleText && (
                      <DetailsTextRow>{scheduleText}</DetailsTextRow>
                    )}
                    <RoomRow>
                      <RoomText>{roomVal}</RoomText>
                      <RoomMapButton
                        type="button"
                        onClick={() => {
                          // 새 웹뷰로 열려도(멀티 웹뷰 앱) 값이 유실되지 않도록
                          // router state가 아니라 URL 쿼리로 전달한다 (#274).
                          navigate(
                            `${ROUTES.BOARD.CAMPUS}?search=${encodeURIComponent(roomVal)}`,
                          );
                          onOpenChange(false);
                        }}
                      >
                        <Icon name="image" size={16} />
                      </RoomMapButton>
                    </RoomRow>
                  </DetailsSection>
                </ClassInfoContainer>

                {/*
                  메모는 본인만 보는 개인 메모이므로 친구 소유 항목(isFriendOwned)인 경우
                  필드 자체를 노출하지 않는다.
                  내 항목이면서 메모가 아직 없는 경우에는 "메모 추가" 진입점만 축소해서 보여준다.
                */}
                {!liveClass.isFriendOwned && (hasMemo || canEditMemo) && (
                  <InfoField
                    onClick={() =>
                      canEditMemo && !isEditingMemo && setIsEditingMemo(true)
                    }
                  >
                    {isEditingMemo ? (
                      <>
                        <MemoHeaderRow>
                          <FieldLabel style={{ cursor: "pointer" }}>
                            메모
                          </FieldLabel>
                          {memoInput !== (liveClass.memo || "") && (
                            <MemoSaveLink
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSaveMemo();
                              }}
                            >
                              저장
                            </MemoSaveLink>
                          )}
                        </MemoHeaderRow>
                        <MemoEditContainer onClick={(e) => e.stopPropagation()}>
                          <SeamlessTextarea
                            ref={memoInputRef}
                            value={memoInput}
                            onChange={(e) => {
                              setMemoInput(e.target.value);
                              adjustHeight(e.target);
                            }}
                            placeholder="메모를 입력하세요."
                            rows={1}
                          />
                        </MemoEditContainer>
                      </>
                    ) : hasMemo ? (
                      <>
                        <FieldLabel
                          style={{
                            cursor: canEditMemo ? "pointer" : "default",
                          }}
                        >
                          메모
                        </FieldLabel>
                        <FieldValue
                          style={{
                            cursor: canEditMemo ? "pointer" : "default",
                            color: "var(--text-secondary, #333d4b)",
                          }}
                        >
                          {liveClass.memo}
                        </FieldValue>
                      </>
                    ) : (
                      <AddMemoButton
                        type="button"
                        onClick={() => setIsEditingMemo(true)}
                      >
                        + 메모 추가
                      </AddMemoButton>
                    )}
                  </InfoField>
                )}
              </ScrollableBody>

              <FooterSection>
                <FooterButtonGroup>
                  <LectureReviewButton
                    type="button"
                    onClick={handleLectureReviewClick}
                  >
                    강의평
                  </LectureReviewButton>
                  <SyllabusButton
                    type="button"
                    onClick={() => {
                      alert(SYLLABUS_UNAVAILABLE_MESSAGE);
                    }}
                  >
                    강의계획서
                  </SyllabusButton>
                </FooterButtonGroup>
              </FooterSection>
            </ContentArea>
          </SheetInner>
        </StyledContent>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

const StyledOverlay = styled(Drawer.Overlay)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(4px);
  z-index: 10010;
`;

const StyledContent = styled(Drawer.Content)`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10020;
  outline: none;

  height: auto;
  min-height: 35dvh;
  max-height: 85dvh;
  display: flex;
  flex-direction: column;

  max-width: 768px;
  margin: 0 auto;
`;

const SheetInner = styled.div`
  background: var(--bg-base);
  width: 100%;
  border-top-left-radius: 32px;
  border-top-right-radius: 32px;
  overflow: hidden;
  padding-bottom: env(safe-area-inset-bottom, 0px);

  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
`;

const DragHeader = styled.div`
  height: 20px;
  padding: 16px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-sizing: border-box;
`;

const HandleBar = styled.div`
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: var(--border-default, #e5e8eb);
`;

const ContentArea = styled.div`
  padding: 12px 16px 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;

const ScrollableBody = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;

  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const TitleLine = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ColorDot = styled.div<{ $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${({ $color }) => $color};
  flex-shrink: 0;
`;

const ClassTitle = styled.h2`
  overflow: hidden;
  color: var(--text-secondary, #333d4b);
  text-overflow: ellipsis;
  margin: 0;
  font-family: Pretendard, sans-serif;
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  line-height: 32px;
`;

const OwnerBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  border-radius: 999px;
  background-color: var(--bg-muted, #f1f3f5);
  color: var(--text-secondary, #333d4b);
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;
  margin-left: 4px;
`;

const InfoField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  border-bottom: 1px solid var(--border-default, #e5e8eb);
  padding: 8px 20px;
`;

const FieldLabel = styled.span`
  overflow: hidden;
  color: var(--text-tertiary, #8b95a1);
  text-overflow: ellipsis;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 16px;
`;

const FieldValue = styled.span`
  display: block;
  overflow: hidden;
  color: var(--text-secondary, #333d4b);
  text-overflow: ellipsis;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 1.6;
`;

const FooterSection = styled.div`
  padding-top: 48px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const BaseFooterButton = styled.button`
  width: 100%;
  padding: 12px 24px;
  border-radius: 999px;
  border: 1px solid transparent;
  font-family: Pretendard, sans-serif;
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  line-height: 32px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LectureReviewButton = styled(BaseFooterButton)`
  border: 1px solid var(--border-warn-subtle, #fef3c7);
  background: var(--bg-warn, #fffaeb);
  color: var(--text-warn, #b58000);

  &:active:not(:disabled) {
    transform: scale(0.98);
    background: #fff4d1;
  }
`;

const SyllabusButton = styled(BaseFooterButton)`
  border: 1px solid var(--border-brand-subtle, #d3e5ff);
  background: var(--bg-brand, #eff6ff);
  color: var(--text-brand, #0061ff);

  &:active:not(:disabled) {
    transform: scale(0.98);
    background: #dfeeff;
  }
`;

const ClassInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;

const CourseHeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  padding-right: 8px;
`;

const HeaderMain = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
`;

const SubtitleLine = styled.div`
  display: flex;
  gap: 12px;
  padding-left: 20px;
  align-items: center;
  font-family: Pretendard, sans-serif;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
`;

const ProfessorName = styled.span`
  color: var(--text-secondary, #333d4b);
`;

const CreditText = styled.span`
  color: var(--text-tertiary, #8b95a1);
`;

const EvaluationText = styled.span`
  color: var(--text-tertiary, #8b95a1);
`;

const DeleteButton = styled.button`
  background: var(--bg-error, #fff0f0);
  border: 1px solid var(--border-error-subtle, #ffd8d8);
  border-radius: 999px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-error, #ff4d4f);
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  margin-top: 4px;

  &:active {
    transform: scale(0.95);
  }
`;

const EditButton = styled(DeleteButton)`
  background: var(--bg-brand, #eff6ff);
  border: 1px solid var(--border-brand-subtle, #d3e5ff);
  color: var(--text-brand, #0061ff);
  margin-right: 8px;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
`;

const DetailsSection = styled.div`
  display: flex;
  flex-direction: column;
  padding-left: 20px;
  width: 100%;
`;

const DetailsTextRow = styled.div`
  color: var(--text-tertiary, #8b95a1);
  font-family: Pretendard, sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 28px;
  white-space: pre-wrap;
  word-break: break-word;
`;

const RoomRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
`;

const RoomText = styled.span`
  color: var(--text-tertiary, #8b95a1);
  font-family: Pretendard, sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 28px;
`;

const RoomMapButton = styled.button`
  background: var(--bg-muted, #f1f3f5);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 999px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary, #333d4b);
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;

  &:active {
    transform: scale(0.95);
  }
`;

const FooterButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  width: 100%;
`;

const MemoEditContainer = styled.div`
  width: 100%;
  position: relative;
`;

const MemoHeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const MemoSaveLink = styled.button`
  background: none;
  border: none;
  font-family: Pretendard, sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-brand, #0061ff);
  cursor: pointer;
  padding: 0;
  margin: 0;

  &:active {
    opacity: 0.7;
  }
`;

const AddMemoButton = styled.button`
  background: none;
  border: none;
  font-family: Pretendard, sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-tertiary, #8b95a1);
  cursor: pointer;
  padding: 0;
  margin: 0;
  align-self: flex-start;

  &:active {
    opacity: 0.7;
  }
`;

const SeamlessTextarea = styled.textarea`
  border: none;
  background: transparent;
  outline: none;
  padding: 0;
  margin: 0;
  width: 100%;
  resize: none;
  font-family: inherit;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 1.6;
  color: var(--text-secondary, #333d4b);
  box-sizing: border-box;
  display: block;
  overflow: hidden;
`;
