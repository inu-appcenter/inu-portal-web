import { useMemo } from "react";
import styled from "styled-components";
import { ChevronRight } from "lucide-react";
import TimetableGrid from "@/components/mobile/timetable/TimetableGrid";
import { formatCourseMeetings, mapWizardCoursesToClassItems } from "@/utils/timetableWizardFormat";
import type { WizardCandidate } from "@/types/timetableWizard";

interface WizardDetailScreenProps {
  candidate: WizardCandidate;
}

const WizardDetailScreen = ({ candidate }: WizardDetailScreenProps) => {
  const gridEvents = useMemo(
    () => mapWizardCoursesToClassItems(candidate.courses),
    [candidate.courses],
  );

  return (
    <ScrollContent>
      <Card>
        <TimetableGrid events={gridEvents} isFreeMode />
      </Card>

      <Card>
        <CardTitle>이 시간표를 추천한 이유</CardTitle>
        <ReasonList>
          {candidate.reasons.map((reason, index) => (
            <ReasonItem key={index}>
              <ReasonIcon $met={reason.met}>{reason.met ? "✓" : "!"}</ReasonIcon>
              <ReasonText>
                <ReasonHeadline>{reason.headline}</ReasonHeadline>
                {reason.detail && <ReasonDetail>{reason.detail}</ReasonDetail>}
              </ReasonText>
            </ReasonItem>
          ))}
        </ReasonList>
      </Card>

      <Card>
        <CardTitle>강의 목록</CardTitle>
        <CourseList>
          {candidate.courses.map((course, index) => (
            <CourseRow key={course.subjectNumber}>
              <AccentBar $colorIndex={index} />
              <CourseTextWrap>
                <CourseName>{course.title}</CourseName>
                <CourseMeta>
                  {formatCourseMeetings(course)} · {course.credit}학점
                </CourseMeta>
              </CourseTextWrap>
              <ChevronRight size={18} color="var(--gray-400, #b0b8c1)" />
            </CourseRow>
          ))}
        </CourseList>
      </Card>

      <BottomActionsSpacer />
    </ScrollContent>
  );
};

export default WizardDetailScreen;

const BLOCK_COLORS = [
  "#0061FF",
  "#22C55E",
  "#F59E0B",
  "#EC4899",
  "#8B5CF6",
  "#14B8A6",
];

const ScrollContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  -webkit-overflow-scrolling: touch;
`;

const Card = styled.div`
  background: var(--bg-base, #ffffff);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 20px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const CardTitle = styled.h2`
  margin: 0;
  color: var(--text-secondary, #333d4b);
  font-size: 16px;
  font-weight: 700;
  line-height: 23px;
`;

const ReasonList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const ReasonItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
`;

const ReasonIcon = styled.span<{ $met: boolean }>`
  color: ${({ $met }) => ($met ? "var(--green-500, #10b981)" : "var(--orange-500, #f59e0b)")};
  font-size: 14px;
  font-weight: 700;
  line-height: 20px;
  width: 12px;
  flex-shrink: 0;
`;

const ReasonText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ReasonHeadline = styled.span`
  color: var(--text-secondary, #333d4b);
  font-size: 14px;
  font-weight: 600;
  line-height: 19px;
`;

const ReasonDetail = styled.span`
  color: var(--text-tertiary, #8b95a1);
  font-size: 13px;
  line-height: 18px;
`;

const CourseList = styled.div`
  display: flex;
  flex-direction: column;
`;

const CourseRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-default, #e5e8eb);

  &:last-child {
    border-bottom: none;
  }
`;

const AccentBar = styled.div<{ $colorIndex: number }>`
  width: 4px;
  height: 32px;
  border-radius: 2px;
  flex-shrink: 0;
  background: ${({ $colorIndex }) => BLOCK_COLORS[$colorIndex % BLOCK_COLORS.length]};
`;

const CourseTextWrap = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const CourseName = styled.span`
  color: var(--text-secondary, #333d4b);
  font-size: 15px;
  font-weight: 600;
  line-height: 20px;
`;

const CourseMeta = styled.span`
  color: var(--text-tertiary, #8b95a1);
  font-size: 13px;
  line-height: 18px;
`;

const BottomActionsSpacer = styled.div`
  height: 80px;
  flex-shrink: 0;
`;
