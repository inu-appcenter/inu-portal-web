import axiosInstance from "@/apis/axiosInstance";
import tokenInstance from "@/apis/tokenInstance";
import { isMockApiEnabled, mockDelay } from "@/mocks/mockFlag";
import {
  mockAddPollToTimetable,
  mockCreatePoll,
  mockGetMyPolls,
  mockGetMySubmission,
  mockGetPoll,
  mockGetPollJoinPreview,
  mockGetPollParticipants,
  mockGetPollResult,
  mockGetPollRevision,
  mockGetPollSendTargets,
  mockSharePoll,
  mockSubmitPoll,
  mockUpdatePoll,
} from "@/mocks/mockSchedulePollStore";
import { getMyChatRooms } from "@/apis/chat";
import { getFriends } from "@/apis/friends";
import { getBlockedUsers } from "@/apis/blocks";
import useUserStore from "@/stores/useUserStore";
import type { MyChatRoomResponseDto } from "@/types/chat";
import type { FriendResponseDto } from "@/types/friends";
import type { ApiResponse, PageResponse } from "@/types/common";
import type {
  AddToTimetableResponse,
  CreatePollRequest,
  CreatePollResponse,
  MyPollFilter,
  MyPollListItem,
  PollDetail,
  PollJoinPreview,
  PollParticipants,
  PollResult,
  PollRevision,
  PollSubmission,
  SharePollRequest,
  SharePollResponse,
  SubmitPollRequest,
  SubmitPollResponse,
  UpdatePollRequest,
} from "@/types/schedulePolls";
import { getPollErrorCode, getPollErrorStatus } from "@/utils/schedulePollError";

// 시간 맞추기(일정 조율) API. 명세: API v3.4.
// 오류는 axios 에러 그대로 던지고, 호출부가 `getPollErrorCode`로 code를 읽어 분기한다.

const BASE = "/api/schedule-polls";

/** 조율 생성. 개설자는 이 시점에 참여자가 아니다(등록해야 참여자). */
export const createPoll = async (
  request: CreatePollRequest,
): Promise<CreatePollResponse> => {
  if (isMockApiEnabled()) {
    await mockDelay();
    return mockCreatePoll(request);
  }
  const response = await tokenInstance.post<ApiResponse<CreatePollResponse>>(
    BASE,
    request,
  );
  return response.data.data;
};

/** 조건·상태·내 권한. 로그인한 누구나 조회할 수 있다(히트맵·다른 사람 입력은 없음). */
export const getPoll = async (pollId: number): Promise<PollDetail> => {
  if (isMockApiEnabled()) {
    await mockDelay();
    return mockGetPoll(pollId);
  }
  const response = await tokenInstance.get<ApiResponse<PollDetail>>(
    `${BASE}/${pollId}`,
  );
  return response.data.data;
};

/** 폴링용 경량 응답. */
export const getPollRevision = async (pollId: number): Promise<PollRevision> => {
  if (isMockApiEnabled()) {
    await mockDelay(50);
    return mockGetPollRevision(pollId);
  }
  const response = await tokenInstance.get<ApiResponse<PollRevision>>(
    `${BASE}/${pollId}/revision`,
  );
  return response.data.data;
};

/** 링크 미리보기. 비로그인으로도 부를 수 있고, 참여 처리는 하지 않는다. */
export const getPollJoinPreview = async (
  token: string,
): Promise<PollJoinPreview> => {
  const isLoggedIn = Boolean(useUserStore.getState().tokenInfo.accessToken);
  if (isMockApiEnabled()) {
    await mockDelay();
    return mockGetPollJoinPreview(token, isLoggedIn);
  }
  // 비로그인일 때 tokenInstance를 쓰면 401 재발급 흐름을 타므로 인증 없는 인스턴스로 보낸다.
  const instance = isLoggedIn ? tokenInstance : axiosInstance;
  const response = await instance.get<ApiResponse<PollJoinPreview>>(
    `${BASE}/join/${encodeURIComponent(token)}`,
  );
  return response.data.data;
};

/** 내 등록본. 등록한 적이 없으면 null(빈 그리드로 시작하는 정상 흐름). */
export const getMyPollSubmission = async (
  pollId: number,
): Promise<PollSubmission | null> => {
  try {
    if (isMockApiEnabled()) {
      await mockDelay();
      return mockGetMySubmission(pollId);
    }
    const response = await tokenInstance.get<ApiResponse<PollSubmission>>(
      `${BASE}/${pollId}/my-submission`,
    );
    return response.data.data;
  } catch (error) {
    if (
      getPollErrorCode(error) === "SUBMISSION_NOT_FOUND" ||
      (getPollErrorStatus(error) === 404 && getPollErrorCode(error) === null)
    ) {
      return null;
    }
    throw error;
  }
};

