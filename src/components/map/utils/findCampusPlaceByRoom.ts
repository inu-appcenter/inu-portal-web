import { Place, places } from "../DB";

/**
 * 시간표 강의실 표기(예: "07-407", "12-402", "7호관 502호")에서
 * 건물 번호(호관)를 추출한다.
 *
 * `places`(학교 탭) DB는 건물 단위로만 좌표를 가지고 있어 호실 단위 검색은
 * 불가능하다. 대신 강의실 코드 맨 앞의 건물 번호를 뽑아 해당 건물 마커를
 * 찾아주는 것으로 "검색/포커스"를 구현한다.
 */
export function extractBuildingKey(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  // "18-1호관" / "18-2호관" / "18-3호관" 처럼 건물 번호 자체에 하이픈이
  // 들어가는 예외 케이스를 먼저 확인한다.
  const specialMatch = trimmed.match(/^(18-[123])\s*호관/);
  if (specialMatch) {
    return specialMatch[1];
  }

  // 이미 "n호관" 형식으로 표기된 경우 (예: "7호관 502호")
  const nameMatch = trimmed.match(/(\d{1,2})\s*호관/);
  if (nameMatch) {
    return nameMatch[1];
  }

  // "07-407", "7-407" 같은 강의실 코드에서 앞자리 건물 번호를 추출한다.
  const codeMatch = trimmed.match(/^0*(\d{1,2})[\s-]\d/);
  if (codeMatch) {
    return codeMatch[1];
  }

  return null;
}

/** 강의실 표기 문자열로 캠퍼스맵의 건물 Place를 찾는다. 못 찾으면 null. */
export function findCampusPlaceByRoom(raw: string): Place | null {
  const key = extractBuildingKey(raw);
  if (!key) {
    return null;
  }

  return places.find((place) => place.location === `${key}호관`) ?? null;
}
