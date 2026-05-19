/**
 * ISO 날짜 문자열을 한국어 형식으로 변환
 * @param isoString ISO 8601 날짜 문자열
 * @returns 포맷팅된 날짜 문자열
 */
export const formatKoreanDateTime = (isoString: string | null): string => {
  if (!isoString) return "";

  const date = new Date(isoString);

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  return `${year}년 ${month}월 ${day}일 ${hours}시 ${minutes}분 ${seconds}초`;
};

/**
 * ISO 날짜 문자열을 상대적 시간 표현(방금 전, n분 전, n시간 전, n일 전)으로 변환
 * 7일 이상 경과했거나 연도가 다를 경우 "YYYY.MM.DD" 포맷으로 반환
 */
export const formatTimeAgo = (isoString: string | null): string => {
  if (!isoString) return "";

  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    // 미래의 시간일 경우 처리
    if (diffMs < 0) {
      return "방금 전";
    }

    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) {
      return "방금 전";
    }
    if (diffMins < 60) {
      return `${diffMins}분 전`;
    }
    if (diffHours < 24) {
      return `${diffHours}시간 전`;
    }
    if (diffDays < 7) {
      return `${diffDays}일 전`;
    }

    // 7일 이상은 YYYY.MM.DD 포맷으로 반환
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  } catch (error) {
    console.error("날짜 파싱 실패:", error);
    return "";
  }
};
