import { useCallback, useEffect, useRef } from "react";
import styled from "styled-components";
import { MessagesSquare, SearchX } from "lucide-react";
import Icon from "@/components/common/Icon";
import Skeleton from "@/components/common/Skeleton";
import { ClassItem } from "@/components/mobile/timetable/TimetableGrid";
import {
  getOnlineTypeLabel,
  getEnrollmentLabel,
} from "@/components/mobile/timetable/filter/courseFilterModel";

export interface CourseResult {
  id: number;
  name: string;
  professor: string;
  timeStr: string;
  room: string;
  grade: number;
  isMajor: boolean;
  credits: number;
  courseId: string;
  remarks?: string;
  // 서버 수강인원/정원 데이터가 아직 동기화되지 않아 null일 수 있음 - null이면 배지 자체를 숨김
  enrolledCount: number | null;
  capacity: number | null;
  savedCount?: number | null;
  schedules: ClassItem[];
  deptName?: string;
  collegeName?: string;
  isuName?: string;
  isuFldName?: string;
  hyName?: string;
  ssupTypeName?: string;
  ssupTypeCode?: string;
  gradeEvaluationMethod: string;
}

const SYLLABUS_UNAVAILABLE_MESSAGE =
  "현 시점에는 제공되지 않아요. 원동력을 위해 학우 여러분의 많은 관심과 성원을 부탁드립니다!";
const LECTURE_REVIEW_NOTICE_KEY = "lectureReviewEverytimeNoticeShown";
const LECTURE_REVIEW_NOTICE_MESSAGE =
  "현 시점에는 에브리타임 강의평 페이지로 이동해요. 다음학기부터 강의평 서비스가 제공될 예정이에요.";

const openLectureReview = (professor: string) => {
  const professorName = professor?.trim() || "";
  if (!professorName) {
    alert("교수명 정보가 없어 강의평을 바로 찾을 수 없어요.");
    return;
  }

  if (!localStorage.getItem(LECTURE_REVIEW_NOTICE_KEY)) {
    alert(LECTURE_REVIEW_NOTICE_MESSAGE);
    localStorage.setItem(LECTURE_REVIEW_NOTICE_KEY, "true");
  }

  const url = `https://everytime.kr/lecture/search?keyword=${encodeURIComponent(professorName)}&condition=professor`;
  window.open(url, "_blank", "noopener,noreferrer");
};

