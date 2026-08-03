import type { Course } from "@/types/courses";
import type { CourseOffering } from "@/types/courseOfferings";
import { DAY_INDEX, parseTimeToHours } from "@/utils/timetable";
import type { WizardCourseMeeting, WizardCourseOption } from "@/types/timetableWizard";

/**
 * Course(학점/학과) + CourseOffering(시간/강의실)을 courseId로 조인해 마법사용 후보 풀을 만든다.
 * TimetableGrid가 이벤트에 토/일 데이터가 있으면 자동으로 컬럼을 넓히므로 주말 수업도
 * 후보 풀에 포함한다.
 */
export const buildWizardCourseOptions = (
  courses: Course[],
  offerings: CourseOffering[],
): WizardCourseOption[] => {
  const courseById = new Map(courses.map((c) => [c.id, c]));

  return offerings.reduce<WizardCourseOption[]>((acc, offering) => {
    const course = courseById.get(offering.courseId);
    if (!course || offering.meetings.length === 0) return acc;

    const meetings: WizardCourseMeeting[] = offering.meetings.map((meeting) => ({
      day: DAY_INDEX[meeting.day],
      startTime: parseTimeToHours(meeting.startTime),
      endTime: parseTimeToHours(meeting.endTime),
      location: meeting.location,
    }));

    acc.push({
      courseId: course.id,
      courseOfferingId: offering.id,
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
