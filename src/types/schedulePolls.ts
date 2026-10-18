// 시간 맞추기(일정 조율) API 타입. 명세: API v3.4 (`/api/schedule-polls`).

export type PollStatus = "COLLECTING" | "RESULT_READY" | "CLOSED";
export type PollMyStatus = "SUBMITTED" | null;
export type PollDurationMode = "FIXED" | "AT_LEAST";
export type PollDay = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";
export type PollJoinSource = "LINK" | "CHAT_CARD";
export type PollSubmitVia = "SUBMIT" | "ANYTIME";
export type PollShareKind = "INVITE" | "RESULT";
export type PollBlockReason = "CLOSED" | "FULL" | "BLOCKED";

/** 그리드 가로축. 정기 약속은 요일 enum, 일회성은 `YYYY-MM-DD`. */
export interface PollColumn {
  key: string;
  label: string;
}

/** [start, end) 구간. 시각은 `HH:mm`(30분 단위), 하루의 끝은 `24:00`. */
export interface PollSlotRange {
  key: string;
  start: string;
  end: string;
}

export interface CreatePollRequest {
  title?: string;
  isRecurring: boolean;
  days: PollDay[] | null;
  startDate: string | null;
  endDate: string | null;
  rangeStart: string;
  rangeEnd: string;
  durationMode: PollDurationMode;
  durationMin: number;
  deadlineAt: string | null;
  originChatRoomId?: number;
}

export interface CreatePollResponse {
  pollId: number;
  linkToken: string;
  linkUrl: string;
  revision: number;
}

export interface PollDetail {
  pollId: number;
  title: string;
  status: PollStatus;
  isRecurring: boolean;
  columns: PollColumn[];
  rangeStart: string;
  rangeEnd: string;
  durationMode: PollDurationMode;
  durationMin: number;
  deadlineAt: string | null;
  creator: { memberId: number; displayName: string };
  isHost: boolean;
  myStatus: PollMyStatus;
  participantCount: number;
  maxParticipants: number;
  linkUrl: string;
  revision: number;
  resultVersion: number | null;
  closedAt: string | null;
}

export interface PollRevision {
  revision: number;
  status: PollStatus;
  resultVersion: number | null;
  participantCount: number;
  myStatus: PollMyStatus;
  deadlineAt: string | null;
}

export interface PollJoinPreview {
  pollId: number;
  title: string;
  creatorDisplayName: string;
  status: PollStatus;
  participantCount: number;
  maxParticipants: number;
  deadlineAt: string | null;
  canEnter: boolean;
  blockReason: PollBlockReason | null;
  myStatus: PollMyStatus;
}

export interface PollSubmission {
  status: "SUBMITTED";
  submissionRevision: number;
  available: PollSlotRange[];
  importedCourseOfferingIds: number[];
  submittedAt: string;
}

export interface SubmitPollRequest {
  clientSubmissionId: string;
  baseSubmissionRevision: number | null;
  via: PollSubmitVia;
  available: PollSlotRange[];
  importedCourseOfferingIds?: number[];
  joinSource?: PollJoinSource;
}

export interface SubmitPollResponse {
  myStatus: "SUBMITTED";
  isFirstSubmission: boolean;
  submissionRevision: number;
  status: PollStatus;
  participantCount: number;
  resultVersion: number | null;
  revision: number;
}

export interface PollParticipant {
  memberId: number;
  displayName: string;
  maskedStudentId: string;
  isHost: boolean;
  joinedAt: string;
  submittedAt: string;
}

export interface PollParticipants {
  participantCount: number;
  maxParticipants: number;
  participants: PollParticipant[];
}

export interface PollResultParticipant {
  /** heatmap·availableMask의 비트 위치 */
  index: number;
  memberId: number;
  displayName: string;
}

export interface PollCandidate {
  rank: number;
  key: string;
  start: string;
  end: string;
  durationMin: number;
  availableMask: number;
  availableCount: number;
  allAvailable: boolean;
}

export interface PollResult {
  version: number;
  state: "LATEST" | "STALE";
  isFinal: boolean;
  basedOnSubmittedAt: string;
  durationMode: PollDurationMode;
  durationMin: number;
  participants: PollResultParticipant[];
  columns: PollColumn[];
  rowStart: string;
  rowCount: number;
  /** heatmap[c][r] = columns[c]의 (rowStart + 30분 × r) 칸에 가능한 참여자 비트마스크 */
  heatmap: number[][];
  candidates: PollCandidate[];
}

export interface SharePollRequest {
  kind: PollShareKind;
  resultVersion?: number;
  candidateRank?: number;
  chatRoomIds: number[];
  friendMemberIds: number[];
}

export interface SharePollResponse {
  results: {
    chatRoomId: number;
    chatMessageId: number | string;
    created: boolean;
    fromFriendMemberId?: number;
  }[];
}

export type UpdatePollRequest = { deadlineAt: string | null } | { close: true };

export interface AddToTimetableResponse {
  customScheduleId: number;
  alreadyAdded: boolean;
}

export interface MyPollListItem {
  pollId: number;
  title: string;
  status: PollStatus;
  isHost: boolean;
  myStatus: PollMyStatus;
  participantCount: number;
  deadlineAt: string | null;
  updatedAt: string;
}

export type MyPollFilter = "ACTIVE" | "CLOSED";

/** 채팅 카드 메시지의 extraData. 본문은 조회 API로 가져온다. */
export interface PollInviteExtraData {
  pollId: number;
}

export interface PollResultExtraData {
  pollId: number;
  resultVersion: number;
  candidateRank: number;
}

/** 서버가 `data.code`로 내려 주는 오류 코드. 클라이언트는 msg가 아니라 code로 분기한다. */
export type PollErrorCode =
  | "VALIDATION_ERROR"
  | "INVALID_RANGE"
  | "INVALID_SLOT"
  | "TOO_MANY_TARGETS"
  | "NOT_HOST"
  | "NOT_PARTICIPANT"
  | "BLOCKED"
  | "NOT_SHARE_TARGET"
  | "POLL_NOT_FOUND"
  | "SUBMISSION_NOT_FOUND"
  | "POLL_CLOSED"
  | "POLL_FULL"
  | "SUBMISSION_CONFLICT"
  | "RESULT_STALE"
  | "RESULT_NOT_READY"
  | "NO_PRIMARY_TIMETABLE"
  | "ONE_TIME_NOT_SUPPORTED"
  // 명세에는 없고 서버가 추가한 코드: 내 시간표에 추가할 때 기존 수업·일정과 겹침
  | "TIMETABLE_CONFLICT"
  | "INTERNAL_ERROR";
