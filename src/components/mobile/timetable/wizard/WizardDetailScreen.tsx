import { useMemo, useState } from "react";
import styled from "styled-components";
import { ChevronRight } from "lucide-react";
import TimetableGrid, {
  type ClassItem,
} from "@/components/mobile/timetable/TimetableGrid";
import ClassDetailBottomSheet from "@/components/mobile/timetable/ClassDetailBottomSheet";
import { formatCourseMeetings, mapWizardCoursesToClassItems } from "@/utils/timetableWizardFormat";
import { getOnlineTypeLabel } from "@/components/mobile/timetable/filter/courseFilterModel";
import type { WizardCandidate } from "@/types/timetableWizard";

interface WizardDetailScreenProps {
  candidate: WizardCandidate;
}

const WizardDetailScreen = ({ candidate }: WizardDetailScreenProps) => {
  const gridEvents = useMemo(
    () => mapWizardCoursesToClassItems(candidate.courses),
    [candidate.courses],
  );

  // 강의 목록 행의 accent bar와 동일한 색으로 상세 시트의 점 색상을 맞춘다.
  const colorMap = useMemo(() => {
    const map = new Map<string, string>();
    candidate.courses.forEach((course, index) => {
      map.set(course.title, BLOCK_COLORS[index % BLOCK_COLORS.length]);
    });
    return map;
  }, [candidate.courses]);

  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // meetings가 없는(비대면/온라인 전용) 강의도 상세를 열 수 있도록 gridEvents 조회에
  // 의존하지 않고 candidate.courses에서 직접 ClassItem을 구성한다.
  const handleCourseRowClick = (
    course: WizardCandidate["courses"][number],
    courseIndex: number,
  ) => {
    const firstMeeting = course.meetings[0];
    setSelectedClass({
      id: courseIndex * 1000,
      name: course.title,
      room: firstMeeting?.location ?? "",
      day: firstMeeting?.day ?? 0,
      startTime: firstMeeting?.startTime ?? 0,
      endTime: firstMeeting?.endTime ?? 0,
      credits: course.credit,
      professor: course.professor ?? undefined,
      ssupTypeName: course.ssupTypeName ?? undefined,
      ssupTypeCode: course.ssupTypeCode ?? undefined,
      courseOfferingId: course.courseOfferingId,
      courseId: course.subjectNumber,
      isUntimed: course.meetings.length === 0,
    });
    setDetailOpen(true);
  };

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
                <ReasonHeadline $met={reason.met}>{reason.headline}</ReasonHeadline>
                {reason.detail && <ReasonDetail>{reason.detail}</ReasonDetail>}
              </ReasonText>
            </ReasonItem>
          ))}
        </ReasonList>
      </Card>

      <Card>
        <CardTitle>강의 목록</CardTitle>
        <CourseList>
          {candidate.courses.map((course, index) => {
            const onlineTypeLabel = getOnlineTypeLabel(
              course.ssupTypeName,
              course.ssupTypeCode,
            );
            return (
              <CourseRow
                key={course.subjectNumber}
                onClick={() => handleCourseRowClick(course, index)}
              >
                <AccentBar $colorIndex={index} />
                <CourseTextWrap>
                  <CourseName>{course.title}</CourseName>
                  <CourseMeta>
                    {formatCourseMeetings(course)} · {course.credit}학점
                    {onlineTypeLabel ? ` · ${onlineTypeLabel}` : ""}
                  </CourseMeta>
                </CourseTextWrap>
                <ChevronRight size={18} color="#8a96a5" />
              </CourseRow>
            );
          })}
        </CourseList>
      </Card>

      <BottomActionsSpacer />

      <ClassDetailBottomSheet
        open={detailOpen}
        onOpenChange={setDetailOpen}
        selectedClass={selectedClass}
        allEvents={gridEvents}
        colorMap={colorMap}
        readOnly
      />
    </ScrollContent>
  );
};

export default WizardDetailScreen;

// WizardMiniTimetable과 동일한 --time-table-color-* 팔레트 (앱 전역 시간표 색감 통일)
const BLOCK_COLORS = [
  "var(--time-table-color-pink, #fab5cd)",
  "var(--time-table-color-skyblue, #94cdfa)",
  "var(--time-table-color-teal, #79dddf)",
  "var(--time-table-color-orange, #ffcb94)",
  "var(--time-table-color-violet, #c1acfc)",
  "var(--time-table-color-yellow, #ffe589)",
  "var(--time-table-color-lightgreen, #8ce99a)",
  "var(--time-table-color-lilac, #acbcfd)",
  "var(--time-table-color-purple, #e9adf7)",
  "var(--time-table-color-red, #ffa6a6)",
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
  color: var(--text-primary, #191f28);
  font-size: 15px;
  font-weight: 700;
  line-height: 23px;
`;

const ReasonList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ReasonItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
`;

const ReasonIcon = styled.span<{ $met: boolean }>`
  color: ${({ $met }) => ($met ? "#16a34a" : "#d97706")};
  font-size: 13px;
  font-weight: 700;
  line-height: 20px;
  width: 12px;
  flex-shrink: 0;
`;

const ReasonText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
`;

const ReasonHeadline = styled.span<{ $met: boolean }>`
  color: ${({ $met }) => ($met ? "var(--text-primary, #191f28)" : "#d97706")};
  font-size: 13px;
  font-weight: 500;
  line-height: 19px;
`;

const ReasonDetail = styled.span`
  color: var(--text-tertiary, #8b95a1);
  font-size: 12px;
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
  cursor: pointer;

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
  color: var(--text-primary, #191f28);
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
`;

const CourseMeta = styled.span`
  color: var(--text-tertiary, #8b95a1);
  font-size: 12px;
  line-height: 18px;
`;

const BottomActionsSpacer = styled.div`
  height: 80px;
  flex-shrink: 0;
`;
