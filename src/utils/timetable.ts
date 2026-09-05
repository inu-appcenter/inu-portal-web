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

// 같은 요일 + 시간대 겹침 여부 (TimetableGrid.tsx의 배치 로직과 동일한 판정식)
const isOverlapping = (a: ClassItem, b: ClassItem) =>
  a.day === b.day && a.startTime < b.endTime && b.startTime < a.endTime;

/**
 * 새로 추가하려는 강의(schedules)가 기존 시간표(timetable)의 어떤 요소와
 * 요일·시간이 겹치는지 찾아, 요소(itemId) 단위로 중복 없이 반환한다.
 * 충돌 안내에 과목명·교수명·요일·시간을 보여주기 위한 용도.
 */
export const findConflictingClassItems = (
  schedules: ClassItem[],
  timetable: ClassItem[],
): ClassItem[] => {
  const seen = new Set<number>();
  const conflicts: ClassItem[] = [];

  for (const schedule of schedules) {
    for (const existing of timetable) {
      if (!isOverlapping(schedule, existing)) continue;

      const key = existing.itemId ?? existing.id;
      if (seen.has(key)) continue;
      seen.add(key);
      conflicts.push(existing);
    }
  }

  return conflicts;
};

const DAY_LABELS_KO = ["월", "화", "수", "목", "금", "토", "일"];

/** 충돌 안내 문구: "과목명(교수명) 월 10:00~11:15, ..." 형태로 합친다 */
export const formatConflictingClassItems = (conflicts: ClassItem[]) =>
  conflicts
    .map((c) => {
      const day = DAY_LABELS_KO[c.day] ?? "";
      const time = `${formatHoursToTime(c.startTime)}~${formatHoursToTime(c.endTime)}`;
      const professor = c.professor ? `(${c.professor})` : "";
      return `${c.name}${professor} ${day} ${time}`;
    })
    .join(", ");

/** 시간표 이벤트를 강의(시간표 요소) 단위로 묶은 결과 */
export interface TimetableCourseGroup {
  /** 묶음 식별자 */
  key: string;
  name: string;
  /** 강의 학점. 커스텀 일정이거나 학점 정보가 없으면 null */
  credits: number | null;
  /** 미팅 시간 합(시간 단위). 학점 정보가 없을 때 추정에 쓴다. */
  totalHours: number;
  /** 개인 일정(커스텀)인지 */
  isCustom: boolean;
  /** 강의 개설 ID */
  courseOfferingId?: number;
}

/**
 * ClassItem은 meeting 단위라 주 2회 강의는 같은 강의가 두 개로 들어 있다.
 * 학점계산기처럼 강의 단위로 세야 하는 곳에서 쓰려고 itemId 기준으로 묶는다.
 *
 * credits는 만드는 쪽에 따라 모든 미팅에 같은 값이 들어가기도 하고(시간표 상세)
 * 첫 미팅에만 들어가기도 해서(강의 검색·마법사 미리보기) 최댓값을 취한다.
 */
export const groupClassItemsByCourse = (
  events: ClassItem[],
): TimetableCourseGroup[] => {
  const groups = new Map<string, TimetableCourseGroup>();

  events.forEach((event) => {
    const key =
      event.itemId != null
        ? `item:${event.itemId}`
        : event.courseOfferingId != null
          ? `offering:${event.courseOfferingId}`
          : event.customScheduleId != null
            ? `custom:${event.customScheduleId}`
            : `name:${event.name}|${event.professor ?? ""}`;

    // 시간이 없는 요소(isUntimed)는 0~0으로 들어와 시간 합에 기여하지 않는다.
    const hours = Math.max(0, event.endTime - event.startTime);
    const existing = groups.get(key);

    if (!existing) {
      groups.set(key, {
        key,
        name: event.name,
        credits: event.credits ?? null,
        totalHours: hours,
        isCustom: !!event.isCustom,
        courseOfferingId: event.courseOfferingId,
      });
      return;
    }

    existing.totalHours += hours;
    if (event.credits != null) {
      existing.credits = Math.max(existing.credits ?? 0, event.credits);
    }
  });

  return [...groups.values()];
};
