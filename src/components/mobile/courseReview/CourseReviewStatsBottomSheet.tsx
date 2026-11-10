import styled from "styled-components";
import BottomSheet from "@/components/common/BottomSheet";
import type { CourseReviewSummary } from "@/types/courseReview";

interface CourseReviewStatsBottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary: CourseReviewSummary | undefined;
}

export default function CourseReviewStatsBottomSheet({
  open,
  onOpenChange,
  summary,
}: CourseReviewStatsBottomSheetProps) {
  if (!summary) return null;

  const total = summary.totalReviews;

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} maxHeight="85vh">
      <SheetInner>
        <HeaderArea>
          <SheetTitle>상세 평가 분석</SheetTitle>
          <SheetSubtitle>
            {summary.professor ? `${summary.professor} 교수님 강의에 대한 ` : ""}
            수강생 {total}명의 평가를 분석했어요.
          </SheetSubtitle>
        </HeaderArea>

        {/* 1. 별점 분포 섹션 */}
        <SectionContainer>
          <SectionTitle>별점 분포</SectionTitle>
          <DistributionList>
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = summary.ratingDistribution[rating] || 0;
              const percent = total > 0 ? (count / total) * 100 : 0;
              return (
                <DistributionRow key={rating}>
                  <RatingLabel>{rating}점</RatingLabel>
                  <BarTrack>
                    <BarFill $percent={percent} />
                  </BarTrack>
                  <CountLabel>{count}명</CountLabel>
                </DistributionRow>
              );
            })}
          </DistributionList>
        </SectionContainer>

        <Divider />

        {/* 2. 5대 세부 지표 분석 섹션 */}
        <SectionContainer>
          <SectionTitle>핵심 평가 지표</SectionTitle>

          <MetricBlock>
            <MetricLabel>학점 비율</MetricLabel>
            <RatioGroup>
              <RatioItem label="너그러움" percent={summary.gradeSatisfactionRatios["너그러움"] || 0} />
              <RatioItem label="보통" percent={summary.gradeSatisfactionRatios["보통"] || 0} />
              <RatioItem label="깐깐함" percent={summary.gradeSatisfactionRatios["깐깐함"] || 0} />
            </RatioGroup>
          </MetricBlock>

          <MetricBlock>
            <MetricLabel>과제량</MetricLabel>
            <RatioGroup>
              <RatioItem label="많음" percent={summary.assignmentRatios["많음"] || 0} />
              <RatioItem label="보통" percent={summary.assignmentRatios["보통"] || 0} />
              <RatioItem label="적음" percent={summary.assignmentRatios["적음"] || 0} />
            </RatioGroup>
          </MetricBlock>

          <MetricBlock>
            <MetricLabel>조모임(팀플)</MetricLabel>
            <RatioGroup>
              <RatioItem label="많음" percent={summary.teamProjectRatios["많음"] || 0} />
              <RatioItem label="보통" percent={summary.teamProjectRatios["보통"] || 0} />
              <RatioItem label="없음" percent={summary.teamProjectRatios["없음"] || 0} />
            </RatioGroup>
          </MetricBlock>

          <MetricBlock>
            <MetricLabel>시험 횟수</MetricLabel>
            <RatioGroup>
              <RatioItem label="2회" percent={summary.examCountRatios["2회"] || 0} />
              <RatioItem label="1회" percent={summary.examCountRatios["1회"] || 0} />
              <RatioItem label="과제대체" percent={summary.examCountRatios["과제대체"] || 0} />
            </RatioGroup>
          </MetricBlock>

          <MetricBlock>
            <MetricLabel>출결 방식</MetricLabel>
            <RatioGroup>
              <RatioItem label="전자출결" percent={summary.attendanceRatios["전자출결"] || 0} />
              <RatioItem label="직접호명" percent={summary.attendanceRatios["직접호명"] || 0} />
              <RatioItem label="혼합/기타" percent={summary.attendanceRatios["혼합"] || 0} />
            </RatioGroup>
          </MetricBlock>
        </SectionContainer>
      </SheetInner>
    </BottomSheet>
  );
}

function RatioItem({ label, percent }: { label: string; percent: number }) {
  return (
    <RatioRow>
      <RatioItemLabel>{label}</RatioItemLabel>
      <BarTrack>
        <BarFill $percent={percent} />
      </BarTrack>
      <PercentLabel>{percent.toFixed(0)}%</PercentLabel>
    </RatioRow>
  );
}

const SheetInner = styled.div`
  display: flex;
  flex-direction: column;
  padding: 12px 20px 32px;
  overflow-y: auto;
  box-sizing: border-box;
`;

const HeaderArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 20px;
`;

const SheetTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
`;

const SheetSubtitle = styled.p`
  margin: 0;
  font-size: 13px;
  color: var(--text-tertiary);
`;

const SectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionTitle = styled.h4`
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-secondary);
`;

const DistributionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const DistributionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const RatingLabel = styled.span`
  width: 28px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  text-align: right;
  flex-shrink: 0;
`;

const BarTrack = styled.div`
  flex: 1;
  height: 8px;
  background: var(--bg-subtle, #f2f4f6);
  border-radius: 4px;
  overflow: hidden;
`;

const BarFill = styled.div<{ $percent: number }>`
  width: ${({ $percent }) => `${Math.min(100, Math.max(0, $percent))}%`};
  height: 100%;
  background: var(--interactive-primary, #3182f6);
  border-radius: 4px;
  transition: width 0.3s ease;
`;

const CountLabel = styled.span`
  width: 32px;
  font-size: 12px;
  color: var(--text-tertiary);
  text-align: left;
  flex-shrink: 0;
`;

const Divider = styled.div`
  height: 1px;
  background: var(--border-divider, #e5e8eb);
  margin: 20px 0;
`;

const MetricBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
`;

const MetricLabel = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
`;

const RatioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const RatioRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const RatioItemLabel = styled.span`
  width: 60px;
  font-size: 12px;
  color: var(--text-tertiary);
  flex-shrink: 0;
`;

const PercentLabel = styled.span`
  width: 36px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-align: right;
  flex-shrink: 0;
`;
