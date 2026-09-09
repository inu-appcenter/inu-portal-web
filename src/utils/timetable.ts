import type { ClassItem } from "@/components/mobile/timetable/TimetableGrid";
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

/** 친구 시간표 비교(공강 계산)에서 "바쁜 시간" 하나를 나타내는 최소 단위 */
export interface BusyInterval {
  day: number;
  startTime: number;
  endTime: number;
}

/** 공통 공강 시간 하나 */
export interface CommonFreeSlot {
  day: number;
  startTime: number;
  endTime: number;
  duration: number;
}

export interface CalculateCommonFreeSlotsOptions {
  /** 계산 대상 요일 수 (0 ~ dayCount-1). 기본 5 (월~금) */
  dayCount?: number;
  /** 공강 탐색 시작 시각(시 단위). 기본 9 */
  windowStart?: number;
  /** 공강 탐색 종료 시각(시 단위). 기본 18 */
  windowEnd?: number;
  /** 목록/그리드에 포함할 최소 공강 길이(분). 기본 30 */
  minFreeMinutes?: number;
}

/**
 * 여러 명(나 + 선택된 친구들)의 수업 시간을 합쳐 요일별 "공통 공강" 구간을 계산한다.
 *
 * 부동소수점 오차(예: 50분 수업 -> 50/60 시간의 2진 반올림 오차)가 구간 병합·최소
 * 길이 판정에 영향을 주지 않도록 내부 연산은 전부 정수 분(minute) 단위로 수행하고,
 * 반환 시에만 시간(hour) 단위 소수로 변환한다.
 */
export const calculateCommonFreeSlots = (
  busyByPerson: BusyInterval[][],
  options: CalculateCommonFreeSlotsOptions = {},
): CommonFreeSlot[] => {
  const {
    dayCount = 5,
    windowStart = 9,
    windowEnd = 18,
    minFreeMinutes = 30,
  } = options;

  const windowStartMin = Math.round(windowStart * 60);
  const windowEndMin = Math.round(windowEnd * 60);
  if (windowEndMin <= windowStartMin) return [];

  const result: CommonFreeSlot[] = [];

  for (let day = 0; day < dayCount; day++) {
    // 정수 분 단위로 변환 + 탐색 범위로 클램프
    const busyMinutes = busyByPerson
      .flat()
      .filter((b) => b.day === day)
      .map((b) => ({
        start: Math.max(windowStartMin, Math.round(b.startTime * 60)),
        end: Math.min(windowEndMin, Math.round(b.endTime * 60)),
      }))
      .filter((b) => b.start < b.end)
      .sort((a, b) => a.start - b.start);

    // 겹치거나 맞닿은(back-to-back) 구간 병합
    const merged: { start: number; end: number }[] = [];
    for (const curr of busyMinutes) {
      const prev = merged[merged.length - 1];
      if (prev && curr.start <= prev.end) {
        prev.end = Math.max(prev.end, curr.end);
      } else {
        merged.push({ ...curr });
      }
    }

    // 탐색 범위 안의 빈 구간(공강) 추출
    let cursor = windowStartMin;
    const pushFreeSlot = (startMin: number, endMin: number) => {
      const durationMin = endMin - startMin;
      if (durationMin < minFreeMinutes) return;
      result.push({
        day,
        startTime: startMin / 60,
        endTime: endMin / 60,
        duration: durationMin / 60,
      });
    };

    for (const busy of merged) {
      if (busy.start > cursor) {
        pushFreeSlot(cursor, busy.start);
      }
      cursor = Math.max(cursor, busy.end);
    }
    if (cursor < windowEndMin) {
      pushFreeSlot(cursor, windowEndMin);
    }
  }

  return result;
};
