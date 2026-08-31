import LibraryIcon from "./library.svg?react";
import CourseRegistrationIcon from "./course-registration.svg?react";
import ScholarshipIcon from "./scholarship.svg?react";

/**
 * TipsWidget(모바일 홈 팁 카드)에서 쓰는 단색 UI 아이콘.
 * 원본은 #0E4D9D 고정 색이었으며 currentColor로 통합했다.
 * TipsWidget 자체는 현재 어떤 진입점에서도 렌더링되지 않는(도달 불가) 컴포넌트지만
 * 별도 판단 대기 중이라 삭제하지 않고 그대로 이관한다(감사 보고서 [3b]).
 */
export { LibraryIcon, CourseRegistrationIcon, ScholarshipIcon };