export interface CourseResultListProps {
  courses: CourseResult[];
  expandedId: number | null;
  onToggleExpand: (id: number) => void;
  /** 행의 주 액션. 없으면 버튼 줄 자체를 그리지 않는다. */
  onAddCourse?: (course: CourseResult) => void;
  /** 이미 담긴(=주 액션이 끝난) 행. 시간표 편집은 개설강의 id, 이미지 인식은 선택된 분반 id를 넘긴다. */
  addedCourseOfferingIds?: Set<number>;
  addedCourseIds?: Set<string>;
  addLabel?: string;
  addedLabel?: string;
  /** 강의평·강의계획서 버튼. 분반 하나를 고르는 화면에서는 군더더기라 끌 수 있다. */
  showSecondaryActions?: boolean;
  /** "시간 일치" 배지를 붙일 행. 이미지 인식 결과의 요일/시간과 맞는 분반을 눈에 띄게 한다. */
  highlightedIds?: Set<number>;
  /** 행을 펼쳤을 때 버튼 줄까지 보이도록 스크롤을 맞춘다. 높이가 좁은 모달용. */
  scrollExpandedIntoView?: boolean;
  isLoading?: boolean;
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

const CourseSkeletonCard = ({ withBottom = true }: { withBottom?: boolean }) => (
  <SkeletonCard>
    <div className="skeleton-row-top">
      <Skeleton width="45%" height="20px" />
      <Skeleton width="70px" height="20px" style={{ borderRadius: "999px" }} />
    </div>
    <div className="skeleton-row-mid">
      <Skeleton width="50px" height="16px" />
      <Skeleton width="40px" height="16px" />
      <Skeleton width="50px" height="16px" />
    </div>
    {withBottom && (
      <div className="skeleton-row-bottom">
        <Skeleton width="30%" height="14px" />
        <Skeleton width="50%" height="14px" />
      </div>
    )}
  </SkeletonCard>
);

/**
 * 개설강의 검색 결과 목록.
 *
 * 시간표 편집의 검색 바텀시트(MobileCourseSearchSheet)와 시간표 이미지 인식의
 * 분반 검색 모달이 같은 행 레이아웃·빈 상태·무한 스크롤을 공유한다. 필터 UI와
 * 시트(react-modal-sheet) 껍데기는 각 화면이 따로 소유한다 - 여기는 목록만 그린다.
 */
const CourseResultList = ({
  courses,
  expandedId,
  onToggleExpand,
  onAddCourse,
  addedCourseOfferingIds,
  addedCourseIds,
  addLabel = "시간표에 추가",
  addedLabel = "추가됨",
  showSecondaryActions = true,
  highlightedIds,
  scrollExpandedIntoView = false,
  isLoading = false,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  emptyTitle = "조회된 강의가 없습니다",
  emptyDescription = "검색어나 필터 조건을 변경해 보세요",
}: CourseResultListProps) => {
  const listRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // 마지막 행을 펼치면 버튼 줄이 스크롤 영역 밖에 생겨 잘려 보인다.
  // "nearest"라 이미 다 보이는 행은 건드리지 않는다.
  useEffect(() => {
    if (!scrollExpandedIntoView || expandedId == null) return;
    const row = listRef.current?.querySelector<HTMLElement>(
      `[data-course-id="${expandedId}"]`,
    );
    row?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [scrollExpandedIntoView, expandedId]);

  const fetchNextPageRef = useRef(fetchNextPage);
  const hasNextPageRef = useRef(hasNextPage);
  const isFetchingRef = useRef(false);

  // 옵저버 콜백은 렌더 밖에서 비동기로 불리므로 최신 값만 ref로 흘려보낸다.
  // (렌더 중에 ref를 쓰면 react-hooks/refs 위반이라 커밋 이후로 미룬다.)
  useEffect(() => {
    fetchNextPageRef.current = fetchNextPage;
    hasNextPageRef.current = hasNextPage;
    isFetchingRef.current = Boolean(isLoading || isFetchingNextPage);
  });

  const loadMoreRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) observerRef.current.disconnect();
    if (!node) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (
          entry?.isIntersecting &&
          hasNextPageRef.current &&
          !isFetchingRef.current &&
          fetchNextPageRef.current
        ) {
          isFetchingRef.current = true;
          fetchNextPageRef.current();
        }
      },
      { threshold: 0.1 },
    );

    observerRef.current.observe(node);
  }, []);

  return (
    <CourseList ref={listRef}>
      {isLoading ? (
        Array.from({ length: 6 }).map((_, index) => (
          <CourseSkeletonCard key={`course-skeleton-${index}`} />
        ))
      ) : courses.length === 0 ? (
        <EmptyContainer>
          <SearchIconBox>
            <SearchX size={32} color="var(--gray-400, #b0b8c1)" />
          </SearchIconBox>
          <EmptyTitle>{emptyTitle}</EmptyTitle>
          <EmptyDescription>{emptyDescription}</EmptyDescription>
        </EmptyContainer>
      ) : (
        courses.map((course) => {
          const isExpanded = expandedId === course.id;
          const isAdded = Boolean(
            addedCourseOfferingIds?.has(course.id) ||
              (course.courseId && addedCourseIds?.has(course.courseId)),
          );
          const onlineTypeLabel = getOnlineTypeLabel(
            course.ssupTypeName,
            course.ssupTypeCode,
          );
          const enrollmentLabel = getEnrollmentLabel(
            course.enrolledCount,
            course.capacity,
          );

          return (
            <CourseItem
              key={course.id}
              data-course-id={course.id}
              onClick={() => onToggleExpand(course.id)}
            >
              {/* 기본 정보 */}
              <InfoRow>
                <MainInfo>
                  <CourseName>{course.name}</CourseName>
                </MainInfo>
                <RightInfo>
                  {highlightedIds?.has(course.id) && (
                    <MatchBadge>시간 일치</MatchBadge>
                  )}
                  {course.savedCount != null && (
                    <SavedBadge>{course.savedCount}명 담음</SavedBadge>
                  )}
                  {enrollmentLabel && (
                    <EnrolledBadge>{enrollmentLabel}</EnrolledBadge>
                  )}
                </RightInfo>
              </InfoRow>

              <CourseAttributes>
                <AttributeItem $primary>{course.professor}</AttributeItem>
                <AttributeItem>{course.credits}학점</AttributeItem>
                <AttributeItem>{course.gradeEvaluationMethod}</AttributeItem>
              </CourseAttributes>

              <CourseAdditionalInfo>
                <InfoLine>
                  <span>
                    {course.grade > 0 ? `${course.grade}학년` : "전학년"}
                  </span>
                  {/* 서버 이수구분(전공기초/전공핵심/전공심화/기초교양/핵심교양/
                      심화교양/교직/일반선택/군사학)을 그대로 보여준다. 전공/교양
                      두 갈래로 뭉개면 전공핵심·전공기초가 "전공심화"로, 교직·
                      일반선택이 "교양"으로 잘못 표시된다. */}
                  <span>{course.isuName || "-"}</span>
                  {onlineTypeLabel && <span>{onlineTypeLabel}</span>}
                  <span>{course.courseId}</span>
                </InfoLine>
                <div>{course.timeStr}</div>
                <div>{course.room}</div>
              </CourseAdditionalInfo>

              {/* 확장 영역 */}
              {isExpanded && (
                <ExpandedArea>
                  {course.remarks && (
                    <RemarkText>비고 : {course.remarks}</RemarkText>
                  )}
                  {(onAddCourse || showSecondaryActions) && (
                    <ButtonRow>
                      {onAddCourse && (
                        <PrimaryActionButton
                          disabled={isAdded}
                          $isAdded={isAdded}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isAdded) onAddCourse(course);
                          }}
                        >
                          {isAdded ? (
                            <Icon name="check" size={20} />
                          ) : (
                            <Icon name="add-plus-sm" size={20} />
                          )}
                          {isAdded ? addedLabel : addLabel}
                        </PrimaryActionButton>
                      )}
                      {showSecondaryActions && (
                        <>
                          <SecondaryActionButton
                            onClick={(e) => {
                              e.stopPropagation();
                              openLectureReview(course.professor);
                            }}
                          >
                            <MessagesSquare size={20} />
                            강의평
                          </SecondaryActionButton>
                          <SecondaryActionButton
                            onClick={(e) => {
                              e.stopPropagation();
                              alert(SYLLABUS_UNAVAILABLE_MESSAGE);
                            }}
                          >
                            <Icon name="file-document" size={20} />
                            강의계획서
                          </SecondaryActionButton>
                        </>
                      )}
                    </ButtonRow>
                  )}
                </ExpandedArea>
              )}
            </CourseItem>
          );
        })
      )}
      {isFetchingNextPage && (
        <CourseSkeletonCard key="next-page-skeleton" withBottom={false} />
      )}
      {hasNextPage && (
        <div ref={loadMoreRef} style={{ height: "20px", width: "100%" }} />
      )}
    </CourseList>
  );
};

