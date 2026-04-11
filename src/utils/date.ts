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
