import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTimetableStore } from "@/stores/useTimetableStore";

/**
 * 활성 시간표 id를 URL 쿼리파라미터(`?id=`)와 동기화한다.
 * - URL에 id가 있고 목록에 해당 시간표가 있으면 그 시간표를 활성 시간표로 복원한다
 *   (새로고침, 공유 링크, 뒤로가기로 재진입해도 보고 있던 시간표가 유지되도록).
 * - 그렇지 않고 활성 시간표가 바뀌면(목록에서 다른 시간표 선택 등) URL도 함께 갱신한다.
 *
 * 두 방향을 하나의 effect에서 if/else로 처리한다 - 별도 effect 두 개로 나누면 같은
 * 렌더 안에서 서로 상대방의 최신 값을 못 보고(store가 방금 고른 기본 시간표를 "복원 전"
 * 값으로 오인) URL을 되돌려버리는 경합이 생긴다(실제로 겪은 버그).
 */
export const useTimetableUrlSync = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { timetables, activeTimetableId, setSemester, setActiveTimetable } =
    useTimetableStore();

  const idParam = searchParams.get("id");

  useEffect(() => {
    if (timetables.length === 0) return;

    const parsedId = idParam ? Number(idParam) : NaN;
    const urlMatch = Number.isNaN(parsedId)
      ? undefined
      : timetables.find((t) => t.id === parsedId);

    if (urlMatch && urlMatch.id !== activeTimetableId) {
      // URL이 가리키는 시간표로 복원 (URL 우선)
      setSemester(urlMatch.semester);
      setActiveTimetable(urlMatch.id);
      return;
    }

    if (activeTimetableId !== null && idParam !== String(activeTimetableId)) {
      // 활성 시간표를 URL에 반영 (URL에 유효한 id가 없거나 이미 최신일 때만 도달)
      const next = new URLSearchParams(searchParams);
      next.set("id", String(activeTimetableId));
      setSearchParams(next, { replace: true });
    }
  }, [idParam, timetables, activeTimetableId, searchParams, setSearchParams, setSemester, setActiveTimetable]);
};