export default CourseResultList;

// --- 스타일 ---

const CourseList = styled.div`
  padding: 0;
`;

const EmptyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 20px;
  text-align: center;
`;

const SearchIconBox = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--bg-muted, #f1f3f5);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
`;

const EmptyTitle = styled.h3`
  font-family: Pretendard, sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-secondary, #333d4b);
  margin: 0 0 6px 0;
`;

const EmptyDescription = styled.p`
  font-family: Pretendard, sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: var(--text-tertiary, #8b95a1);
  margin: 0;
`;

const SkeletonCard = styled.div`
  padding: 12px 0;
  border-bottom: 1px solid var(--border-default, #e5e8eb);
  display: flex;
  flex-direction: column;
  gap: 8px;

  .skeleton-row-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .skeleton-row-mid {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .skeleton-row-bottom {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
`;

const CourseItem = styled.div`
  padding: 12px 0;
  border-bottom: 1px solid var(--border-default, #e5e8eb);
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  transition: background-color 0.2s;

  /* The sheet's per-frame drag-driven scrollPaddingBottom (see
     CourseSheetScrollableContent) forces a layout recalculation on every
     animation tick, and with an unvirtualized course list that cost scales
     with row count — the main source of Android-only jank here (WKWebView
     doesn't show the same behavior). content-visibility skips layout/paint
     for rows currently off-screen entirely, instead of just scoping
     invalidation (plain contain doesn't stop the browser from still doing
     the work for every row). "auto <length>" remembers each row's real
     rendered height after it's first been on-screen, so the placeholder only
     matters before that — safe here since the sheet's snap points are
     viewport-ratio based (COURSE_SEARCH_SNAP_POINTS), not derived from this
     list's scrollHeight. */
  content-visibility: auto;
  contain-intrinsic-size: auto 140px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MainInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const CourseName = styled.h3`
  color: var(--text-secondary, #333d4b);

  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 24px;
  margin: 0;
`;

const RightInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const EnrolledBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid var(--border-brand-subtle, #d3e5ff);
  background: var(--bg-brand-subtle, #eff6ff);
  color: var(--text-brand, #0061ff);

  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 16px;
`;

const SavedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid var(--border-brand-subtle, #d3e5ff);
  background: var(--bg-brand, #eff6ff);
  color: var(--text-brand, #0061ff);

  font-family: Pretendard, sans-serif;
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 16px;
`;

const MatchBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid var(--border-brand, #0061ff);
  background: var(--interactive-primary, #3b82f6);
  color: var(--text-inverse, #fff);

  font-family: Pretendard, sans-serif;
  font-size: 12px;
  font-style: normal;
  font-weight: 600;
  line-height: 16px;
  white-space: nowrap;
`;

const CourseAttributes = styled.div`
  display: flex;
  flex-direction: row;
  gap: 12px;
  align-items: center;
`;

const AttributeItem = styled.span<{ $primary?: boolean }>`
  color: ${({ $primary }) =>
    $primary
      ? "var(--text-secondary, #333d4b)"
      : "var(--text-tertiary, #8b95a1)"};
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px;
`;

const CourseAdditionalInfo = styled.div`
  display: flex;
  flex-direction: column;
  color: var(--text-tertiary, #8b95a1);
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;

  margin-top: 4px;
`;

const InfoLine = styled.div`
  display: flex;
  gap: 12px;
`;

const ExpandedArea = styled.div`
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  animation: fadeIn 0.2s ease-in-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const RemarkText = styled.div`
  color: var(--text-tertiary, #8b95a1);

  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 12px;
  border-radius: 999px;
  cursor: pointer;
  border: none;
  outline: none;
  transition: all 0.2s ease-in-out;
  box-sizing: border-box;

  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px;

  &:active {
    transform: scale(0.96);
  }
`;

const PrimaryActionButton = styled(ActionButton)<{ $isAdded?: boolean }>`
  border-radius: 999px;
  background: ${({ $isAdded }) =>
    $isAdded
      ? "var(--bg-subtle-dark, #e5e8eb)"
      : "var(--interactive-primary, #3b82f6)"};

  color: ${({ $isAdded }) =>
    $isAdded ? "var(--text-tertiary, #8b95a1)" : "#fff"};

  ${({ $isAdded }) =>
    $isAdded &&
    `
    background-color: var(--bg-neutral-subtle, #f2f4f6) !important;
    color: var(--text-tertiary, #8b95a1) !important;
    border: 1px solid var(--border-default, #e5e8eb);
    cursor: not-allowed;
    opacity: 0.8;
  `}
`;

const SecondaryActionButton = styled(ActionButton)`
  border: 1px solid var(--border-default, #e5e8eb);
  background: var(--bg-subtle, #f8f9fb);

  color: var(--text-primary, #333d4b);
`;
