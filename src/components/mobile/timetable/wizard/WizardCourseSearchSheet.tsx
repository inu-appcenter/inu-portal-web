import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import { Sheet, SheetRef } from "react-modal-sheet";
import { useTransform } from "motion/react";
import {
  Check,
  ChevronLeft,
  FileText,
  MessagesSquare,
  Plus,
  RotateCcw,
  SearchX,
  SlidersHorizontal,
  X,
} from "lucide-react";
import Skeleton from "@/components/common/Skeleton";
import CapsuleButton from "@/components/common/CapsuleButton";
import FloatingSearchBar, {
  FloatingSearchBarRef,
} from "@/components/mobile/common/FloatingSearchBar";
import CourseFilterPanel, {
  resetTimeFilter,
} from "@/components/mobile/timetable/filter/CourseFilterPanel";
import {
  FILTER_SUB_VIEW_TITLES,
  countActiveFilters,
  getOnlineTypeLabel,
  getEnrollmentLabel,
} from "@/components/mobile/timetable/filter/courseFilterModel";
import { mapFilterToOfferingFilters } from "@/utils/courseSearchResult";
import { toWizardCourseOption } from "@/utils/timetableWizardPool";
import { DAY_INDEX } from "@/utils/timetable";
import { useCourses } from "@/hooks/useCourses";
import { useCourseOfferings } from "@/hooks/useCourseOfferings";
import useUserStore from "@/stores/useUserStore";
import {
  WIZARD_SEARCH_SNAP_POINTS,
  useTimetableWizardStore,
} from "@/stores/useTimetableWizardStore";
import type { CourseOffering } from "@/types/courseOfferings";
import type { Course } from "@/types/courses";
import type { WizardCourseOption } from "@/types/timetableWizard";

/**
 * 마법사의 강의 선택 바텀시트.
 *
 * 겉모습(3단 스냅, 하단 플로팅 필터/검색 FAB, 강의 행 레이아웃)은 시간표 편집 화면의
 * MobileCourseSearchSheet와 동일하다. 다른 건 상태 소유권뿐이다.
 *
 * 이 컴포넌트는 상태를 소유하지 않는다(검색바 활성 여부 같은 순수 표시용 제외).
 * 열림 여부·스냅 위치·검색어·필터·펼친 행은 전부 useTimetableWizardStore가, 서버 목록은
 * react-query가 소유하고, 화면은 그 둘에서 계산만 한다. 그래서 부모/자식 필터 동기화,
 * localStorage 핸드오프, focus·visibilitychange 복원 같은 상태 이상 요인이 존재할 수 없다.
 * 검색어도 URL 쿼리스트링이 아니라 스토어가 소유한다(FloatingSearchBar에 searchParamKey를
 * 넘기지 않는 이유) - 필터가 라우트 이동을 하지 않으므로 URL로 값을 나를 이유가 없다.
 */

// react-modal-sheet의 스냅 값은 뷰포트가 아니라 컨테이너 높이 기준이라 환산해서 넘긴다.
// 인덱스 0(완전히 접힌 위치)은 사용자 스냅 대상이 아니므로 스토어 인덱스와 1만큼 어긋난다.
const SHEET_CONTAINER_RATIO = 0.9; // SheetContainer의 height: 90dvh
const SHEET_SNAP_POINTS = [
  0,
  ...WIZARD_SEARCH_SNAP_POINTS.map((ratio) => ratio / SHEET_CONTAINER_RATIO),
];

const DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

const SYLLABUS_UNAVAILABLE_MESSAGE =
  "현 시점에는 제공되지 않아요. 원동력을 위해 학우 여러분의 많은 관심과 성원을 부탁드립니다!";
const LECTURE_REVIEW_NOTICE_KEY = "lectureReviewEverytimeNoticeShown";
const LECTURE_REVIEW_NOTICE_MESSAGE =
  "현 시점에는 에브리타임 강의평 페이지로 이동해요. 다음학기부터 강의평 서비스가 제공될 예정이에요.";

