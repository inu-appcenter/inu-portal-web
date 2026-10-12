import type { PollErrorCode } from "@/types/schedulePolls";

// 시간 맞추기 오류 응답은 `{ data: { code }, msg }` 형식이다(API v3.4 2-5).
// 서버가 기존 예외 형식을 유지하면 code가 최상위에 올 수 있어 둘 다 읽는다.
export const getPollErrorCode = (error: unknown): PollErrorCode | null => {
  const body = (
    error as {
      response?: { data?: { data?: { code?: unknown } | null; code?: unknown } };
    } | null
  )?.response?.data;
  const code = body?.data?.code ?? body?.code;
  return typeof code === "string" ? (code as PollErrorCode) : null;
};

export const getPollErrorStatus = (error: unknown): number | null =>
  (error as { response?: { status?: number } } | null)?.response?.status ?? null;

const POLL_ERROR_MESSAGES: Partial<Record<PollErrorCode, string>> = {
  POLL_CLOSED: "종료된 시간 맞추기예요",
  POLL_FULL: "인원이 가득 찼어요",
  SUBMISSION_CONFLICT: "다른 기기에서 수정된 내용이 있어요",
  RESULT_STALE: "결과가 새로 바뀌었어요",
  RESULT_NOT_READY: "2명 이상 모이면 결과를 공유할 수 있어요",
  NOT_HOST: "개설자만 할 수 있어요",
  NOT_PARTICIPANT: "일정을 등록하면 결과를 볼 수 있어요",
  BLOCKED: "이 시간 맞추기에 참여할 수 없어요",
  NOT_SHARE_TARGET: "보낼 수 없는 대상이 있어요. 목록을 새로 불러올게요",
  TOO_MANY_TARGETS: "한 번에 10곳까지 보낼 수 있어요",
  POLL_NOT_FOUND: "찾을 수 없는 시간 맞추기예요",
  NO_PRIMARY_TIMETABLE: "시간표를 먼저 만들어 주세요",
  ONE_TIME_NOT_SUPPORTED: "일회성 약속은 아직 시간표에 추가할 수 없어요",
  TIMETABLE_CONFLICT: "시간표에 겹치는 일정이 있어요",
  INVALID_RANGE: "시간 범위나 기간, 마감 설정을 다시 확인해 주세요",
  INVALID_SLOT: "입력한 시간을 다시 확인해 주세요",
};

export const getPollErrorMessage = (
  error: unknown,
  fallback = "잠시 후 다시 시도해 주세요",
): string => {
  const code = getPollErrorCode(error);
  return (code && POLL_ERROR_MESSAGES[code]) || fallback;
};
