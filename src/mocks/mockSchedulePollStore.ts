import useUserStore from "@/stores/useUserStore";
import type {
  AddToTimetableResponse,
  CreatePollRequest,
  CreatePollResponse,
  MyPollFilter,
  MyPollListItem,
  PollColumn,
  PollDetail,
  PollDurationMode,
  PollErrorCode,
  PollJoinPreview,
  PollJoinSource,
  PollParticipants,
  PollResult,
  PollRevision,
  PollSlotRange,
  PollStatus,
  PollSubmission,
  SharePollRequest,
  SharePollResponse,
  SubmitPollRequest,
  SubmitPollResponse,
  UpdatePollRequest,
} from "@/types/schedulePolls";
import type { PageResponse } from "@/types/common";
import {
  POLL_MAX_PARTICIPANTS,
  buildPollColumns,
  cellsToRanges,
  getPollGridShape,
  rangesToCells,
  toOffsetIsoString,
} from "@/utils/schedulePoll";
import {
  buildPollHeatmap,
  computePollCandidates,
} from "@/utils/schedulePollResult";

// apis/schedulePolls.ts를 model 레이어에서 대체하는 인메모리 서버.
// 서버 API(API v3.4) 배포 전에도 조율 전 흐름(생성 → 등록 → 결과 → 공유 → 종료)을
// 끝까지 확인하기 위한 것으로, `npm run dev:mock`에서만 쓰인다. 새로고침하면 초기화된다.
// 상태 전이·오류 코드는 명세의 처리 순서 플로우차트를 그대로 따른다.

export class MockPollError extends Error {
  response: { status: number; data: { data: { code: PollErrorCode }; msg: string } };
  constructor(status: number, code: PollErrorCode, msg: string) {
    super(msg);
    this.response = { status, data: { data: { code }, msg } };
  }
}

interface MockParticipant {
  memberId: number;
  displayName: string;
  maskedStudentId: string;
  joinedAt: string;
  submittedAt: string;
  joinSource: PollJoinSource;
  cells: boolean[];
  importedCourseOfferingIds: number[];
  submissionRevision: number;
}

interface MockPoll {
  pollId: number;
  linkToken: string;
  creator: { memberId: number; displayName: string };
  title: string;
  isRecurring: boolean;
  columns: PollColumn[];
  rangeStart: string;
  rangeEnd: string;
  durationMode: PollDurationMode;
  durationMin: number;
  deadlineAt: string | null;
  status: PollStatus;
  revision: number;
  closedAt: string | null;
  updatedAt: string;
  participants: MockParticipant[];
  results: PollResult[];
  /** `${kind}:${version}:${roomId}` → chatMessageId */
  shares: Map<string, number>;
  submissionResponses: Map<string, SubmitPollResponse>;
  /** `${memberId}:${version}` → customScheduleId */
  timetableAdds: Map<string, number>;
}

const OTHER_MEMBERS = [
  { memberId: 101, displayName: "이지원", maskedStudentId: "2024***01" },
  { memberId: 205, displayName: "박민서", maskedStudentId: "2023***17" },
  { memberId: 318, displayName: "최유리", maskedStudentId: "2022***08" },
];

/** 친구 → 1:1 채팅방 get-or-create 흉내 */
const personalRoomByFriend = new Map<number, number>();

let pollIdCounter = 900;
let chatMessageIdCounter = 9000;
let chatRoomIdCounter = 700;
let customScheduleIdCounter = 7700;

const polls = new Map<number, MockPoll>();

const now = () => toOffsetIsoString(new Date());

const getMe = () => {
  const { userInfo } = useUserStore.getState();
  const studentId = userInfo.studentId || "202401001";
  return {
    memberId: userInfo.id || 1,
    displayName: userInfo.nickname || "나",
    maskedStudentId: `${studentId.slice(0, 4)}***${studentId.slice(-2)}`,
  };
};

const shapeOf = (poll: MockPoll) => getPollGridShape(poll);

const createToken = () =>
  Array.from(
    { length: 24 },
    () =>
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"[
        Math.floor(Math.random() * 64)
      ],
  ).join("");

