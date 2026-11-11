import { useState } from "react";
import styled from "styled-components";
import Badge from "@/components/common/Badge";
import type { CourseReview } from "@/types/courseReview";

interface CourseReviewCardProps {
  review: CourseReview;
  showProfessor?: boolean;
  onLikeToggle: (reviewId: number) => void;
  onReportClick: (reviewId: number) => void;
}

export default function CourseReviewCard({
  review,
  showProfessor = false,
  onLikeToggle,
  onReportClick,
}: CourseReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLongContent = review.content.length > 140;

  return (
    <CardContainer>
      <CardHeader>
        <HeaderLeft>
          <RatingBadge>★ {review.rating}</RatingBadge>
          {showProfessor && <ProfessorBadge>{review.professor} 교수</ProfessorBadge>}
          <SemesterText>{review.semesterLabel}</SemesterText>
          {review.isVerified && <Badge text="수강생 인증" />}
        </HeaderLeft>
        <HeaderRight>
          {review.isMyReview ? (
            <MyReviewBadge>내가 쓴 글</MyReviewBadge>
          ) : (
            <ReportTextButton
              type="button"
              onClick={() => onReportClick(review.id)}
            >
              신고
            </ReportTextButton>
          )}
        </HeaderRight>
      </CardHeader>

      {/* 5대 세부 지표 태그 칩 */}
      <TagRow>
        <TagItem>학점 {review.gradeSatisfactionText}</TagItem>
        <TagItem>과제 {review.assignmentAmountText}</TagItem>
        <TagItem>팀플 {review.teamProjectText}</TagItem>
        <TagItem>시험 {review.examCountText}</TagItem>
        <TagItem>출결 {review.attendanceTypeText}</TagItem>
      </TagRow>

      {/* 후기 내용 */}
      <ContentWrapper>
        <ContentText $isExpanded={isExpanded}>
          {review.content}
        </ContentText>
        {isLongContent && (
          <MoreButton
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "접기" : "더보기"}
          </MoreButton>
        )}
      </ContentWrapper>

      {/* 하단 푸터: 작성자 & 도움돼요 */}
      <CardFooter>
        <FooterLeft>
          <WriterText>{review.writerDisplay}</WriterText>
          <DateText>{review.createdAt?.slice(0, 10)}</DateText>
        </FooterLeft>
        {review.isMyReview ? (
          review.likeCount > 0 ? (
            <LikeCountStatic>도움돼요 {review.likeCount}</LikeCountStatic>
          ) : null
        ) : (
          <LikeButton
            type="button"
            $isLiked={review.isLiked}
            onClick={() => onLikeToggle(review.id)}
          >
            도움돼요 {review.likeCount > 0 ? review.likeCount : ""}
          </LikeButton>
        )}
      </CardFooter>
    </CardContainer>
  );
}

const CardContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 18px 16px;
  background: var(--bg-surface, #ffffff);
  border-radius: 16px;
  border: 1px solid var(--border-default, #e5e8eb);
  box-sizing: border-box;
  gap: 12px;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
`;

const RatingBadge = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: var(--interactive-primary, #3182f6);
`;

const ProfessorBadge = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  background: var(--bg-subtle, #f2f4f6);
  padding: 2px 6px;
  border-radius: 4px;
`;

const SemesterText = styled.span`
  font-size: 12px;
  color: var(--text-tertiary);
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
`;

const ReportTextButton = styled.button`
  background: none;
  border: none;
  color: var(--text-caption, #8b95a1);
  font-size: 12px;
  cursor: pointer;
  padding: 2px 4px;

  &:hover {
    color: var(--text-secondary);
  }
`;

const TagRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
`;

const TagItem = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  background: var(--bg-subtle, #f2f4f6);
  color: var(--text-secondary);
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ContentText = styled.p<{ $isExpanded: boolean }>`
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-primary);
  word-break: break-word;
  white-space: pre-wrap;

  ${({ $isExpanded }) =>
    !$isExpanded &&
    `
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  `}
`;

const MoreButton = styled.button`
  align-self: flex-start;
  background: none;
  border: none;
  color: var(--text-tertiary);
  font-size: 12px;
  font-weight: 500;
  padding: 0;
  cursor: pointer;

  &:hover {
    color: var(--text-secondary);
  }
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
  padding-top: 10px;
  border-top: 1px solid var(--border-divider, #f2f4f6);
`;

const FooterLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const WriterText = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
`;

const DateText = styled.span`
  font-size: 11px;
  color: var(--text-caption, #8b95a1);
`;

const LikeButton = styled.button<{ $isLiked: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: ${({ $isLiked }) =>
    $isLiked ? "var(--bg-brand, #e8f3ff)" : "var(--bg-subtle, #f2f4f6)"};
  color: ${({ $isLiked }) =>
    $isLiked ? "var(--interactive-primary, #3182f6)" : "var(--text-secondary)"};
  border: 1px solid
    ${({ $isLiked }) =>
      $isLiked ? "var(--border-brand-subtle, #b8d9ff)" : "transparent"};
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;

  &:active {
    transform: scale(0.96);
  }
`;


const MyReviewBadge = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: var(--interactive-primary, #3182f6);
  background: var(--bg-brand, #e8f3ff);
  padding: 3px 8px;
  border-radius: 6px;
`;

const LikeCountStatic = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: var(--text-tertiary, #8b95a1);
  padding: 4px 6px;
`;
