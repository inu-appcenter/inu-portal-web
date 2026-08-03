import { formatHoursToTime } from "@/utils/timetable";
import type { ClassItem } from "@/components/mobile/timetable/TimetableGrid";
import type { WizardCourseOption } from "@/types/timetableWizard";

export const WIZARD_DAY_NAMES = ["월", "화", "수", "목", "금"];

export const formatCourseMeetings = (course: WizardCourseOption): string =>
  course.meetings
    .map(
      (m) =>
        `${WIZARD_DAY_NAMES[m.day]} ${formatHoursToTime(m.startTime)}~${formatHoursToTime(m.endTime)}`,
    )
    .join(", ");

// 마법사 후보 강의를 TimetableGrid가 그릴 수 있는 ClassItem으로 변환 (읽기 전용 미리보기용)
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
    })),
  );
