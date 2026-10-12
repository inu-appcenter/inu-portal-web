import { useEffect, useRef } from "react";
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  addPollToTimetable,
  createPoll,
  getMyPollSubmission,
  getMyPolls,
  getPoll,
  getPollJoinPreview,
  getPollParticipants,
  getPollResult,
  getPollRevision,
  sharePoll,
  submitPoll,
  updatePoll,
} from "@/apis/schedulePolls";
import type {
  MyPollFilter,
  PollRevision,
  SharePollRequest,
  SubmitPollRequest,
  SubmitPollResponse,
  UpdatePollRequest,
} from "@/types/schedulePolls";
import { TIMETABLES_QUERY_KEY } from "@/hooks/useTimeTables";
import {
  getPollErrorCode,
  getPollErrorStatus,
} from "@/utils/schedulePollError";

// 시간 맞추기 쿼리. 명단·결과는 다른 사람의 행동으로 바뀌므로 서버 푸시 대신
// 리비전 폴링으로 맞춘다(PRD FR-110~118). 채팅 STOMP는 메시지 전용이라 쓰지 않는다.

export const pollKeys = {
  all: ["schedulePoll"] as const,
  detail: (pollId: number) => ["schedulePoll", pollId, "detail"] as const,
  revision: (pollId: number) => ["schedulePoll", pollId, "revision"] as const,
  participants: (pollId: number) =>
    ["schedulePoll", pollId, "participants"] as const,
  latestResult: (pollId: number) =>
    ["schedulePoll", pollId, "results", "latest"] as const,
  result: (pollId: number, version: number) =>
    ["schedulePoll", pollId, "results", version] as const,
  mySubmission: (pollId: number) =>
    ["schedulePoll", pollId, "mySubmission"] as const,
  joinPreview: (token: string) => ["schedulePoll", "join", token] as const,
  myList: (filter: MyPollFilter) => ["schedulePoll", "my", filter] as const,
};

/** 화면별 폴링 주기 (FR-111, FR-114) */
export const POLL_INTERVAL = {
  /** 참여 현황·결과 */
  STATUS: 5_000,
  /** 내 일정 입력 */
  INPUT: 15_000,
  /** 채팅 카드(보일 때만) */
  CHAT_CARD: 30_000,
} as const;

/** 리비전이 올랐을 때 다시 받아야 하는 상세 쿼리들. 버전 지정 결과는 불변이라 건드리지 않는다. */
const invalidatePollDetails = (queryClient: QueryClient, pollId: number) => {
  queryClient.invalidateQueries({ queryKey: pollKeys.detail(pollId) });
  queryClient.invalidateQueries({ queryKey: pollKeys.participants(pollId) });
  queryClient.invalidateQueries({ queryKey: pollKeys.latestResult(pollId) });
};

/**
 * 리비전 캐시에 단조 증가하는 값만 반영한다(FR-113).
 * 느린 응답이 늦게 도착해도 캐시보다 작거나 같으면 버리고 기존 값을 돌려준다.
 */
/** 오류가 난 뒤의 폴링 주기. 일시적인 실패에 서버를 몰아치지 않게 평소보다 늦춘다. */
const POLL_ERROR_INTERVAL = 30_000;

/** 다시 물어도 결과가 같은 거절(없는 조율·권한 없음 등)인지. 이때만 폴링을 멈춘다. */
const isPermanentPollError = (error: unknown) => {
  const status = getPollErrorStatus(error);
  return (
    status != null &&
    status >= 400 &&
    status < 500 &&
    status !== 408 &&
    status !== 429
  );
};

const applyRevision = (
  queryClient: QueryClient,
  pollId: number,
  next: PollRevision,
): PollRevision => {
  const key = pollKeys.revision(pollId);
  const cached = queryClient.getQueryData<PollRevision>(key);
  if (cached && next.revision <= cached.revision) return cached;
  queryClient.setQueryData(key, next);
  if (cached) invalidatePollDetails(queryClient, pollId);
  return next;
};

/** 409 등 오류를 처리한 뒤 리비전을 즉시 다시 받는다(FR-118). */
export const refetchPollRevision = (queryClient: QueryClient, pollId: number) =>
  queryClient.invalidateQueries({ queryKey: pollKeys.revision(pollId) });

// 내 요청으로 생긴 변경은 '○○님이 들어와…' 같은 변경 알림 대상이 아니다.
const ownRevisions = new Map<number, number>();
export const isOwnPollRevision = (pollId: number, revision: number) =>
  ownRevisions.get(pollId) === revision;

interface UsePollRevisionOptions {
  /** 폴링 주기(ms). 채팅 카드처럼 화면에 보일 때만 돌리려면 enabled로 끈다. */
  intervalMs: number;
  enabled?: boolean;
}

