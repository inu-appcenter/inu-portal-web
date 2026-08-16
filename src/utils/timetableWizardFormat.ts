import { formatHoursToTime } from "@/utils/timetable";
import type { ClassItem } from "@/components/mobile/timetable/TimetableGrid";
import type { WizardCourseOption } from "@/types/timetableWizard";

export const WIZARD_DAY_NAMES = ["월", "화", "수", "목", "금", "토", "일"];

export const formatCourseMeetings = (course: WizardCourseOption): string =>
  course.meetings
    .map(
      (m) =>
        `${WIZARD_DAY_NAMES[m.day]} ${formatHoursToTime(m.startTime)}~${formatHoursToTime(m.endTime)}`,
    )
    .join(", ");

export const formatCourseMeta = (course: WizardCourseOption): string => {
  const timeStr = formatCourseMeetings(course);
  const parts = [course.professor, course.subjectNumber, timeStr].filter(
    (part): part is string => Boolean(part && part.trim()),
  );
  return parts.join(" · ");
};

// 마법사 후보 강의를 TimetableGrid가 그릴 수 있는 ClassItem으로 변환 (읽기 전용 미리보기용)
// courseOfferingId/courseId(학수번호)도 함께 채워서, ClassDetailBottomSheet가 개설강의/강의
// 상세를 조회해 교수명·학점·이수구분·평가방식 등을 보강할 수 있게 한다(#249).
export const mapWizardCoursesToClassItems = (
  courses: WizardCourseOption[],
): ClassItem[] =>
  courses.flatMap((course, courseIndex) =>
    course.meetings.map((meeting, meetingIndex) => ({
      id: courseIndex * 1000 + meetingIndex,
      name: course.title,
      room: meeting.location ?? "",
      day: meeting.day,
      startTime: meeting.startTime,
      endTime: meeting.endTime,
      credits: meetingIndex === 0 ? course.credit : 0,
      professor: course.professor ?? undefined,
      ssupTypeName: course.ssupTypeName ?? undefined,
      ssupTypeCode: course.ssupTypeCode ?? undefined,
      courseOfferingId: course.courseOfferingId,
      courseId: course.subjectNumber,
    })),
  );
