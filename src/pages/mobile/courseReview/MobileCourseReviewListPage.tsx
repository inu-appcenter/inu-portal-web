import { useState, useMemo } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useHeader } from "@/context/HeaderContext";
import TabUpper from "@/components/common/TabUpper";
import CapsuleButton from "@/components/common/CapsuleButton";
import Skeleton from "@/components/common/Skeleton";
import { ROUTES } from "@/constants/routes";
import { useCourses } from "@/hooks/useCourses";
import { useCourseOfferings } from "@/hooks/useCourseOfferings";
import {
  useCourseReviews,
  useCourseReviewSummary,
  useToggleCourseReviewLike,
  useReportCourseReview,
  useMyCourseReviews,
} from "@/hooks/useCourseReviews";
import CourseReviewCard from "@/components/mobile/courseReview/CourseReviewCard";
import CourseReviewStatsBottomSheet from "@/components/mobile/courseReview/CourseReviewStatsBottomSheet";
import CourseReviewEmptyState from "@/components/mobile/courseReview/CourseReviewEmptyState";
import { DESKTOP_MEDIA, MOBILE_PAGE_GUTTER } from "@/styles/responsive";
import useUserStore from "@/stores/useUserStore";

export default function MobileCourseReviewListPage() {
  const { courseId: courseIdParam } = useParams<{ courseId: string }>();
  const courseId = Number(courseIdParam);
  const location = useLocation();
  const navigate = useNavigate();
  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo.accessToken);

  const initialProfessor = (location.state as any)?.professorName || "all";
  const [selectedProfessorTab, setSelectedProfessorTab] = useState<string>(initialProfessor);
  const [isStatsSheetOpen, setIsStatsSheetOpen] = useState(false);
  const [reportReviewId, setReportReviewId] = useState<number | null>(null);

  // 과목 및 개설강좌 정보 조회
  const { courses } = useCourses();
  const { courseOfferings } = useCourseOfferings();

  const currentCourse = useMemo(() => {
    return courses.find((c) => c.id === courseId);
  }, [courses, courseId]);

  const courseTitle =
    currentCourse?.title ||
    (location.state as any)?.courseName ||
    "강의평";

  // 해당 과목의 담당 교수 목록 추출
  const availableProfessors = useMemo(() => {
    const set = new Set<string>();
    courseOfferings
      .filter((o): o is typeof o & { professor: string } => o.courseId === courseId && Boolean(o.professor))
      .forEach((o) => {
        const prof = o.professor.trim();
        if (prof && prof !== "-") {
          set.add(prof);
        }
      });
    return Array.from(set);
  }, [courseOfferings, courseId]);

  // 해당 과목의 개설강좌 목록
  const matchingOfferings = useMemo(() => {
    return courseOfferings.filter((o) => o.courseId === courseId);
  }, [courseOfferings, courseId]);

  // 선택된 교수 또는 첫 번째 개설강좌
  const selectedOffering = useMemo(() => {
    if (selectedProfessorTab !== "all") {
      return (
        matchingOfferings.find((o) => o.professor?.trim() === selectedProfessorTab) ||
        matchingOfferings[0]
      );
    }
    return matchingOfferings[0];
  }, [matchingOfferings, selectedProfessorTab]);

  const targetOfferingId = selectedOffering?.id;
  const professorDisplay =
    selectedProfessorTab !== "all"
      ? `${selectedProfessorTab} 교수`
      : availableProfessors.length > 0
        ? `${availableProfessors.join(", ")} 교수`
        : "-";

  const handleSyllabusClick = () => {
    if (!targetOfferingId) {
      alert("개설강의 정보가 없어 강의계획서를 열 수 없어요.");
      return;
    }
    navigate(ROUTES.TIMETABLE.SYLLABUS, {
      state: {
        courseOfferingId: targetOfferingId,
        courseName: courseTitle,
        professor: selectedOffering?.professor || (selectedProfessorTab !== "all" ? selectedProfessorTab : undefined),
        courseId,
      },
    });
  };

  // TabUpper 용 탭 아이템
  const professorTabs = useMemo(() => {
    const list = [{ id: "all", label: "전체 교수" }];
    availableProfessors.forEach((prof) => {
      list.push({ id: prof, label: `${prof} 교수` });
    });
    return list;
  }, [availableProfessors]);

  // 리뷰 목록 및 요약 통계 쿼리
  const queryProfessor =
    selectedProfessorTab === "all" ? undefined : selectedProfessorTab;

  const { data: myReviews = [] } = useMyCourseReviews({ enabled: isLoggedIn });
  const myReviewIds = useMemo(() => new Set(myReviews.map((r) => r.id)), [myReviews]);

  const { data: reviewsPage, isLoading: isReviewsLoading } = useCourseReviews(
    courseId,
    { professor: queryProfessor },
    { enabled: !isNaN(courseId) && courseId > 0 },
  );

  const { data: summary, isLoading: isSummaryLoading } = useCourseReviewSummary(
    courseId,
    queryProfessor,
    { enabled: !isNaN(courseId) && courseId > 0 },
  );

  const toggleLikeMutation = useToggleCourseReviewLike(courseId);
  const reportMutation = useReportCourseReview(courseId);

  useHeader({
    title: courseTitle,
    showAlarm: false,
    showSearch: false,
    hasback: true,
  });

  const handleLikeToggle = (reviewId: number) => {
    if (!isLoggedIn) {
      alert("로그인 후 이용할 수 있어요.");
      navigate(ROUTES.LOGIN);
      return;
    }
    toggleLikeMutation.mutate(reviewId, {
      onError: (err: any) => {
        alert(err.response?.data?.msg || "추천 처리에 실패했습니다.");
      },
    });
  };

  const handleReportSubmit = (reason: string, detail?: string) => {
    if (!reportReviewId) return;
    reportMutation.mutate(
      { reviewId: reportReviewId, reason, detail },
      {
        onSuccess: () => {
          alert("신고가 접수되었습니다.");
          setReportReviewId(null);
        },
        onError: (err: any) => {
          alert(err.response?.data?.msg || "신고 처리에 실패했습니다.");
          setReportReviewId(null);
        },
      },
    );
  };

  const handleWriteClick = () => {
    if (!isLoggedIn) {
      alert("로그인 후 작성할 수 있어요.");
      navigate(ROUTES.LOGIN);
      return;
    }

    const stateYear = (location.state as any)?.year;
    const stateTerm = (location.state as any)?.term;
    const offeringTermNum =
      selectedOffering?.term === "SECOND"
        ? 2
        : selectedOffering?.term === "FIRST"
          ? 1
          : undefined;

    navigate(ROUTES.COURSE.REVIEW_WRITE(courseId), {
      state: {
        courseTitle,
        professor:
          (location.state as any)?.professorName ||
          queryProfessor ||
          selectedOffering?.professor ||
          availableProfessors[0],
        year: stateYear ?? selectedOffering?.year,
        term: stateTerm ?? offeringTermNum,
        courseOfferingId:
          (location.state as any)?.courseOfferingId ?? targetOfferingId,
      },
    });
  };

  const reviews = reviewsPage?.content || [];
  const hasReviews = (summary?.totalReviews || 0) > 0;

  return (
    <PageWrapper>
      {/* 1. 과목 기본 정보 카드 (교수, 학점, 이수구분, 학과 + 강의계획서 바로가기) */}
      <CourseInfoCard>
        <CourseInfoHeader>
          <CourseTitleArea>
            <CourseMainTitle>{courseTitle}</CourseMainTitle>
            <ProfessorText>{professorDisplay}</ProfessorText>
          </CourseTitleArea>
          {targetOfferingId && (
            <SyllabusLinkButton type="button" onClick={handleSyllabusClick}>
              강의계획서 보기 ›
            </SyllabusLinkButton>
          )}
        </CourseInfoHeader>
        <MetaChipRow>
          {currentCourse?.credit && (
            <MetaChip>{currentCourse.credit}학점</MetaChip>
          )}
          {(currentCourse?.completionDivisionName || selectedOffering?.isuName) && (
            <MetaChip>
              {currentCourse?.completionDivisionName || selectedOffering?.isuName}
            </MetaChip>
          )}
          {(currentCourse?.departmentName || selectedOffering?.deptName) && (
            <MetaChip>
              {currentCourse?.departmentName || selectedOffering?.deptName}
            </MetaChip>
          )}
          {(currentCourse?.targetGradeName || selectedOffering?.hyName) && (
            <MetaChip>
              {currentCourse?.targetGradeName
                ? currentCourse.targetGradeName.includes("학년")
                  ? currentCourse.targetGradeName
                  : `${currentCourse.targetGradeName}학년`
                : `${selectedOffering?.hyName}학년`}
            </MetaChip>
          )}
          {selectedOffering?.gradeEvaluationName && (
            <MetaChip>{selectedOffering.gradeEvaluationName}</MetaChip>
          )}
        </MetaChipRow>
      </CourseInfoCard>

      {/* 2. 상단 교수별 필터 탭 (공용 TabUpper) */}
      {availableProfessors.length > 1 && (
        <TabArea>
          <TabUpper
            tabs={professorTabs}
            activeTabId={selectedProfessorTab}
            onChange={setSelectedProfessorTab}
          />
        </TabArea>
      )}

      {/* 3. 컴팩트 평점 요약 카드 (상세 통계는 바텀시트로 분리하여 호흡 조절) */}
      <SummaryCard>
        {isSummaryLoading ? (
          <Skeleton width="100%" height={90} style={{ borderRadius: "16px" }} />
        ) : (
          <SummaryContent>
            <ScoreArea>
              <ScoreNumber>
                {summary && summary.totalReviews > 0
                  ? summary.averageRating.toFixed(1)
                  : "-"}
              </ScoreNumber>
              <ScoreMeta>
                <StarVisual rating={summary?.averageRating || 0} />
                <CountText>
                  {summary ? `${summary.totalReviews}개의 후기` : "후기 0개"}
                </CountText>
              </ScoreMeta>
            </ScoreArea>

            {hasReviews && (
              <DetailStatsButton
                type="button"
                onClick={() => setIsStatsSheetOpen(true)}
              >
                {summary?.representativeKeyword && (
                  <KeywordHighlight>{summary.representativeKeyword}</KeywordHighlight>
                )}
                평가 분석 보기 ⌵
              </DetailStatsButton>
            )}
          </SummaryContent>
        )}
      </SummaryCard>

      {/* 4. 리뷰 리스트 본문 */}
      <ListArea>
        {isReviewsLoading ? (
          <SkeletonWrapper>
            <Skeleton width="100%" height={120} style={{ borderRadius: "16px" }} />
            <Skeleton width="100%" height={120} style={{ borderRadius: "16px" }} />
          </SkeletonWrapper>
        ) : reviews.length === 0 ? (
          <CourseReviewEmptyState
            courseName={courseTitle}
            professorName={selectedProfessorTab}
            onWriteClick={handleWriteClick}
          />
        ) : (
          reviews.map((review) => {
            const isMine = Boolean(review.isMyReview || myReviewIds.has(review.id));
            const enrichedReview = isMine ? { ...review, isMyReview: true } : review;
            return (
              <CourseReviewCard
                key={review.id}
                review={enrichedReview}
                showProfessor={selectedProfessorTab === "all"}
                onLikeToggle={handleLikeToggle}
                onReportClick={(id) => setReportReviewId(id)}
              />
            );
          })
        )}
      </ListArea>

      {/* 5. 하단 플로팅 작성 CTA (주변 배경 박스 없이 버튼만 플로팅) */}
      <BottomActionWrapper>
        <FloatingButtonContainer>
          <CapsuleButton
            variant="primary"
            fullWidth
            onClick={handleWriteClick}
          >
            {reviews.length === 0 ? "첫 후기 작성하기" : "이 강의 후기 작성하기"}
          </CapsuleButton>
        </FloatingButtonContainer>
      </BottomActionWrapper>

      {/* 5. 평가 분석 상세 바텀시트 (공용 BottomSheet로 정보 분산) */}
      <CourseReviewStatsBottomSheet
        open={isStatsSheetOpen}
        onOpenChange={setIsStatsSheetOpen}
        summary={summary}
      />

      {/* 6. 신고 모달 (공용 ReportModal 연동 또는 인라인 다이얼로그) */}
      {reportReviewId && (
        <ReportDialogOverlay onClick={() => setReportReviewId(null)}>
          <ReportDialogContent onClick={(e) => e.stopPropagation()}>
            <ReportDialogTitle>강의평 신고</ReportDialogTitle>
            <ReportDialogDesc>
              부적절하거나 사실과 다른 비방성 후기인가요?
            </ReportDialogDesc>
            <ReportActionRow>
              <CapsuleButton
                variant="secondary"
                onClick={() => setReportReviewId(null)}
              >
                취소
              </CapsuleButton>
              <CapsuleButton
                variant="danger"
                onClick={() => handleReportSubmit("부적절한 내용")}
              >
                신고 접수
              </CapsuleButton>
            </ReportActionRow>
          </ReportDialogContent>
        </ReportDialogOverlay>
      )}
    </PageWrapper>
  );
}