const linkUrlOf = (poll: MockPoll) =>
  `${window.location.origin}/schedule-polls/join/${poll.linkToken}`;

const latestResult = (poll: MockPoll) =>
  poll.results.length ? poll.results[poll.results.length - 1] : null;

/** 마감 처리. 스케줄러와 요청 경로가 같이 쓰는 함수를 흉내 낸다(멱등). */
const closePoll = (poll: MockPoll) => {
  if (poll.status === "CLOSED") return;
  const result = latestResult(poll);
  if (result) result.isFinal = true;
  poll.status = "CLOSED";
  poll.closedAt = now();
  poll.updatedAt = poll.closedAt;
  poll.revision += 1;
};

/** 마감이 지났으면 스케줄러를 기다리지 않고 그 요청 안에서 먼저 마감 처리한다. */
const processDeadline = (poll: MockPoll) => {
  if (
    poll.status !== "CLOSED" &&
    poll.deadlineAt &&
    new Date(poll.deadlineAt).getTime() <= Date.now()
  ) {
    closePoll(poll);
  }
};

const getPoll = (pollId: number) => {
  const poll = polls.get(Number(pollId));
  if (!poll) {
    throw new MockPollError(404, "POLL_NOT_FOUND", "찾을 수 없는 시간 맞추기예요");
  }
  processDeadline(poll);
  return poll;
};

const assertOpen = (poll: MockPoll) => {
  if (poll.status === "CLOSED") {
    throw new MockPollError(409, "POLL_CLOSED", "종료된 시간 맞추기예요");
  }
};

const recalculate = (poll: MockPoll) => {
  if (poll.participants.length < 2) {
    poll.status = "COLLECTING";
    return null;
  }
  const shape = shapeOf(poll);
  const heatmap = buildPollHeatmap(
    shape,
    poll.participants.map((p) => p.cells),
  );
  poll.results.forEach((result) => {
    result.state = "STALE";
  });
  const result: PollResult = {
    version: poll.results.length + 1,
    state: "LATEST",
    isFinal: false,
    basedOnSubmittedAt: now(),
    durationMode: poll.durationMode,
    durationMin: poll.durationMin,
    participants: poll.participants.map((p, index) => ({
      index,
      memberId: p.memberId,
      displayName: p.displayName,
    })),
    columns: poll.columns,
    rowStart: poll.rangeStart,
    rowCount: shape.rowCount,
    heatmap,
    candidates: computePollCandidates({
      shape,
      heatmap,
      participantCount: poll.participants.length,
      durationMode: poll.durationMode,
      durationMin: poll.durationMin,
    }),
  };
  poll.results.push(result);
  poll.status = "RESULT_READY";
  return result;
};

const upsertParticipant = (
  poll: MockPoll,
  member: { memberId: number; displayName: string; maskedStudentId: string },
  available: PollSlotRange[],
  importedCourseOfferingIds: number[],
  joinSource: PollJoinSource,
) => {
  const cells = rangesToCells(shapeOf(poll), available);
  const existing = poll.participants.find((p) => p.memberId === member.memberId);
  const submittedAt = now();
  if (existing) {
    existing.cells = cells;
    existing.importedCourseOfferingIds = importedCourseOfferingIds;
    existing.submittedAt = submittedAt;
    existing.submissionRevision += 1;
  } else {
    poll.participants.push({
      ...member,
      joinedAt: submittedAt,
      submittedAt,
      joinSource,
      cells,
      importedCourseOfferingIds,
      submissionRevision: 1,
    });
  }
  const result = recalculate(poll);
  poll.revision += 1;
  poll.updatedAt = submittedAt;
  return { isFirst: !existing, result };
};

const validateSlots = (poll: MockPoll, available: PollSlotRange[]) => {
  const keys = new Set(poll.columns.map((c) => c.key));
  const valid = available.every(
    (range) =>
      keys.has(range.key) &&
      /^\d{2}:(00|30)$/.test(range.start) &&
      /^\d{2}:(00|30)$/.test(range.end) &&
      poll.rangeStart <= range.start &&
      range.start < range.end &&
      range.end <= poll.rangeEnd,
  );
  if (!valid) {
    throw new MockPollError(400, "INVALID_SLOT", "입력한 시간을 다시 확인해 주세요");
  }
};

