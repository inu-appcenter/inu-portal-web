import type { Course } from "@/types/courses";
import type { CourseOffering } from "@/types/courseOfferings";
import { DAY_INDEX, parseTimeToHours } from "@/utils/timetable";
import type { WizardCourseMeeting, WizardCourseOption } from "@/types/timetableWizard";

/**
 * 개설강의(시간/강의실) + Course(학점/학과)를 마법사가 쓰는 단위 하나로 변환한다.
 *
 * 사용자가 강의를 담는 그 시점에만 호출되고, 결과는 스토어에 스냅샷으로 확정 저장된다.
 * 예전처럼 "현재 조회된 목록 전체"를 후보 풀로 만들어두고 나중에 subjectNumber로 되찾는
 * 방식이 아니다 - 그 풀은 필터가 바뀔 때마다 통째로 갈리는 휘발성 데이터라서, 담아둔
 * 강의가 화면과 생성 결과에서 조용히 사라지는 원인이었다.
 *
 * meetings가 없는 강의(이러닝·현장실습 등)는 시간 조합 탐색에 참여할 수 없으므로 null.
 */
export const toWizardCourseOption = (
  offering: CourseOffering,
  course: Course | undefined,
): WizardCourseOption | null => {

  const meetings: WizardCourseMeeting[] = offering.meetings.map((meeting) => ({
    day: DAY_INDEX[meeting.day],
    startTime: parseTimeToHours(meeting.startTime),
    endTime: parseTimeToHours(meeting.endTime),
    location: meeting.location,
  }));

  // credit: 서버가 개설강의에 학점을 안 실어주는 경우가 있어 Course의 학점으로 보정.
  // Number(undefined)는 NaN이라 ??로는 걸러지지 않으므로 아래에서 유한값 검사가 필요하다.
  const parsedCredit = offering.credit ?? Number(course?.credit);

  return {
    courseId: offering.courseId,
    courseOfferingId: offering.id,
    subjectNumber: offering.subjectNumber,
    title: offering.courseTitle || course?.title || "",
    professor: offering.professor,
    credit: Number.isFinite(parsedCredit) ? parsedCredit : 0,
    department: offering.deptName ?? course?.departmentName ?? null,
    meetings,
    ssupTypeName: offering.ssupTypeName ?? null,
    ssupTypeCode: offering.ssupTypeCode ?? null,
  };
};
