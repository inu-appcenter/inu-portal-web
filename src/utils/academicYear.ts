/**
 * 현재 시점에 대응하는 학사/입학 학년도를 동적으로 산출합니다.
 * 
 * - 11월 ~ 12월: 수시 합격자 발표 및 예비 신입생 전산망 등록 시즌 -> 다음 연도 (Y+1)
 * - 1월 ~ 10월: 정시 합격자 등록 및 당해 학년도 재학/입학 시즌 -> 당해 연도 (Y)
 */
export function getAcademicYear(date = new Date()): number {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 1 ~ 12
  return month >= 11 ? year + 1 : year;
}