const seedPoll = (input: {
  pollId: number;
  linkToken: string;
  creator: { memberId: number; displayName: string };
  title: string;
  request: Pick<
    CreatePollRequest,
    "isRecurring" | "days" | "startDate" | "endDate" | "rangeStart" | "rangeEnd" | "durationMode" | "durationMin" | "deadlineAt"
  >;
}): MockPoll => {
  const poll: MockPoll = {
    pollId: input.pollId,
    linkToken: input.linkToken,
    creator: input.creator,
    title: input.title,
    isRecurring: input.request.isRecurring,
    columns: buildPollColumns(input.request),
    rangeStart: input.request.rangeStart,
    rangeEnd: input.request.rangeEnd,
    durationMode: input.request.durationMode,
    durationMin: input.request.durationMin,
    deadlineAt: input.request.deadlineAt,
    status: "COLLECTING",
    revision: 1,
    closedAt: null,
    updatedAt: now(),
    participants: [],
    results: [],
    shares: new Map(),
    submissionResponses: new Map(),
    timetableAdds: new Map(),
  };
  polls.set(poll.pollId, poll);
  return poll;
};

// 링크 참여 흐름 확인용: 다른 사람이 만든, 이미 2명이 등록한 조율.
// /schedule-polls/join/mockPollToken0000000001 로 들어가 볼 수 있다.
const seeded = seedPoll({
  pollId: 812,
  linkToken: "mockPollToken0000000001",
  creator: OTHER_MEMBERS[0],
  title: "캡스톤 회의 시간 맞추기",
  request: {
    isRecurring: true,
    days: ["MON", "TUE", "WED", "THU", "FRI"],
    startDate: null,
    endDate: null,
    rangeStart: "09:00",
    rangeEnd: "18:00",
    durationMode: "FIXED",
    durationMin: 60,
    deadlineAt: null,
  },
});
upsertParticipant(
  seeded,
  OTHER_MEMBERS[0],
  [
    { key: "MON", start: "10:00", end: "13:00" },
    { key: "WED", start: "10:00", end: "16:00" },
    { key: "THU", start: "14:00", end: "17:00" },
    { key: "FRI", start: "09:00", end: "12:00" },
  ],
  [],
  "CHAT_CARD",
);
upsertParticipant(
  seeded,
  OTHER_MEMBERS[1],
  [
    { key: "MON", start: "11:00", end: "15:00" },
    { key: "WED", start: "10:00", end: "12:00" },
    { key: "THU", start: "14:00", end: "18:00" },
  ],
  [],
  "LINK",
);

/**
 * 내가 혼자 등록한 조율에 잠시 뒤 다른 참여자가 들어오는 상황을 흉내 낸다.
 * 리비전 폴링과 '결과가 나왔어요' 알림을 서버 없이 확인하기 위한 것이다.
 */
const scheduleSimulatedJoin = (poll: MockPoll) => {
  window.setTimeout(() => {
    if (poll.status === "CLOSED" || poll.participants.length !== 1) return;
    const shape = shapeOf(poll);
    // 범위의 앞 2/3를 가능으로 둔다(어느 조건에서도 겹치는 시간이 생기게).
    const rowEnd = Math.max(1, Math.ceil((shape.rowCount * 2) / 3));
    const cells = shape.columns.flatMap(() =>
      Array.from({ length: shape.rowCount }, (_unused, row) => row < rowEnd),
    );
    upsertParticipant(
      poll,
      OTHER_MEMBERS[1],
      cellsToRanges(shape, cells),
      [],
      "LINK",
    );
  }, 8000);
};

// ---- API 대응 함수 ----