/**
 * 리비전 폴링 (FR-110~114).
 * - 같은 조율은 쿼리 키 하나를 공유하므로 카드가 여러 개여도 요청은 1회만 나간다.
 * - CLOSED면 폴링을 멈추고, 탭·WebView가 숨겨지면 쉬었다가 돌아올 때 즉시 한 번 받는다.
 * - 네트워크 오류·5xx는 주기를 늦춰 계속 묻는다. 포커스 이벤트가 없는 WebView에서는
 *   한 번 멈추면 다시 켜질 계기가 없기 때문이다.
 */
export const usePollRevision = (
  pollId: number | null | undefined,
  { intervalMs, enabled = true }: UsePollRevisionOptions,
) => {
  const queryClient = useQueryClient();
  const isActive = enabled && pollId != null;

  const query = useQuery({
    queryKey: pollKeys.revision(pollId ?? 0),
    queryFn: async () =>
      applyRevision(queryClient, pollId!, await getPollRevision(pollId!)),
    enabled: isActive,
    staleTime: 0,
    refetchInterval: (q) => {
      if (q.state.data?.status === "CLOSED") return false;
      if (q.state.status !== "error") return intervalMs;
      return isPermanentPollError(q.state.error)
        ? false
        : Math.max(intervalMs, POLL_ERROR_INTERVAL);
    },
    refetchIntervalInBackground: false,
    // 전역 기본값이 false라 조율 쿼리에만 명시적으로 켠다(FR-112).
    refetchOnWindowFocus: true,
    retry: false,
  });

  // visibilitychange는 react-query의 focusManager가 처리한다. bfcache 복원(pageshow)은
  // 포커스 이벤트 없이 화면이 되살아나는 경우가 있어 따로 받는다.
  const { refetch } = query;
  useEffect(() => {
    if (!isActive) return;
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) void refetch();
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [isActive, refetch]);

  return query;
};

export const usePollDetail = (
  pollId: number | null | undefined,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: pollKeys.detail(pollId ?? 0),
    queryFn: () => getPoll(pollId!),
    enabled: (options?.enabled ?? true) && pollId != null,
    staleTime: 30_000,
    retry: false,
  });

export const usePollParticipants = (pollId: number | null | undefined) =>
  useQuery({
    queryKey: pollKeys.participants(pollId ?? 0),
    queryFn: () => getPollParticipants(pollId!),
    enabled: pollId != null,
    staleTime: 30_000,
    retry: false,
  });

export const usePollLatestResult = (
  pollId: number | null | undefined,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: pollKeys.latestResult(pollId ?? 0),
    queryFn: () => getPollResult(pollId!, "latest"),
    enabled: (options?.enabled ?? true) && pollId != null,
    staleTime: 30_000,
    retry: false,
  });

/** 버전 지정 결과. 버전 단위로 불변이지만 state(LATEST/STALE)·isFinal은 바뀌므로 표시는 리비전으로 판단한다. */
export const usePollResultVersion = (
  pollId: number | null | undefined,
  version: number | null | undefined,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: pollKeys.result(pollId ?? 0, version ?? 0),
    queryFn: () => getPollResult(pollId!, version!),
    enabled: (options?.enabled ?? true) && pollId != null && version != null,
    staleTime: Infinity,
    retry: false,
  });

export const useMyPollSubmission = (
  pollId: number | null | undefined,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: pollKeys.mySubmission(pollId ?? 0),
    queryFn: () => getMyPollSubmission(pollId!),
    enabled: (options?.enabled ?? true) && pollId != null,
    // 입력 화면을 열 때마다 최신 등록본과 submissionRevision을 받아야 한다(FR-117).
    staleTime: 0,
    gcTime: 0,
    retry: false,
  });

export const usePollJoinPreview = (token: string, isLoggedIn: boolean) =>
  useQuery({
    // 로그인 여부에 따라 canEnter·myStatus가 달라지므로 키에 포함한다.
    queryKey: [...pollKeys.joinPreview(token), isLoggedIn],
    queryFn: () => getPollJoinPreview(token),
    enabled: Boolean(token),
    staleTime: 0,
    retry: false,
  });

export const useMyPolls = (filter: MyPollFilter, enabled = true) =>
  useQuery({
    queryKey: pollKeys.myList(filter),
    queryFn: () => getMyPolls(filter),
    enabled,
    staleTime: 10_000,
  });

export const useCreatePoll = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPoll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pollKeys.myList("ACTIVE") });
    },
  });
};

const revisionFromSubmit = (
  response: SubmitPollResponse,
  cached: PollRevision | undefined,
): PollRevision => ({
  revision: response.revision,
  status: response.status,
  resultVersion: response.resultVersion,
  participantCount: response.participantCount,
  myStatus: response.myStatus,
  deadlineAt: cached?.deadlineAt ?? null,
});

