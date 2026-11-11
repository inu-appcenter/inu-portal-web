import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { useRecentCourseReviews } from "@/hooks/useCourseReviews";
import Skeleton from "@/components/common/Skeleton";
import type { CourseReview } from "@/types/courseReview";

export default function RecentReviewsFeedSection() {
  const navigate = useNavigate();
  const { data: recentReviews, isLoading } = useRecentCourseReviews(10);

  const handleCardClick = (review: CourseReview) => {
    navigate(ROUTES.COURSE.REVIEW(review.courseId), {
      state: {
        courseName: review.courseTitle,
        professorName: review.professor,
      },
    });
  };

  return (
    <SectionWrapper>
      <SectionHeader>
        <SectionTitle>최근 등록된 강의평</SectionTitle>
        <SectionSubtitle>학우들이 남긴 생생한 후기</SectionSubtitle>
      </SectionHeader>

      <FeedList>
        {isLoading ? (
          <>
            <Skeleton width="100%" height={120} style={{ borderRadius: "16px" }} />
            <Skeleton width="100%" height={120} style={{ borderRadius: "16px" }} />
          </>
        ) : !recentReviews || recentReviews.length === 0 ? (
          <EmptyFeedBox>
            <EmptyFeedTitle>아직 등록된 강의평이 없어요</EmptyFeedTitle>
            <EmptyFeedDesc>첫 번째 강의평을 작성해 다른 학우들에게 도움을 주세요!</EmptyFeedDesc>
          </EmptyFeedBox>
        ) : (
          recentReviews.map((review) => (
            <ReviewFeedCard
              key={review.id}
              onClick={() => handleCardClick(review)}
            >
              <CardHeaderRow>
                <CourseMetaGroup>
                  <CourseTitleText>{review.courseTitle}</CourseTitleText>
                  <ProfessorSemesterText>
                    {review.professor ? `${review.professor} 교수` : ""} · {review.semesterLabel}
                  </ProfessorSemesterText>
                </CourseMetaGroup>
                <StarScoreBadge>
                  ★ {review.rating.toFixed(1)}
                </StarScoreBadge>
              </CardHeaderRow>

              {/* 5대 세부 지표 칩 */}
              <MetricsChipRow>
                {review.gradeSatisfactionText && (
                  <MetricChip>성적 {review.gradeSatisfactionText}</MetricChip>
                )}
                {review.assignmentAmountText && (
                  <MetricChip>과제 {review.assignmentAmountText}</MetricChip>
                )}
                {review.teamProjectText && (
                  <MetricChip>팀플 {review.teamProjectText}</MetricChip>
                )}
              </MetricsChipRow>

              {/* 본문 서술 (있을 경우) */}
              {review.content && (
                <ReviewContentText>
                  {review.content}
                </ReviewContentText>
              )}

              <CardFooterRow>
                <WriterInfoText>
                  {review.writerDisplay || "익명"} · {formatRelativeDate(review.createdAt)}
                </WriterInfoText>
                {review.likeCount > 0 && (
                  <LikeCountText>도움돼요 {review.likeCount}</LikeCountText>
                )}
              </CardFooterRow>
            </ReviewFeedCard>
          ))
        )}
      </FeedList>
    </SectionWrapper>
  );
}

function formatRelativeDate(dateString: string): string {
  if (!dateString) return "";
  const now = new Date();
  const created = new Date(dateString);
  const diffSec = Math.floor((now.getTime() - created.getTime()) / 1000);

  if (diffSec < 60) return "방금 전";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}분 전`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}시간 전`;
  if (diffSec < 86400 * 7) return `${Math.floor(diffSec / 86400)}일 전`;

  const y = created.getFullYear();
  const m = String(created.getMonth() + 1).padStart(2, "0");
  const d = String(created.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
}

const SectionWrapper = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 0 4px;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.3;
`;

const SectionSubtitle = styled.span`
  font-size: 12px;
  color: var(--text-caption, #8b95a1);
`;

const FeedList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ReviewFeedCard = styled.div`
  background: var(--bg-surface, #ffffff);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 16px;
  padding: 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 10px;
  cursor: pointer;
  transition: transform 0.15s ease, border-color 0.15s ease;

  &:active {
    transform: scale(0.99);
    border-color: var(--border-strong, #b0b8c1);
  }
`;

const CardHeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
`;

const CourseMetaGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
  min-width: 0;
`;

const CourseTitleText = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ProfessorSemesterText = styled.span`
  font-size: 13px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StarScoreBadge = styled.span`
  display: inline-flex;
  align-items: center;
  font-size: 14px;
  font-weight: 700;
  color: var(--interactive-primary, #3182f6);
  background: var(--bg-brand, #e8f3ff);
  padding: 3px 8px;
  border-radius: 8px;
  flex-shrink: 0;
`;

const MetricsChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const MetricChip = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  background: var(--bg-base, #f2f4f6);
  padding: 3px 7px;
  border-radius: 6px;
`;

const ReviewContentText = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-all;
`;

const CardFooterRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 6px;
  border-top: 1px solid var(--border-divider, #f2f4f6);
`;

const WriterInfoText = styled.span`
  font-size: 12px;
  color: var(--text-caption, #8b95a1);
`;

const LikeCountText = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
`;

const EmptyFeedBox = styled.div`
  background: var(--bg-surface, #ffffff);
  border: 1px dashed var(--border-default, #e5e8eb);
  border-radius: 16px;
  padding: 32px 16px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const EmptyFeedTitle = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
`;

const EmptyFeedDesc = styled.span`
  font-size: 12px;
  color: var(--text-caption, #8b95a1);
`;