const SHEET_TITLES: Record<"wishlist" | "exclusion", string> = {
  wishlist: "듣고 싶은 강의 선택",
  exclusion: "빼고 싶은 강의 선택",
};

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

interface CourseRow {
  offeringId: number;
  subjectNumber: string;
  title: string;
  professor: string;
  credit: number;
  gradeLabel: string;
  isMajor: boolean;
  isuLabel: string;
  onlineTypeLabel: string | null;
  enrollmentLabel: string | null;
  timeStr: string;
  room: string;
  enrolledCount: number | null;
  capacity: number | null;
  savedCount: number | null;
  note: string | null;
  gradeEvaluationMethod: string;
  option: WizardCourseOption;
}

const buildCourseRow = (
  offering: CourseOffering,
  course: Course | undefined,
): CourseRow | null => {
  const option = toWizardCourseOption(offering, course);
  if (!option) return null; // 시간 정보가 없는 강의는 조합에 넣을 수 없어 목록에서도 제외

  const gradeName = offering.hyName ?? course?.targetGradeName ?? "";
  const grade = parseInt(gradeName, 10);
  const isuName = offering.isuName ?? course?.completionDivisionName ?? "";
  const onlineTypeLabel = getOnlineTypeLabel(
    offering.ssupTypeName,
    offering.ssupTypeCode,
  );
  const enrollmentLabel = getEnrollmentLabel(
    offering.enrolledCount,
    offering.capacity,
  );

  return {
    offeringId: offering.id,
    subjectNumber: offering.subjectNumber,
    title: option.title,
    professor: offering.professor ?? "-",
    credit: option.credit,
    gradeLabel: Number.isFinite(grade) && grade > 0 ? `${grade}학년` : "전학년",
    isMajor: isuName.includes("전공"),
    // 서버 이수구분을 그대로 노출한다(전공기초/전공핵심/전공심화/기초교양/핵심교양/
    // 심화교양/교직/일반선택/군사학). 전공·교양 두 갈래로 뭉개면 실제와 어긋난다.
    isuLabel: isuName || "-",
    onlineTypeLabel,
    enrollmentLabel,
    timeStr: offering.meetings
      .map((m) => `${DAY_LABELS[DAY_INDEX[m.day]]} ${m.startTime}~${m.endTime}`)
      .join(", "),
    room: offering.meetings[0]?.location ?? "-",
    enrolledCount: offering.enrolledCount,
    capacity: offering.capacity,
    savedCount: offering.savedCount ?? 0,
    gradeEvaluationMethod: option.gradeEvaluationMethod ?? "-",
    note: offering.note,
    option,
  };
};

interface ScrollableContentProps {
  children: ReactNode;
  isAnimating: boolean;
}

// 하단 FAB에 목록이 가리지 않도록, 시트가 드래그되는 매 프레임의 y를 그대로 하단 패딩에
// 반영한다(편집 화면 시트와 동일한 방식).
const CourseSheetScrollableContent = ({
  children,
  isAnimating,
}: ScrollableContentProps) => {
  const { y } = Sheet.useContext();
  const scrollPaddingBottom = useTransform(y, (currentY) => currentY + 124);

  return (
    <CourseSheetContent
      scrollStyle={{ paddingBottom: scrollPaddingBottom }}
      disableDrag={({ scrollPosition }) =>
        scrollPosition !== undefined && scrollPosition !== "top"
      }
      disableScroll={({ currentSnap }) => isAnimating || currentSnap === 1}
    >
      {children}
    </CourseSheetContent>
  );
};