/** 등록·재등록. 이 호출이 곧 참여다. */
export const submitPoll = async (
  pollId: number,
  request: SubmitPollRequest,
): Promise<SubmitPollResponse> => {
  if (isMockApiEnabled()) {
    await mockDelay(400);
    return mockSubmitPoll(pollId, request);
  }
  const response = await tokenInstance.put<ApiResponse<SubmitPollResponse>>(
    `${BASE}/${pollId}/my-submission`,
    request,
  );
  return response.data.data;
};

/** 참여자 목록. 등록하지 않은 사람도 이름과 인원은 볼 수 있다. */
export const getPollParticipants = async (
  pollId: number,
): Promise<PollParticipants> => {
  if (isMockApiEnabled()) {
    await mockDelay();
    return mockGetPollParticipants(pollId);
  }
  const response = await tokenInstance.get<ApiResponse<PollParticipants>>(
    `${BASE}/${pollId}/participants`,
  );
  return response.data.data;
};

/** 결과. SUBMITTED 참여자만 조회할 수 있다. 버전 지정 조회는 불변이라 캐시해도 된다. */
export const getPollResult = async (
  pollId: number,
  version: number | "latest",
): Promise<PollResult> => {
  if (isMockApiEnabled()) {
    await mockDelay();
    return mockGetPollResult(pollId, version);
  }
  const response = await tokenInstance.get<ApiResponse<PollResult>>(
    `${BASE}/${pollId}/results/${version}`,
  );
  return response.data.data;
};

/** 카드 전송(보낼 곳 선택 시트의 '보내기'). 외부 공유는 이 API를 부르지 않는다. */
export const sharePoll = async (
  pollId: number,
  request: SharePollRequest,
): Promise<SharePollResponse> => {
  if (isMockApiEnabled()) {
    await mockDelay(400);
    return mockSharePoll(pollId, request);
  }
  const response = await tokenInstance.post<ApiResponse<SharePollResponse>>(
    `${BASE}/${pollId}/shares`,
    request,
  );
  return response.data.data;
};

/** 마감 변경·해제(`deadlineAt`), 종료(`close: true`). 개설자만. */
export const updatePoll = async (
  pollId: number,
  request: UpdatePollRequest,
): Promise<void> => {
  if (isMockApiEnabled()) {
    await mockDelay();
    mockUpdatePoll(pollId, request);
    return;
  }
  await tokenInstance.patch(`${BASE}/${pollId}`, request);
};

export const addPollToTimetable = async (
  pollId: number,
  version: number,
  candidateRank: number,
): Promise<AddToTimetableResponse> => {
  if (isMockApiEnabled()) {
    await mockDelay(300);
    return mockAddPollToTimetable(pollId, version);
  }
  const response = await tokenInstance.post<ApiResponse<AddToTimetableResponse>>(
    `${BASE}/${pollId}/results/${version}/add-to-timetable`,
    { candidateRank },
  );
  return response.data.data;
};

/** 내가 개설했거나 등록한 조율 목록. */
export const getMyPolls = async (
  filter: MyPollFilter,
  page = 0,
): Promise<PageResponse<MyPollListItem>> => {
  if (isMockApiEnabled()) {
    await mockDelay();
    return mockGetMyPolls(filter);
  }
  const response = await tokenInstance.get<
    ApiResponse<PageResponse<MyPollListItem>>
  >(`${BASE}/my`, { params: { filter, page, size: 20 } });
  return response.data.data;
};

export interface PollSendTargets {
  chatRooms: MyChatRoomResponseDto[];
  friends: FriendResponseDto[];
}

/**
 * 보낼 곳 선택 시트의 [채팅방]·[친구] 탭 목록. 기존 API를 그대로 쓴다.
 * 차단한 회원은 친구 탭에서 숨긴다(PRD 4-3).
 */
export const getPollSendTargets = async (): Promise<PollSendTargets> => {
  if (isMockApiEnabled()) {
    await mockDelay();
    return mockGetPollSendTargets();
  }
  const [rooms, friends, blocks] = await Promise.all([
    getMyChatRooms(),
    getFriends(),
    // 차단 목록을 못 받아도 시트는 열려야 한다. 차단 관계는 서버가 전송 시 다시 거른다.
    getBlockedUsers().catch(() => null),
  ]);
  const blockedIds = new Set(
    (blocks?.data ?? []).map((block) => block.blockedMemberId),
  );
  return {
    chatRooms: rooms.data ?? [],
    friends: (friends.data ?? []).filter(
      (friend) => !blockedIds.has(friend.friendMemberId),
    ),
  };
};
