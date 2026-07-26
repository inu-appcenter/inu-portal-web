import { ClassItem } from "@/components/mobile/timetable/TimetableGrid";
import type { TimeTableDay, TimeTableDetailItem } from "@/types/timetables";

const DAY_INDEX: Record<TimeTableDay, number> = {
  MONDAY: 0,
  TUESDAY: 1,
  WEDNESDAY: 2,
  THURSDAY: 3,
  FRIDAY: 4,
  SATURDAY: 5,
  SUNDAY: 6,
};

// 그리드 요일 인덱스 -> 서버 요일 enum (커스텀 일정 요청 DTO용)
export const DAY_BY_INDEX: TimeTableDay[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

// "HH:mm" -> 시간 단위 숫자 (예: "10:15" -> 10.25)
const parseTimeToHours = (time: string) => {
  const [hour, minute] = time.split(":").map(Number);
  return hour + minute / 60;
};

// 시간 단위 숫자 -> "HH:mm" (예: 10.25 -> "10:15")
export const formatHoursToTime = (hours: number) => {
  const hour = Math.floor(hours);
  const minute = Math.round((hours - hour) * 60);
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
};

// 시간표 상세 응답의 요소 목록을 시간표 그리드용 이벤트로 변환
export const mapDetailItemsToClassItems = (
  items: TimeTableDetailItem[],
): ClassItem[] =>
  items.flatMap((item) => {
    const source = item.course ?? item.customSchedule;
    if (!source) return [];

    const credits = item.course
      ? parseFloat(item.course.credit) || undefined
      : undefined;

    return source.meetings.map<ClassItem>((meeting, index) => ({
      id: meeting.id,
      itemId: item.id,
      customScheduleId: item.customSchedule?.customScheduleId,
      name: source.title,
      room: meeting.location ?? "",
      day: DAY_INDEX[meeting.day],
      startTime: parseTimeToHours(meeting.startTime),
      endTime: parseTimeToHours(meeting.endTime),
      // 학점 합산이 중복되지 않도록 첫 미팅에만 학점을 부여
      credits: index === 0 ? credits : 0,
      professor: item.course?.professor,
      memo: item.memo ?? undefined,
      courseId: item.course?.subjectNumber,
      isCustom: item.type === "CUSTOM",
    }));
  });