const WizardCourseSearchSheet = () => {
  const target = useTimetableWizardStore((s) => s.search.target);
  const snapIndex = useTimetableWizardStore((s) => s.search.snapIndex);
  const expandedOfferingId = useTimetableWizardStore((s) => s.search.expandedOfferingId);
  const keyword = useTimetableWizardStore((s) => s.search.keyword);
  const filters = useTimetableWizardStore((s) => s.search.filters);
  const filterDraft = useTimetableWizardStore((s) => s.search.filterDraft);
  const semester = useTimetableWizardStore((s) => s.semester);
  const wishlist = useTimetableWizardStore((s) => s.wishlist);
  const excludedCourses = useTimetableWizardStore((s) => s.exclusion.excludedCourses);

  const closeCourseSearch = useTimetableWizardStore((s) => s.closeCourseSearch);
  const setSearchSnapIndex = useTimetableWizardStore((s) => s.setSearchSnapIndex);
  const toggleExpandedOffering = useTimetableWizardStore((s) => s.toggleExpandedOffering);
  const setSearchKeyword = useTimetableWizardStore((s) => s.setSearchKeyword);
  const openFilterOverlay = useTimetableWizardStore((s) => s.openFilterOverlay);
  const updateFilterDraft = useTimetableWizardStore((s) => s.updateFilterDraft);
  const resetFilterDraft = useTimetableWizardStore((s) => s.resetFilterDraft);
  const applyFilterDraft = useTimetableWizardStore((s) => s.applyFilterDraft);
  const closeTopLayer = useTimetableWizardStore((s) => s.closeTopLayer);
  const addWishlistCourse = useTimetableWizardStore((s) => s.addWishlistCourse);
  const addExcludedCourse = useTimetableWizardStore((s) => s.addExcludedCourse);

  const userDepartment = useUserStore((state) => state.userInfo.department);

  const isOpen = target !== null;

  const [isAnimating, setIsAnimating] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const searchBarRef = useRef<FloatingSearchBarRef>(null);

  // --- 서버 조회: 확정 필터에서 파생될 뿐, 어디에도 따로 저장하지 않는다 ---
  const offeringFilters = useMemo(
    () => ({
      ...mapFilterToOfferingFilters(filters),
      keyword: keyword.trim() || undefined,
    }),
    [filters, keyword],
  );

  const { courses } = useCourses();
  const courseById = useMemo(() => new Map(courses.map((c) => [c.id, c])), [courses]);

  const {
    courseOfferings,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useCourseOfferings(semester?.year, semester?.term, offeringFilters, {
    enabled: isOpen,
  });

  const rows = useMemo(() => {
    const list = courseOfferings
      .map((offering) => buildCourseRow(offering, courseById.get(offering.courseId)))
      .filter((row): row is CourseRow => row !== null);

    // 서버가 전체 결과를 담은 인원순으로 페이지네이션하며, 로컬 목록도 같은 기준을 유지한다.
    if (filters.sort === "담은인원많은순") {
      return [...list].sort((a, b) => (b.savedCount ?? 0) - (a.savedCount ?? 0));
    }
    return list;
  }, [courseOfferings, courseById, filters.sort]);

  const pickedSubjectNumbers = useMemo(
    () =>
      new Set(
        target === "exclusion"
          ? excludedCourses.map((c) => c.subjectNumber)
          : wishlist.map((item) => item.course.subjectNumber),
      ),
    [target, wishlist, excludedCourses],
  );

  const activeFilterCount = useMemo(() => countActiveFilters(filters), [filters]);

  // react-modal-sheet의 initialSnap은 마운트 시점에만 읽히는데 이 시트는 항상 마운트된 채
  // 열고 닫히므로, 스토어가 스냅을 바꾼 경우(필터 오버레이를 열면 맨 위로)를 명령형으로
  // 반영해준다. 사용자가 직접 드래그해 도달한 스냅은 다시 되돌리지 않도록 마지막으로
  // 보고받은 값과 비교한다.
  const sheetRef = useRef<SheetRef | null>(null);
  const reportedSnapIndexRef = useRef(snapIndex);

  useEffect(() => {
    if (!isOpen) return;
    if (snapIndex === reportedSnapIndexRef.current) return;
    reportedSnapIndexRef.current = snapIndex;
    sheetRef.current?.snapTo(snapIndex + 1);
  }, [snapIndex, isOpen]);

  // 키보드가 닫힌 뒤 변경된 모바일 뷰포트를 기준으로 높이를 다시 계산한다
  useEffect(() => {
    if (isSearchActive) return;
    const timer = window.setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
      window.scrollTo(0, window.scrollY);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [isSearchActive]);

  // --- 무한 스크롤 ---
  const observerRef = useRef<IntersectionObserver | null>(null);
  const fetchMoreRef = useRef<() => void>(() => {});
  fetchMoreRef.current = () => {
    if (hasNextPage && !isFetchingNextPage && !isLoading) fetchNextPage();
  };

  const loadMoreRef = useCallback((node: HTMLDivElement | null) => {
    observerRef.current?.disconnect();
    if (!node) return;
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) fetchMoreRef.current();
      },
      { threshold: 0.1 },
    );
    observerRef.current.observe(node);
  }, []);

  useEffect(() => () => observerRef.current?.disconnect(), []);

  // 목록을 손가락으로 끌면 키보드를 내린다. scroll 이 아니라 touchmove 를 보는
  // 이유: 웹뷰에서 인풋에 포커스가 가면 소프트 키보드가 올라오며 뷰포트가 줄고
  // (안드로이드는 셸이 웹뷰를 키보드 높이만큼 줄이고, iOS 는 WKWebView 가
  // 스크롤뷰에 인셋을 넣는다) 그 레이아웃 변화가 목록의 scroll 이벤트로 나타난다.
  // 사용자가 스크롤한 적이 없는데 blur() 가 불려 포커스가 잡히자마자 키보드가
  // 닫히고 검색바까지 접혔다. 손가락 드래그는 그런 오인이 없다.
  const dismissKeyboardOnDrag = () => {
    searchBarRef.current?.blur();
  };

  const handlePick = (row: CourseRow) => {
    if (target === "exclusion") addExcludedCourse(row.option);
    else addWishlistCourse(row.option);
    // 시트는 계속 열어둔다 - 한 번 열어 여러 과목을 담는 게 정상적인 사용 흐름이다.
  };

  const draftFilterCount = filterDraft ? countActiveFilters(filterDraft.filters) : 0;

  return (
    <>
      <CourseSheet
        ref={sheetRef}
        isOpen={isOpen}
        onClose={closeCourseSearch}
        snapPoints={SHEET_SNAP_POINTS}
        initialSnap={snapIndex + 1}
        disableScrollLocking
        onSnap={(index) => {
          if (index < 1) return;
          reportedSnapIndexRef.current = index - 1;
          setSearchSnapIndex(index - 1);
        }}
      >
        <CourseSheetContainer
          onAnimationStart={() => setIsAnimating(true)}
          onAnimationComplete={() => setIsAnimating(false)}
        >
          <CourseSheetHeader />

          {/* 마법사는 같은 시트를 "담을 강의"와 "뺄 강의" 두 목적으로 쓰므로
              어느 쪽인지 알려주는 제목 줄만 편집 화면 시트에 추가된다. */}
          <TitleBar>
            <SheetTitle>{target ? SHEET_TITLES[target] : ""}</SheetTitle>
            <CloseButton type="button" onClick={closeCourseSearch} aria-label="닫기">
              <X size={18} />
            </CloseButton>
          </TitleBar>

          <CourseSheetScrollableContent isAnimating={isAnimating}>
            <SheetContentWrapper onTouchMove={dismissKeyboardOnDrag}>
              <CourseList>
                {isError ? (
                  <EmptyContainer>
                    <EmptyTitle>강의를 불러오지 못했어요</EmptyTitle>
                    <EmptyDescription>
                      잠시 후 다시 시도하거나 필터 조건을 바꿔 보세요
                    </EmptyDescription>
                  </EmptyContainer>
                ) : isLoading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <SkeletonCard key={`course-skeleton-${index}`}>
                      <div className="skeleton-row-top">
                        <Skeleton width="45%" height="20px" />
                        <Skeleton
                          width="70px"
                          height="20px"
                          style={{ borderRadius: "999px" }}
                        />
                      </div>
                      <div className="skeleton-row-mid">
                        <Skeleton width="50px" height="16px" />
                        <Skeleton width="40px" height="16px" />
                        <Skeleton width="50px" height="16px" />
                      </div>
                      <div className="skeleton-row-bottom">
                        <Skeleton width="30%" height="14px" />
                        <Skeleton width="50%" height="14px" />
                      </div>
                    </SkeletonCard>
                  ))
                ) : rows.length === 0 ? (
                  <EmptyContainer>
                    <SearchIconBox>
                      <SearchX size={32} color="var(--gray-400, #b0b8c1)" />
                    </SearchIconBox>
                    <EmptyTitle>조회된 강의가 없습니다</EmptyTitle>
                    <EmptyDescription>검색어나 필터 조건을 변경해 보세요</EmptyDescription>
                  </EmptyContainer>
                ) : (
                  rows.map((row) => {
                    const isExpanded = expandedOfferingId === row.offeringId;
                    const isPicked = pickedSubjectNumbers.has(row.subjectNumber);

                    return (
                      <CourseItem
                        key={row.offeringId}
                        onClick={() => toggleExpandedOffering(row.offeringId)}
                      >
                        <InfoRow>
                          <MainInfo>
                            <CourseName>{row.title}</CourseName>
                          </MainInfo>
                          <RightInfo>
                            {row.savedCount != null && (
                              <SavedBadge>
                                {row.savedCount}명 담음
                              </SavedBadge>
                            )}
                            {row.enrollmentLabel && (
                              <EnrolledBadge>{row.enrollmentLabel}</EnrolledBadge>
                            )}
                          </RightInfo>
                        </InfoRow>

                        <CourseAttributes>
                          <AttributeItem $primary>{row.professor}</AttributeItem>
                          <AttributeItem>{row.credit}학점</AttributeItem>
                          <AttributeItem>
                            {row.gradeEvaluationMethod}
                          </AttributeItem>
                        </CourseAttributes>

                        <CourseAdditionalInfo>
                          <InfoLine>
                            <span>{row.gradeLabel}</span>
                            <span>{row.isuLabel}</span>
                            {row.onlineTypeLabel && <span>{row.onlineTypeLabel}</span>}
                            <span>{row.subjectNumber}</span>
                          </InfoLine>
                          <div>{row.timeStr}</div>
                          <div>{row.room}</div>
                        </CourseAdditionalInfo>

                        {isExpanded && (
                          <ExpandedArea>
                            {row.note && <RemarkText>비고 : {row.note}</RemarkText>}
                            <ButtonRow>
                              <PrimaryActionButton
                                disabled={isPicked}
                                $isAdded={isPicked}
                                $exclusion={target === "exclusion"}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!isPicked) handlePick(row);
                                }}
                              >
                                {isPicked ? <Check size={20} /> : <Plus size={20} />}
                                {isPicked
                                  ? "담음"
                                  : target === "exclusion"
                                    ? "제외 목록에 추가"
                                    : "후보로 담기"}
                              </PrimaryActionButton>
                              <SecondaryActionButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openLectureReview(row.professor);
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
                                <FileText size={20} />
                                강의계획서
                              </SecondaryActionButton>
                            </ButtonRow>
                          </ExpandedArea>
                        )}
                      </CourseItem>
                    );
                  })
                )}

                {isFetchingNextPage && (
                  <SkeletonCard key="next-page-skeleton">
                    <div className="skeleton-row-top">
                      <Skeleton width="45%" height="20px" />
                      <Skeleton
                        width="70px"
                        height="20px"
                        style={{ borderRadius: "999px" }}
                      />
                    </div>
                    <div className="skeleton-row-mid">
                      <Skeleton width="50px" height="16px" />
                      <Skeleton width="40px" height="16px" />
                      <Skeleton width="50px" height="16px" />
                    </div>
                  </SkeletonCard>
                )}
                {hasNextPage && !isLoading && (
                  <div ref={loadMoreRef} style={{ height: "20px", width: "100%" }} />
                )}
              </CourseList>
            </SheetContentWrapper>
          </CourseSheetScrollableContent>

          {/* 필터 오버레이 - 라우트 이동 없이 시트 안에서만 뜬다.
              초안(filterDraft)을 편집하고 "적용"을 눌러야 확정 필터가 바뀌므로,
              취소하고 나가면 조회 조건이 흔들릴 여지가 없다. */}
          {filterDraft && (
            <FilterOverlay>
              <OverlayHeader>
                <OverlayBackButton
                  type="button"
                  onClick={() => closeTopLayer()}
                  aria-label="뒤로"
                >
                  <ChevronLeft size={22} />
                </OverlayBackButton>
                <OverlayTitle>{FILTER_SUB_VIEW_TITLES[filterDraft.view]}</OverlayTitle>
                <OverlayHeaderSpacer />
              </OverlayHeader>

              <CourseFilterPanel
                filters={filterDraft.filters}
                onFiltersChange={(next) => updateFilterDraft({ filters: next })}
                view={filterDraft.view}
                onViewChange={(view) =>
                  updateFilterDraft({ view, majorLevel1: null, majorLevel2: null })
                }
                majorLevel1={filterDraft.majorLevel1}
                majorLevel2={filterDraft.majorLevel2}
                onMajorLevelChange={(majorLevel1, majorLevel2) =>
                  updateFilterDraft({ majorLevel1, majorLevel2 })
                }
                userDepartment={userDepartment}
              />

              <OverlayActions>
                {filterDraft.view === "main" ? (
                  <>
                    <ResetButton
                      variant="secondary"
                      leftIcon={<RotateCcw size={16} />}
                      onClick={resetFilterDraft}
                    >
                      초기화
                    </ResetButton>
                    <ApplyButton variant="primary" onClick={applyFilterDraft}>
                      {draftFilterCount > 0
                        ? `필터 ${draftFilterCount}개 적용`
                        : "적용하기"}
                    </ApplyButton>
                  </>
                ) : filterDraft.view === "time" ? (
                  <>
                    <ResetButton
                      variant="secondary"
                      leftIcon={<RotateCcw size={16} />}
                      onClick={() =>
                        updateFilterDraft({
                          filters: resetTimeFilter(filterDraft.filters),
                        })
                      }
                    >
                      초기화
                    </ResetButton>
                    <ApplyButton
                      variant="primary"
                      onClick={() => updateFilterDraft({ view: "main" })}
                    >
                      선택 완료
                    </ApplyButton>
                  </>
                ) : (
                  <ApplyButton
                    variant="primary"
                    onClick={() => updateFilterDraft({ view: "main" })}
                  >
                    선택 완료
                  </ApplyButton>
                )}
              </OverlayActions>
            </FilterOverlay>
          )}
        </CourseSheetContainer>
      </CourseSheet>

      {/* 하단 플로팅 필터/검색 - 시트(10000)보다 위에 떠야 해서 body로 포탈한다.
          필터 오버레이가 떠 있는 동안은 가린다. */}
      {isOpen &&
        !filterDraft &&
        createPortal(
          <FloatingActionsContainer>
            <FilterButton
              $isHidden={isSearchActive}
              $isZeroCount={activeFilterCount === 0}
              onClick={openFilterOverlay}
            >
              <SlidersHorizontal size={20} />
              {activeFilterCount > 0 && <span>필터 {activeFilterCount}</span>}
            </FilterButton>

            {/* key={target}: 시트를 다시 열면 검색바 내부 입력값도 초기화되어야
                스토어의 검색어(열 때 "")와 화면이 어긋나지 않는다.
                searchParamKey를 넘기지 않아 검색어가 URL로 새지 않는다. */}
            <FloatingSearchBar
              key={target ?? "closed"}
              ref={searchBarRef}
              placeholder="교과목명, 교수명 검색"
              onSearch={setSearchKeyword}
              onActiveChange={setIsSearchActive}
            />
          </FloatingActionsContainer>,
          document.body,
        )}
    </>
  );
};

