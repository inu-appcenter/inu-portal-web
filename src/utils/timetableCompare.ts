/** 시간표 비교 화면에서 "나"를 가리키는 가상 친구 ID */
export const ME_FRIEND_ID = 99999;

/**
 * 선택한 친구 중 아직 시간표를 받는 중인 사람이 있는지.
 *
 * - 상태가 "LOADING"이면 로딩 중.
 * - 상태 맵에 없는 ID(링크의 ids에 있지만 더는 친구가 아니거나, 친구 목록을 못 받은 경우)는
 *   앞으로도 시간표 쿼리가 생기지 않는다. 친구 목록을 받는 중일 때만 로딩으로 보고, 그 외에는
 *   로딩이 아니다 — 그러지 않으면 화면이 "불러오고 있어요"에서 영원히 멈춘다.
 */
export const isAnySelectedFriendTimetableLoading = (
  selectedIds: readonly number[],
  statesByFriendId: ReadonlyMap<number, string>,
  isFriendListPending: boolean,
): boolean =>
  selectedIds.some((id) => {
    if (id === ME_FRIEND_ID) return false;
    const state = statesByFriendId.get(id);
    if (state === undefined) return isFriendListPending;
    return state === "LOADING";
  });
