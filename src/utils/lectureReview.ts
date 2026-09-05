// 강의 상세(검색 시트/시간표마법사 위시리스트 카드)에서 공통으로 쓰는 "강의평" 액션.
// 에브리타임 강의평 검색으로 이동한다 - 자체 강의평 서비스가 생기기 전까지의 임시 동선.
const LECTURE_REVIEW_NOTICE_KEY = "lectureReviewEverytimeNoticeShown";
const LECTURE_REVIEW_NOTICE_MESSAGE =
  "현 시점에는 에브리타임 강의평 페이지로 이동해요. 다음학기부터 강의평 서비스가 제공될 예정이에요.";

export const SYLLABUS_UNAVAILABLE_MESSAGE =
  "현 시점에는 제공되지 않아요. 원동력을 위해 학우 여러분의 많은 관심과 성원을 부탁드립니다!";

export const openLectureReview = (professor: string | null | undefined) => {
  const professorName = professor?.trim() || "";
  if (!professorName) {
    alert("교수명 정보가 없어 강의평을 바로 찾을 수 없어요.");
    return;
  }

  if (!localStorage.getItem(LECTURE_REVIEW_NOTICE_KEY)) {
    alert(LECTURE_REVIEW_NOTICE_MESSAGE);
    localStorage.setItem(LECTURE_REVIEW_NOTICE_KEY, "true");
  }

  const url = `https://everytime.kr/lecture/search?keyword=${encodeURIComponent(professorName)}&condition=professor`;
  window.open(url, "_blank", "noopener,noreferrer");
};
