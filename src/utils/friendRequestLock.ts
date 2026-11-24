import axios from "axios";

/**
 * 받은 친구 요청(수락/거절)을 처리 중인 friendId 목록.
 *
 * 같은 요청은 친구 목록의 확인 모달과 프로필 바텀시트 두 곳에서 처리할 수 있다.
 * 컴포넌트 상태(isPending)는 각자 따로이고 리렌더 뒤에야 반영돼, 연타나 두 화면에서의
 * 동시 처리를 막지 못한다. 모듈 단위로 동기 잠금을 걸어 한 요청은 한 번만 보낸다.
 * (다른 웹뷰에서의 중복은 서버의 PENDING 조건부 처리가 막는다.)
 */
const inFlight = new Set<number>();

export const tryLockFriendRequest = (friendId: number): boolean => {
  if (inFlight.has(friendId)) return false;
  inFlight.add(friendId);
  return true;
};

export const unlockFriendRequest = (friendId: number) => {
  inFlight.delete(friendId);
};

export const isFriendRequestLocked = (friendId: number) => inFlight.has(friendId);

const statusOf = (error: unknown) =>
  axios.isAxiosError(error) ? error.response?.status : undefined;

/**
 * 다른 화면·기기에서 먼저 처리된 친구 요청인 경우. 실패로 안내하지 않고 목록만 새로 고친다.
 * - 409: 서버가 "이미 처리된 친구 요청"으로 거절(이미 수락됨 등)
 * - 404: 상대가 먼저 취소·거절해 요청 자체가 없어짐
 */
export const isFriendRequestAlreadyProcessed = (error: unknown) => {
  const status = statusOf(error);
  return status === 409 || status === 404;
};

/**
 * 거절·취소가 "이미 처리됨"으로 끝났을 때 사용자에게 보여 줄 짧은 안내.
 * 거절·취소의 409는 요청이 더는 PENDING이 아니라는 뜻, 즉 이미 수락된 경우다.
 * 404(요청이 사라짐)는 목록에서 빠지는 것으로 충분해 안내하지 않는다(null).
 */
export const getAlreadyProcessedFriendRequestNotice = (
  error: unknown,
): string | null =>
  statusOf(error) === 409 ? "이미 수락된 요청이에요." : null;
