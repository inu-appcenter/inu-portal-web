import type {
  FriendInviteCodeResponseDto,
  FriendInvitePreviewResponseDto,
  FriendResponseDto,
} from "@/types/friends";

/**
 * 친구추가 URL/QR 목 데이터.
 * 서버 API(inu-appcenter/inu-portal-server#330) 배포 전에도 화면을 확인할 수 있게 한다.
 * `npm run dev:mock` 에서만 쓰인다.
 */

const MOCK_CODE = "mockInviteCode000000aB";

export const getMockInviteCode = (): FriendInviteCodeResponseDto => ({
  code: MOCK_CODE,
  url: `https://intip.inuappcenter.kr/friend/invite/${MOCK_CODE}`,
});

/** 재발급을 눌렀을 때 코드가 실제로 바뀌는 걸 확인할 수 있도록 매번 다른 값을 만든다. */
export const getMockRefreshedInviteCode = (): FriendInviteCodeResponseDto => {
  const code = `mock${Math.random().toString(36).slice(2, 12).padEnd(10, "0")}${Date.now()
    .toString(36)
    .slice(-8)}`;
  return {
    code,
    url: `https://intip.inuappcenter.kr/friend/invite/${code}`,
  };
};

export const getMockInvitePreview = (): FriendInvitePreviewResponseDto => ({
  nickname: "인천대사자",
  studentId: "2021****34",
  fireId: 3,
});

export const getMockAcceptedFriend = (): FriendResponseDto => ({
  friendId: 9001,
  friendMemberId: 9001,
  nickname: "인천대사자",
  studentId: "2021****34",
  fireId: 3,
});
