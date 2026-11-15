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

/**
 * 서버가 "이미 처리된 친구 요청"(409)으로 거절한 경우. 다른 화면·기기에서 먼저
 * 처리된 것이므로 실패로 안내하지 않고 목록만 새로 고친다.
 */
export const isFriendRequestAlreadyProcessed = (error: unknown) =>
  axios.isAxiosError(error) && error.response?.status === 409;