export default WizardCourseSearchSheet;

// --- styled-components (편집 화면 MobileCourseSearchSheet와 동일한 시각 규격) ---

const CourseSheet = styled(Sheet)`
  z-index: 10000;
`;

const CourseSheetContainer = styled(Sheet.Container)`
  left: 0;
  right: 0;
  width: min(100%, 768px);
  height: 90dvh !important;
  max-height: 90dvh !important;
  margin: 0 auto;
  overflow: hidden;
  border-top: 1px solid var(--border-default, #e5e8eb);
  border-top-left-radius: 32px !important;
  border-top-right-radius: 32px !important;
  border-bottom-right-radius: 0 !important;
  border-bottom-left-radius: 0 !important;
  background: var(--bg-base, #ffffff);
  box-shadow: 0 4px 24px 0 rgba(0, 0, 0, 0.25) !important;
`;

const CourseSheetHeader = styled(Sheet.Header)`
  flex: 0 0 20px;

  .react-modal-sheet-header {
    height: 20px !important;
    padding: 16px 0;
    box-sizing: border-box;
  }

  .react-modal-sheet-drag-indicator-container {
    width: 40px !important;
    height: 4px !important;
    border-radius: 2px !important;
    background: var(--border-default, #e5e8eb) !important;
  }

  .react-modal-sheet-drag-indicator {
    display: none !important;
  }
`;

const TitleBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex: 0 0 auto;
  padding: 2px 20px 10px;
`;

const SheetTitle = styled.h2`
  margin: 0;
  color: var(--gray-900, #191f28);
  font-size: 17px;
  font-weight: 700;
  line-height: 24px;
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  border: none;
  border-radius: 999px;
  background: var(--bg-neutral-subtle, #f2f4f6);
  color: var(--text-tertiary, #8b95a1);
  cursor: pointer;
  padding: 0;
`;

const CourseSheetContent = styled(Sheet.Content)`
  min-height: 0;

  .react-modal-sheet-content-scroller {
    overscroll-behavior-y: none;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

const SheetContentWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
`;

const FloatingActionsContainer = styled.div`
  position: fixed;
  bottom: calc(24px + env(safe-area-inset-bottom, 0px));
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 40px);
  max-width: calc(768px - 40px);
  z-index: 10005;
  display: flex;
  justify-content: space-between;
  align-items: center;
  pointer-events: none;
  box-sizing: border-box;
`;

const FilterButton = styled.button<{
  $isHidden: boolean;
  $isZeroCount?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 48px;
  border-radius: 999px;
  cursor: pointer;
  pointer-events: auto;
  box-sizing: border-box;
  white-space: nowrap;

  border: ${({ $isZeroCount }) =>
    $isZeroCount
      ? "1px solid var(--border-default, #E5E8EB)"
      : "1px solid var(--border-brand, #0061ff)"};
  background: ${({ $isZeroCount }) =>
    $isZeroCount ? "rgba(255, 255, 255, 0.50)" : "var(--interactive-primary, #3b82f6)"};
  box-shadow: ${({ $isZeroCount }) =>
    $isZeroCount
      ? "0 4px 12px 0 rgba(0, 0, 0, 0.08)"
      : "0 4px 12px rgba(59, 130, 246, 0.3)"};
  backdrop-filter: ${({ $isZeroCount }) => ($isZeroCount ? "blur(8px)" : "none")};

  color: ${({ $isZeroCount }) =>
    $isZeroCount ? "var(--text-secondary, #333d4b)" : "var(--text-inverse, #fff)"};
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px;

  width: fit-content;

  /* 수치 변화 추적 */
  transition:
    max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    padding 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: max-width, padding, margin-right, opacity, transform;

  ${(props) =>
    props.$isHidden
      ? `
    max-width: 0px;
    padding: 0;
    margin-right: 0px;
    opacity: 0;
    pointer-events: none;
    transform: scale(0.8);
    border: 0px solid transparent;
  `
      : props.$isZeroCount
        ? `
    max-width: 48px;
    padding: 12px;
    margin-right: 12px;
    opacity: 1;
    pointer-events: auto;
    transform: scale(1);
  `
        : `
    max-width: 200px;
    padding: 12px 16px;
    margin-right: 12px;
    opacity: 1;
    pointer-events: auto;
    transform: scale(1);
  `}

  &:active {
    transform: scale(0.95);
  }
`;

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
  font-size: 16px;
  font-weight: 600;
  color: var(--text-secondary, #333d4b);
  margin: 0 0 6px 0;
`;

const EmptyDescription = styled.p`
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

  /* 시트의 드래그 구동 scrollPaddingBottom이 매 프레임 레이아웃을 재계산시키는데,
     가상화 없는 목록에서는 그 비용이 행 수에 비례한다. content-visibility로 화면 밖
     행의 레이아웃/페인트를 통째로 건너뛴다(편집 화면 시트와 동일). */
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

const CourseAttributes = styled.div`
  display: flex;
  flex-direction: row;
  gap: 12px;
  align-items: center;
`;

const AttributeItem = styled.span<{ $primary?: boolean }>`
  color: ${({ $primary }) =>
    $primary ? "var(--text-secondary, #333d4b)" : "var(--text-tertiary, #8b95a1)"};
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

const PrimaryActionButton = styled(ActionButton)<{
  $isAdded?: boolean;
  $exclusion?: boolean;
}>`
  border-radius: 999px;
  background: ${({ $exclusion }) =>
    $exclusion ? "var(--text-error, #ef4444)" : "var(--interactive-primary, #3b82f6)"};
  color: #fff;

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

const FilterOverlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 5;
  display: flex;
  flex-direction: column;
  background: var(--bg-subtle, #f8f9fb);
  border-top-left-radius: 32px;
  border-top-right-radius: 32px;
  overflow: hidden;
`;

const OverlayHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  height: 56px;
  padding: 0 12px;
  flex-shrink: 0;
  background: var(--bg-base, #ffffff);
  border-bottom: 1px solid var(--border-default, #e5e8eb);
`;

const OverlayBackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: var(--text-secondary, #333d4b);
  cursor: pointer;
  flex-shrink: 0;
`;

const OverlayTitle = styled.span`
  flex: 1;
  text-align: center;
  color: var(--gray-900, #191f28);
  font-size: 17px;
  font-weight: 600;
`;

const OverlayHeaderSpacer = styled.div`
  width: 36px;
  flex-shrink: 0;
`;

const OverlayActions = styled.div`
  display: flex;
  gap: 12px;
  padding: 12px 20px calc(20px + env(safe-area-inset-bottom, 0px));
  flex-shrink: 0;
  background: var(--bg-base, #ffffff);
  border-top: 1px solid var(--border-default, #e5e8eb);
`;

const ApplyButton = styled(CapsuleButton)`
  flex: 1 1 0;
  width: auto;
  min-width: 0;
  height: 52px;
  min-height: 52px;
`;

const ResetButton = styled(ApplyButton)`
  flex: 0 0 auto;
  width: auto;
  padding: 12px 16px;

  span {
    gap: 6px;
    white-space: nowrap;
  }
`;