export const mockCreatePoll = (request: CreatePollRequest): CreatePollResponse => {
  const me = getMe();
  const columns = buildPollColumns(request);
  if (columns.length === 0) {
    throw new MockPollError(400, "INVALID_RANGE", "요일이나 기간을 확인해 주세요");
  }
  if (
    request.deadlineAt &&
    new Date(request.deadlineAt).getTime() <= Date.now()
  ) {
    throw new MockPollError(400, "INVALID_RANGE", "마감은 지금보다 뒤여야 해요");
  }
  const poll = seedPoll({
    pollId: (pollIdCounter += 1),
    linkToken: createToken(),
    creator: me,
    title: request.title?.trim() || "회의 시간 맞추기",
    request,
  });
  return {
    pollId: poll.pollId,
    linkToken: poll.linkToken,
    linkUrl: linkUrlOf(poll),
    revision: poll.revision,
  };
};

export const mockGetPoll = (pollId: number): PollDetail => {
  const poll = getPoll(pollId);
  const me = getMe();
  return {
    pollId: poll.pollId,
    title: poll.title,
    status: poll.status,
    isRecurring: poll.isRecurring,
    columns: poll.columns,
    rangeStart: poll.rangeStart,
    rangeEnd: poll.rangeEnd,
    durationMode: poll.durationMode,
    durationMin: poll.durationMin,
    deadlineAt: poll.deadlineAt,
    creator: poll.creator,
    isHost: poll.creator.memberId === me.memberId,
    myStatus: poll.participants.some((p) => p.memberId === me.memberId)
      ? "SUBMITTED"
      : null,
    participantCount: poll.participants.length,
    maxParticipants: POLL_MAX_PARTICIPANTS,
    linkUrl: linkUrlOf(poll),
    revision: poll.revision,
    resultVersion: latestResult(poll)?.version ?? null,
    closedAt: poll.closedAt,
  };
};

export const mockGetPollRevision = (pollId: number): PollRevision => {
  const detail = mockGetPoll(pollId);
  return {
    revision: detail.revision,
    status: detail.status,
    resultVersion: detail.resultVersion,
    participantCount: detail.participantCount,
    myStatus: detail.myStatus,
    deadlineAt: detail.deadlineAt,
  };
};

export const mockGetPollJoinPreview = (
  token: string,
  isLoggedIn: boolean,
): PollJoinPreview => {
  const found = [...polls.values()].find((p) => p.linkToken === token);
  if (!found) {
    throw new MockPollError(404, "POLL_NOT_FOUND", "찾을 수 없는 시간 맞추기예요");
  }
  const poll = getPoll(found.pollId);
  const me = getMe();
  const isParticipant =
    isLoggedIn && poll.participants.some((p) => p.memberId === me.memberId);
  const blockReason =
    poll.status === "CLOSED"
      ? "CLOSED"
      : isLoggedIn &&
          !isParticipant &&
          poll.participants.length >= POLL_MAX_PARTICIPANTS
        ? "FULL"
        : null;
  return {
    pollId: poll.pollId,
    title: poll.title,
    creatorDisplayName: poll.creator.displayName,
    status: poll.status,
    participantCount: poll.participants.length,
    maxParticipants: POLL_MAX_PARTICIPANTS,
    deadlineAt: poll.deadlineAt,
    canEnter: blockReason === null,
    blockReason,
    myStatus: isParticipant ? "SUBMITTED" : null,
  };
};

export const mockGetMySubmission = (pollId: number): PollSubmission => {
  const poll = getPoll(pollId);
  const mine = poll.participants.find((p) => p.memberId === getMe().memberId);
  if (!mine) {
    throw new MockPollError(404, "SUBMISSION_NOT_FOUND", "등록한 일정이 없어요");
  }
  return {
    status: "SUBMITTED",
    submissionRevision: mine.submissionRevision,
    available: cellsToRanges(shapeOf(poll), mine.cells),
    importedCourseOfferingIds: mine.importedCourseOfferingIds,
    submittedAt: mine.submittedAt,
  };
};

