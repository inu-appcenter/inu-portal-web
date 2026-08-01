import type { Course } from "@/types/courses";
import type { CourseOffering } from "@/types/courseOfferings";
import type { TimeTableDay } from "@/types/timetables";
import type { WizardCourseMeeting, WizardCourseOption } from "@/types/timetableWizard";

const DAY_INDEX: Partial<Record<TimeTableDay, number>> = {
  MONDAY: 0,
  TUESDAY: 1,
  WEDNESDAY: 2,
  THURSDAY: 3,
  FRIDAY: 4,
};

const parseTimeToHours = (time: string): number => {
  const [hour, minute] = time.split(":").map(Number);
  return hour + minute / 60;
};

/**
 * Course(학점/학과) + CourseOffering(시간/강의실)을 courseId로 조인해 마법사용 후보 풀을 만든다.
 * 주말 수업은 그리드가 월~금만 표시하므로 후보에서 제외한다.
 */
export const buildWizardCourseOptions = (
  courses: Course[],
  offerings: CourseOffering[],
): WizardCourseOption[] => {
  const courseById = new Map(courses.map((c) => [c.id, c]));

  return offerings.reduce<WizardCourseOption[]>((acc, offering) => {
    const course = courseById.get(offering.courseId);
    if (!course || offering.meetings.length === 0) return acc;

    const meetings: WizardCourseMeeting[] = [];
    for (const meeting of offering.meetings) {
      const day = DAY_INDEX[meeting.day];
      if (day === undefined) return acc; // 주말 수업 포함 시 이 개설강의 전체를 후보에서 제외
      meetings.push({
        day,
        startTime: parseTimeToHours(meeting.startTime),
        endTime: parseTimeToHours(meeting.endTime),
        location: meeting.location,
      });
    }

    acc.push({
      courseId: course.id,
      subjectNumber: offering.subjectNumber,
      title: offering.courseTitle || course.title,
      professor: offering.professor,
      credit: parseFloat(course.credit) || 0,
      department: course.departmentName,
      meetings,
    });
    return acc;
  }, []);
};