function StarVisual({ rating }: { rating: number }) {
  const rounded = Math.round(rating);
  return (
    <StarRow>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= rounded ? "filled" : "empty"}>
          ★
        </span>
      ))}
    </StarRow>
  );
}

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  padding: 0 ${MOBILE_PAGE_GUTTER} calc(110px + env(safe-area-inset-bottom, 0px));

  @media ${DESKTOP_MEDIA} {
    padding: 0 0 calc(110px + env(safe-area-inset-bottom, 0px));
  }
`;

const CourseInfoCard = styled.div`
  background: var(--bg-surface, #ffffff);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 16px;
  padding: 16px;
  box-sizing: border-box;
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const CourseInfoHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const CourseTitleArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const CourseMainTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.3;
`;

const ProfessorText = styled.span`
  font-size: 13px;
  color: var(--text-secondary);
`;

const SyllabusLinkButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  background: var(--bg-subtle, #f2f4f6);
  border: none;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 600;
  color: var(--interactive-primary, #3182f6);
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;

  &:active {
    transform: scale(0.96);
  }
`;

const MetaChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const MetaChip = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  background: var(--bg-subtle, #f2f4f6);
  color: var(--text-secondary);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
`;

const TabArea = styled.div`
  margin-bottom: 14px;
`;

const SummaryCard = styled.div`
  background: var(--bg-surface, #ffffff);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 16px;
  padding: 16px;
  box-sizing: border-box;
  margin-bottom: 16px;
`;

const SummaryContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const ScoreArea = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ScoreNumber = styled.span`
  font-size: 32px;
  font-weight: 800;
  line-height: 1;
  color: var(--text-primary);
  letter-spacing: -0.5px;
`;

const ScoreMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const StarRow = styled.div`
  display: flex;
  gap: 2px;
  font-size: 14px;
  line-height: 1;

  .filled {
    color: var(--interactive-primary, #3182f6);
  }
  .empty {
    color: var(--border-divider, #e5e8eb);
  }
`;

const CountText = styled.span`
  font-size: 12px;
  color: var(--text-tertiary);
`;

const DetailStatsButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  background: none;
  border: none;
  color: var(--interactive-primary, #3182f6);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 6px 0;

  &:active {
    transform: scale(0.97);
  }
`;

const KeywordHighlight = styled.span`
  display: inline-flex;
  padding: 2px 6px;
  background: var(--bg-brand, #e8f3ff);
  color: var(--text-brand, #0061ff);
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
`;

const ListArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 24px;
`;

const SkeletonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const BottomActionWrapper = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 20px calc(16px + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
  pointer-events: none;
  z-index: 100;
`;

const FloatingButtonContainer = styled.div`
  width: 100%;
  max-width: 440px;
  pointer-events: auto;

  button {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
`;

const ReportDialogOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: var(--bg-dim, rgba(0, 0, 0, 0.4));
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  box-sizing: border-box;
`;

const ReportDialogContent = styled.div`
  width: 100%;
  max-width: 320px;
  background: var(--bg-surface, #ffffff);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-sizing: border-box;
`;

const ReportDialogTitle = styled.h4`
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
`;

const ReportDialogDesc = styled.p`
  margin: 0;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.4;
`;

const ReportActionRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
`;