export const mockSubmitPoll = (
  pollId: number,
  request: SubmitPollRequest,
): SubmitPollResponse => {
  const poll = getPoll(pollId);

  // 같은 등록이 재전송되면 첫 응답을 그대로 돌려준다(멱등).
  const processed = poll.submissionResponses.get(request.clientSubmissionId);
  if (processed) return processed;

  assertOpen(poll);
  const me = getMe();
  const mine = poll.participants.find((p) => p.memberId === me.memberId);
  if (!mine && poll.participants.length >= POLL_MAX_PARTICIPANTS) {
    throw new MockPollError(409, "POLL_FULL", "인원이 가득 찼어요");
  }
  if (mine && request.baseSubmissionRevision !== mine.submissionRevision) {
    throw new MockPollError(
      409,
      "SUBMISSION_CONFLICT",
      "다른 기기에서 수정된 내용이 있어요",
    );
  }
  validateSlots(poll, request.available);

  const { isFirst, result } = upsertParticipant(
    poll,
    me,
    request.available,
    request.importedCourseOfferingIds ?? [],
    request.joinSource ?? "LINK",
  );
  const response: SubmitPollResponse = {
    myStatus: "SUBMITTED",
    isFirstSubmission: isFirst,
    submissionRevision: poll.participants.find(
      (p) => p.memberId === me.memberId,
    )!.submissionRevision,
    status: poll.status,
    participantCount: poll.participants.length,
    resultVersion: result?.version ?? null,
    revision: poll.revision,
  };
  poll.submissionResponses.set(request.clientSubmissionId, response);

  if (poll.participants.length === 1) scheduleSimulatedJoin(poll);
  return response;
};

export const mockGetPollParticipants = (pollId: number): PollParticipants => {
  const poll = getPoll(pollId);
  return {
    participantCount: poll.participants.length,
    maxParticipants: POLL_MAX_PARTICIPANTS,
    participants: poll.participants.map((p) => ({
      memberId: p.memberId,
      displayName: p.displayName,
      maskedStudentId: p.maskedStudentId,
      isHost: p.memberId === poll.creator.memberId,
      joinedAt: p.joinedAt,
      submittedAt: p.submittedAt,
    })),
  };
};

const assertParticipant = (poll: MockPoll) => {
  if (!poll.participants.some((p) => p.memberId === getMe().memberId)) {
    throw new MockPollError(
      403,
      "NOT_PARTICIPANT",
      "일정을 등록하면 결과를 볼 수 있어요",
    );
  }
};

export const mockGetPollResult = (
  pollId: number,
  version: number | "latest",
): PollResult => {
  const poll = getPoll(pollId);
  assertParticipant(poll);
  const result =
    version === "latest"
      ? latestResult(poll)
      : poll.results.find((r) => r.version === version);
  if (!result) {
    throw new MockPollError(
      409,
      "RESULT_NOT_READY",
      "2명 이상 모이면 결과가 나와요",
    );
  }
  return { ...result };
};

export const mockSharePoll = (
  pollId: number,
  request: SharePollRequest,
): SharePollResponse => {
  const poll = getPoll(pollId);
  const me = getMe();
  const isParticipant = poll.participants.some((p) => p.memberId === me.memberId);
  const latest = latestResult(poll);

  if (request.kind === "INVITE") {
    assertOpen(poll);
    if (!isParticipant && poll.creator.memberId !== me.memberId) {
      throw new MockPollError(403, "NOT_PARTICIPANT", "참여자만 보낼 수 있어요");
    }
  } else {
    if (!isParticipant) {
      throw new MockPollError(403, "NOT_PARTICIPANT", "참여자만 보낼 수 있어요");
    }
    if (!latest) {
      throw new MockPollError(
        409,
        "RESULT_NOT_READY",
        "2명 이상 모이면 결과를 공유할 수 있어요",
      );
    }
    if (request.resultVersion !== latest.version) {
      throw new MockPollError(409, "RESULT_STALE", "결과가 새로 바뀌었어요");
    }
  }

  const targets = new Map<number, number | undefined>();
  request.chatRoomIds.forEach((roomId) => targets.set(roomId, undefined));
  request.friendMemberIds.forEach((friendMemberId) => {
    if (!personalRoomByFriend.has(friendMemberId)) {
      personalRoomByFriend.set(friendMemberId, (chatRoomIdCounter += 1));
    }
    const roomId = personalRoomByFriend.get(friendMemberId)!;
    if (!targets.has(roomId)) targets.set(roomId, friendMemberId);
  });
  if (targets.size > 10) {
    throw new MockPollError(
      400,
      "TOO_MANY_TARGETS",
      "한 번에 10곳까지 보낼 수 있어요",
    );
  }

  const version = request.kind === "RESULT" ? request.resultVersion : 0;
  return {
    results: [...targets.entries()].map(([chatRoomId, fromFriendMemberId]) => {
      const key = `${request.kind}:${version}:${chatRoomId}`;
      const existing = poll.shares.get(key);
      const chatMessageId = existing ?? (chatMessageIdCounter += 1);
      poll.shares.set(key, chatMessageId);
      return {
        chatRoomId,
        chatMessageId,
        created: existing === undefined,
        ...(fromFriendMemberId !== undefined ? { fromFriendMemberId } : {}),
      };
    }),
  };
};

