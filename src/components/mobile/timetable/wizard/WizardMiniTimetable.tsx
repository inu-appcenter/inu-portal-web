import { useMemo } from "react";
import styled from "styled-components";
import type { WizardCourseOption } from "@/types/timetableWizard";

interface WizardMiniTimetableProps {
  courses: WizardCourseOption[];
}

const MIN_DAY_COUNT = 5;
const MAX_DAY_COUNT = 7;
const START_HOUR = 9;
const DEFAULT_END_HOUR = 18;

// 결과 카드용 미니 시간표 미리보기. TimetableGrid는 시간/요일 라벨 포함 전체 그리드용이라
// 그대로 축소하면 가독성이 떨어져, 요일 구분선 + 블록만 그리는 경량 버전을 별도로 둔다.
// TimetableGrid와 마찬가지로 토/일 수업이 있으면 컬럼 수를 자동으로 넓힌다.
const WizardMiniTimetable = ({ courses }: WizardMiniTimetableProps) => {
  const meetings = useMemo(() => courses.flatMap((c) => c.meetings), [courses]);

  const dayCount = useMemo(() => {
    const maxDay = Math.max(MIN_DAY_COUNT - 1, 0, ...meetings.map((m) => m.day));
    return Math.min(MAX_DAY_COUNT, maxDay + 1);
  }, [meetings]);

  const endHour = useMemo(
    () => Math.max(DEFAULT_END_HOUR, ...meetings.map((m) => m.endTime)),
    [meetings],
  );

  const totalHours = endHour - START_HOUR;

  return (
    <MiniWrapper>
      {Array.from({ length: dayCount - 1 }, (_, i) => (
        <GridLine key={i} style={{ left: `${((i + 1) / dayCount) * 100}%` }} />
      ))}
      {courses.flatMap((course, courseIndex) =>
        course.meetings.map((meeting, meetingIndex) => (
          <Block
            key={`${course.subjectNumber}-${meetingIndex}`}
            style={{
              left: `${(meeting.day / dayCount) * 100}%`,
              width: `${(1 / dayCount) * 100}%`,
              top: `${((meeting.startTime - START_HOUR) / totalHours) * 100}%`,
              height: `${((meeting.endTime - meeting.startTime) / totalHours) * 100}%`,
            }}
            $colorIndex={courseIndex}
          />
        )),
      )}
    </MiniWrapper>
  );
};

export default WizardMiniTimetable;

const BLOCK_COLORS = [
  "#B4D5FF",
  "#C6E7CE",
  "#FFE1B8",
  "#F6C6D6",
  "#D9CBFB",
  "#BEE8E8",
];

const MiniWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 140px;
  overflow: hidden;
`;

const GridLine = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background: var(--border-default, #e5e8eb);
`;

const Block = styled.div<{ $colorIndex: number }>`
  position: absolute;
  margin: 1px;
  border-radius: 3px;
  background: ${({ $colorIndex }) => BLOCK_COLORS[$colorIndex % BLOCK_COLORS.length]};
`;