/**
 * 등록·재등록. 성공 응답을 받은 뒤에만 캐시를 바꾼다(낙관적 표시 금지, FR-116).
 * clientSubmissionId는 호출부가 시도마다 만들고 재시도에서는 같은 값을 넘긴다.
 */
export const useSubmitPoll = (pollId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: SubmitPollRequest) => submitPoll(pollId, request),
    onSuccess: (response) => {
      ownRevisions.set(pollId, response.revision);
      const cached = queryClient.getQueryData<PollRevision>(
        pollKeys.revision(pollId),
      );
      applyRevision(queryClient, pollId, revisionFromSubmit(response, cached));
      invalidatePollDetails(queryClient, pollId);
      queryClient.invalidateQueries({ queryKey: pollKeys.mySubmission(pollId) });
      queryClient.invalidateQueries({ queryKey: ["schedulePoll", "my"] });
    },
    onError: (error) => {
      if (getPollErrorCode(error)) void refetchPollRevision(queryClient, pollId);
    },
  });
};

export const useSharePoll = (pollId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: SharePollRequest) => sharePoll(pollId, request),
    onSuccess: () => {
      // 카드가 채팅 목록의 마지막 메시지로 올라오고, 친구에게 보냈다면 1:1 방이 새로 생긴다.
      queryClient.invalidateQueries({ queryKey: ["myChatRooms"] });
    },
    onError: (error) => {
      if (getPollErrorCode(error)) void refetchPollRevision(queryClient, pollId);
    },
  });
};

/** 마감 변경·해제·종료(개설자). */
export const useUpdatePoll = (pollId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UpdatePollRequest) => updatePoll(pollId, request),
    onSuccess: async () => {
      const next = await getPollRevision(pollId).catch(() => null);
      if (next) {
        ownRevisions.set(pollId, next.revision);
        applyRevision(queryClient, pollId, next);
      }
      invalidatePollDetails(queryClient, pollId);
      queryClient.invalidateQueries({ queryKey: ["schedulePoll", "my"] });
    },
    onError: (error) => {
      if (getPollErrorCode(error)) void refetchPollRevision(queryClient, pollId);
    },
  });
};

export const useAddPollToTimetable = (pollId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { version: number; candidateRank: number }) =>
      addPollToTimetable(pollId, input.version, input.candidateRank),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TIMETABLES_QUERY_KEY });
    },
    onError: (error) => {
      if (getPollErrorCode(error)) void refetchPollRevision(queryClient, pollId);
    },
  });
};

/** 폴링으로 감지한 상태 변화 (FR-115). */
export type PollChange =
  | { type: "RESULT_READY" }
  | { type: "JOINED"; displayName: string | null; hasResult: boolean }
  | { type: "CLOSED"; hasResult: boolean };

/**
 * 리비전이 바뀔 때 직전 값과 비교해 알릴 만한 변화를 콜백으로 넘긴다.
 * 화면에 처음 들어왔을 때의 값은 기준점일 뿐 알림 대상이 아니고, 내 요청으로 생긴 변경도 건너뛴다.
 */
export const usePollChangeNotice = (
  pollId: number,
  revision: PollRevision | undefined,
  onChange: (change: PollChange) => void,
) => {
  const queryClient = useQueryClient();
  const previousRef = useRef<PollRevision | null>(null);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!revision) return;
    const previous = previousRef.current;
    previousRef.current = revision;
    if (!previous || revision.revision <= previous.revision) return;
    if (isOwnPollRevision(pollId, revision.revision)) return;

    if (revision.status === "CLOSED" && previous.status !== "CLOSED") {
      onChangeRef.current({
        type: "CLOSED",
        hasResult: revision.resultVersion != null,
      });
      return;
    }
    if (previous.resultVersion == null && revision.resultVersion != null) {
      onChangeRef.current({ type: "RESULT_READY" });
      return;
    }
    if (revision.participantCount > previous.participantCount) {
      // 새로 들어온 사람의 이름은 참여자 목록을 다시 받아 확인한다(가장 늦게 참여한 사람).
      void queryClient
        .fetchQuery({
          queryKey: pollKeys.participants(pollId),
          queryFn: () => getPollParticipants(pollId),
          staleTime: 0,
        })
        .then((data) => {
          const newest = [...data.participants].sort((a, b) =>
            b.joinedAt.localeCompare(a.joinedAt),
          )[0];
          return newest?.displayName ?? null;
        })
        .catch(() => null)
        .then((displayName) =>
          onChangeRef.current({
            type: "JOINED",
            displayName,
            hasResult: revision.resultVersion != null,
          }),
        );
    }
  }, [pollId, revision, queryClient]);
};