export const mockUpdatePoll = (
  pollId: number,
  request: UpdatePollRequest,
): PollDetail => {
  const poll = getPoll(pollId);
  if (poll.creator.memberId !== getMe().memberId) {
    throw new MockPollError(403, "NOT_HOST", "개설자만 할 수 있어요");
  }
  assertOpen(poll);

  if ("close" in request) {
    closePoll(poll);
    return mockGetPoll(pollId);
  }
  if (
    request.deadlineAt !== null &&
    new Date(request.deadlineAt).getTime() <= Date.now()
  ) {
    throw new MockPollError(400, "INVALID_RANGE", "마감은 지금보다 뒤여야 해요");
  }
  poll.deadlineAt = request.deadlineAt;
  poll.revision += 1;
  poll.updatedAt = now();
  return mockGetPoll(pollId);
};

export const mockAddPollToTimetable = (
  pollId: number,
  version: number,
): AddToTimetableResponse => {
  const poll = getPoll(pollId);
  assertParticipant(poll);
  const result = poll.results.find((r) => r.version === version);
  if (!result || (result.state !== "LATEST" && !result.isFinal)) {
    throw new MockPollError(409, "RESULT_STALE", "결과가 새로 바뀌었어요");
  }
  const key = `${getMe().memberId}:${version}`;
  const existing = poll.timetableAdds.get(key);
  if (existing !== undefined) {
    return { customScheduleId: existing, alreadyAdded: true };
  }
  if (!poll.isRecurring) {
    throw new MockPollError(
      409,
      "ONE_TIME_NOT_SUPPORTED",
      "일회성 약속은 아직 시간표에 추가할 수 없어요",
    );
  }
  const customScheduleId = (customScheduleIdCounter += 1);
  poll.timetableAdds.set(key, customScheduleId);
  return { customScheduleId, alreadyAdded: false };
};

export const mockGetMyPolls = (
  filter: MyPollFilter,
): PageResponse<MyPollListItem> => {
  const me = getMe();
  const content = [...polls.values()]
    .map((poll) => getPoll(poll.pollId))
    .filter(
      (poll) =>
        poll.creator.memberId === me.memberId ||
        poll.participants.some((p) => p.memberId === me.memberId),
    )
    .filter((poll) => (poll.status === "CLOSED") === (filter === "CLOSED"))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map<MyPollListItem>((poll) => ({
      pollId: poll.pollId,
      title: poll.title,
      status: poll.status,
      isHost: poll.creator.memberId === me.memberId,
      myStatus: poll.participants.some((p) => p.memberId === me.memberId)
        ? "SUBMITTED"
        : null,
      participantCount: poll.participants.length,
      deadlineAt: poll.deadlineAt,
      updatedAt: poll.updatedAt,
    }));
  return {
    content,
    totalElements: content.length,
    totalPages: 1,
    size: 20,
    number: 0,
    numberOfElements: content.length,
    first: true,
    last: true,
    empty: content.length === 0,
  };
};
