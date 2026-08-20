import { ClassItem } from "@/components/mobile/timetable/TimetableGrid";
import type { TimeTableDay, TimeTableDetailItem } from "@/types/timetables";

export const DAY_INDEX: Record<TimeTableDay, number> = {
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
export const parseTimeToHours = (time: string) => {
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
  items.flatMap((item, itemIndex) => {
    const source = item.course ?? item.customSchedule;
    if (!source) return [];

    const itemId = item.id ?? -(itemIndex + 1);

    const credits = item.course
      ? parseFloat(String(item.course.credit)) || undefined
      : undefined;

    if (source.meetings.length === 0) {
      return [
        {
          id: -Math.abs(itemId),
          itemId,
          courseOfferingId: item.course?.courseOfferingId ?? undefined,
          customScheduleId: item.customSchedule?.customScheduleId ?? undefined,
          name: source.title ?? "",
          room: "",
          day: 0,
          startTime: 0,
          endTime: 0,
          credits,
          professor: item.course?.professor ?? undefined,
          memo: item.memo ?? undefined,
          courseId: item.course?.subjectNumber ?? undefined,
          numericCourseId: item.course?.courseId ?? undefined,
          evaluation: item.course?.gradeEvaluationName ?? undefined,
          isCustom: item.type === "CUSTOM",
          isUntimed: true,
        },
      ];
    }

    return source.meetings.map<ClassItem>((meeting, meetingIndex) => ({
      id: meeting.id ?? -(itemIndex * 100 + meetingIndex + 1),
      itemId,
      courseOfferingId: item.course?.courseOfferingId ?? undefined,
      customScheduleId: item.customSchedule?.customScheduleId ?? undefined,
      name: source.title ?? "",
      room: meeting.location ?? "",
      day: DAY_INDEX[meeting.day],
      startTime: parseTimeToHours(meeting.startTime),
      endTime: parseTimeToHours(meeting.endTime),
      // 모든 미팅에 credits를 유지 (바텀시트용)
      credits,
      professor: item.course?.professor ?? undefined,
      memo: item.memo ?? undefined,
      courseId: item.course?.subjectNumber ?? undefined,
      numericCourseId: item.course?.courseId ?? undefined,
      // 평가 방식은 강의 단위 값이라 모든 미팅에 같이 넣는다(바텀시트용).
      evaluation: item.course?.gradeEvaluationName ?? undefined,
      isCustom: item.type === "CUSTOM",
    }));
  });
