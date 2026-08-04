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
    offering.credit ?? (parseInt(course?.credit ?? "", 10) || 0);

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
  };
};

