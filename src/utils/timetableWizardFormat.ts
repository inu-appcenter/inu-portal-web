import { formatHoursToTime } from "@/utils/timetable";
import type { ClassItem } from "@/components/mobile/timetable/TimetableGrid";
import type {
  WizardCourseOption,
  WizardWishlistItem,
} from "@/types/timetableWizard";
import type {
  CourseCardOfferingView,
  CourseCardView,
} from "@/types/courseCardView";

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
      evaluation: course.gradeEvaluationMethod ?? undefined,
    })),
  );

// 위시리스트(WizardCourseOption 스냅샷)를 CourseCard의 View Model로 변환한다.
//
// 위시리스트 항목은 "개설강의 1개 = 항목 1개"지만 카드는 "과목 1개 + 그 분반들"이
// 단위라, courseId로 묶어 담은 순서대로 카드를 만든다. 같은 과목의 다른 분반을 여러 개
// 담아둔 경우 카드 하나에 분반 행이 여러 줄 쌓인다.
//
// 스냅샷에 없는 정보(이수구분·학년)는 채우지 않고 비운다 - 카드가 그 자리를 그리지 않는다.
export const toWishlistCourseCards = (
  wishlist: WizardWishlistItem[],
): CourseCardView[] => {
  const cards = new Map<number, CourseCardView>();

  wishlist.forEach(({ course, required }) => {
    const offering: CourseCardOfferingView = {
      offeringId: course.courseOfferingId,
      subjectNumber: course.subjectNumber,
      professor: course.professor,
      timeStr: formatCourseMeetings(course),
      room: course.meetings[0]?.location ?? null,
      // 담은 인원은 스냅샷에 없다(담는 시점의 서버 값이라 이후 의미가 흐려진다)
      savedCount: null,
      required,
    };

    const card = cards.get(course.courseId);
    if (card) {
      card.offerings.push(offering);
      return;
    }

    cards.set(course.courseId, {
      courseId: course.courseId,
      title: course.title,
      credit: course.credit,
      gradeEvaluationLabel: course.gradeEvaluationMethod ?? null,
      offerings: [offering],
      
    });
  });

  return [...cards.values()];
};
