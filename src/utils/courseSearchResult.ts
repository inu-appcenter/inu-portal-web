import type { Course } from "@/types/courses";
import type { CourseOffering } from "@/types/courseOfferings";
import { DAY_INDEX, parseTimeToHours } from "@/utils/timetable";
import type { CourseResult } from "@/components/mobile/timetable/MobileCourseSearchSheet";

const DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

// 개설강의(CourseOffering: 학기별 시간/강의실/교수) + Course(학점/학과/학년 등 교육과정
// 정보)를 courseId로 조인해 MobileCourseSearchSheet가 요구하는 CourseResult로 변환한다.
// 시간표 편집(강의 추가)과 시간표마법사(꼭 넣고 싶은 강의 추가)가 동일한 검색 바텀시트를
// 공유하므로 매핑 로직도 여기 하나로 공유한다.
export const mapCourseOfferingToCourseResult = (
  offering: CourseOffering,
  course: Course | undefined,
): CourseResult => {
  const credits =
    offering.credit ?? (Number(course?.credit) || 0);

  const grade = offering.hyName
    ? parseInt(offering.hyName, 10) || 0
    : parseInt(course?.targetGradeName ?? "", 10) || 0;

  const isMajor = offering.isuName
    ? offering.isuName.includes("전공")
    : course?.completionDivisionName.includes("전공") ?? false;

  return {
    id: offering.id,
    name: offering.courseTitle || course?.title || "",
    professor: offering.professor ?? "-",
    timeStr: offering.meetings.length
      ? offering.meetings
          .map(
            (m) => `${DAY_LABELS[DAY_INDEX[m.day]]} ${m.startTime}~${m.endTime}`,
          )
          .join(", ")
      : "-",
    room: offering.meetings[0]?.location ?? "-",
    grade,
    isMajor,
    credits,
    courseId: offering.subjectNumber,
    remarks: offering.note || course?.content,
    enrolledCount: offering.enrolledCount,
    capacity: offering.capacity,
    schedules: offering.meetings.map((m, index) => ({
      id: m.id,
      name: offering.courseTitle,
      room: m.location ?? "",
      day: DAY_INDEX[m.day],
      startTime: parseTimeToHours(m.startTime),
      endTime: parseTimeToHours(m.endTime),
      credits: index === 0 ? credits : 0,
      professor: offering.professor ?? undefined,
    })),
    deptName: offering.deptName ?? course?.departmentName,
    collegeName: offering.collegeName ?? course?.collegeName,
    isuName: offering.isuName ?? course?.completionDivisionName,
    hyName: offering.hyName ?? course?.targetGradeName,
  };
};

import type { FilterState } from "@/components/mobile/timetable/filter/courseFilterModel";
import {
  expandIsuNameLabel,
  expandOnlineTypeLabel,
  isIsuNameLabel,
} from "@/components/mobile/timetable/filter/courseFilterModel";
import type { CourseOfferingFilters } from "@/types/courseOfferings";

const COLLEGES = new Set([
  "경영대학",
  "공과대학",
  "교양",
  "교직",
  "군사학",
  "글로벌정경대학",
  "기타",
  "단과대구분없음",
  "단과대구분없음(법학)",
  "도시과학대학",
  "사범대학",
  "사회과학대학",
  "생명과학기술대학",
  "예술체육대학",
  "융합자유전공대학",
  "인문대학",
  "일선",
  "자연과학대학",
  "정보기술대학",
]);

const DAY_ENUMS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

export function formatSlotsToMeetings(slots: string[]): string[] {
  if (!slots || slots.length === 0) return [];
  const dayGroups: Record<number, number[]> = {};
  slots.forEach((slot) => {
    const [dStr, hStr] = slot.split("-");
    const d = parseInt(dStr, 10);
    const h = parseFloat(hStr);
    if (!dayGroups[d]) dayGroups[d] = [];
    dayGroups[d].push(h);
  });

  const result: string[] = [];
  Object.keys(dayGroups).forEach((dKey) => {
    const d = parseInt(dKey, 10);
    const dayEnum = DAY_ENUMS[d];
    if (!dayEnum) return;

    const hours = dayGroups[d].sort((a, b) => a - b);
    let start = hours[0];
    let prev = hours[0];

    for (let i = 1; i <= hours.length; i++) {
      const current = hours[i];
      if (current === prev + 0.5) {
        prev = current;
      } else {
        const end = prev + 0.5;
        const formatHour = (val: number): string => {
          const h = Math.floor(val);
          const m = Math.round((val - h) * 60);
          return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
        };
        result.push(`${dayEnum}|${formatHour(start)}|${formatHour(end)}`);
        start = current;
        prev = current;
      }
    }
  });

  return result;
}

export function mapFilterToOfferingFilters(filters: FilterState): CourseOfferingFilters {
  const major = filters.major ?? undefined;

  let collegeName: string | undefined = undefined;
  let deptName: string | undefined = undefined;

  // 이수구분은 UI 라벨("전공"/"교양")을 서버가 아는 값으로 펼쳐서 넘긴다.
  // 서버가 정확일치 + 같은 파라미터 반복은 OR이므로, 묶음 라벨을 그대로 보내면 0건이 된다.
  const isuNameSet = new Set(filters.types.flatMap((type) => expandIsuNameLabel(type)));

  if (major) {
    if (COLLEGES.has(major)) {
      collegeName = major;
    } else if (isIsuNameLabel(major)) {
      expandIsuNameLabel(major).forEach((name) => isuNameSet.add(name));
    } else if (major !== "전체 학과/영역") {
      deptName = major;
    }
  }

  const meetings = filters.selectedSlots ? formatSlotsToMeetings(filters.selectedSlots) : [];
  const ssupTypeNames = (filters.onlineTypes ?? []).flatMap(expandOnlineTypeLabel);

  return {
    collegeName,
    deptName,
    hyNames: filters.grades.length > 0 ? filters.grades.map(String) : undefined,
    isuNames: isuNameSet.size > 0 ? [...isuNameSet] : undefined,
    ssupTypeNames: ssupTypeNames.length > 0 ? ssupTypeNames : undefined,
    credits: filters.credits.length > 0 ? filters.credits : undefined,
    meetingFilterMode: meetings.length > 0 ? "HAS_CLASS" : undefined,
    meetings: meetings.length > 0 ? meetings : undefined,
  };
}

