import { useEffect, useMemo } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import {
  createTimeTable,
  createTimeTableCourseItem,
  createTimeTableCustomItem,
  deleteTimeTable,
  deleteTimeTableItem,
  getTimeTables,
  getTimeTablesBySemester,
  getTimeTableDetail,
  updateTimeTableCustomItem,
  updateTimeTableName,
  updateTimeTablePrimary,
  updateTimeTableVisibility,
} from "@/apis/timetables";
import {
  getCurrentMemberId,
  TIMETABLES_QUERY_KEY,
  useTimetableStore,
} from "@/stores/useTimetableStore";
import useUserStore from "@/stores/useUserStore";
import { mapDetailItemsToClassItems } from "@/utils/timetable";
import type {
  Term,
  TimeTableCourseItemRequest,
  TimeTableCustomItemRequest,
  TimeTableVisibility,
} from "@/types/timetables";

export { TIMETABLES_QUERY_KEY };

export const getAllTimeTablesQueryKey = (memberId?: string | null) =>
  [...TIMETABLES_QUERY_KEY, memberId ?? "anonymous", "all", "all"] as const;

export const getTimeTableDetailQueryKey = (
  timeTableId: number,
  memberId?: string | null,
) =>
  [
    ...TIMETABLES_QUERY_KEY,
    "detail",
    timeTableId,
    memberId ?? "anonymous",
  ] as const;

/**
 * 목록에 영향을 주는 mutation 성공 시, 다른 웹뷰(RN 멀티 웹뷰 스택의 sibling
 * 컨텍스트 — 예: 시간표 마법사는 root와 별개의 QueryClient를 갖는 별도
 * WebView)로 변경을 전파하기 위한 강제 refetch.
 *
 * `queryClient.invalidateQueries`만으로는 부족하다 — invalidate는 "이미
 * 캐시에 존재하는" 쿼리만 대상으로 하는데, 이 mutation을 실행 중인 웹뷰(예:
 * 마법사)에는 root가 구독하는 이 정확한 키가 한 번도 fetch된 적이 없어 캐시에
 * 아예 없다. 그래서 명시적으로 fetchQuery를 호출해 이 웹뷰의 캐시에도 그
 * 키를 채워 넣어야, broadcastQueryClient(main.tsx에서 결선)가 그 성공 fetch를
 * root 등 다른 웹뷰로 미러링해줄 수 있다. 그 플러그인은 쿼리 fetch 성공
 * ("success")·추가·제거만 브로드캐스트하고 invalidate는 보내지 않는다.
 */
const syncTimeTablesList = (queryClient: QueryClient) => {
  const token = useUserStore.getState().tokenInfo.accessToken;
  const memberId = getCurrentMemberId(token);
  return queryClient.fetchQuery({
    queryKey: getAllTimeTablesQueryKey(memberId),
    queryFn: () => getTimeTables(),
  });
};

/**
 * 상세(시간표에 담긴 요소 목록)에 영향을 주는 mutation 성공 시의 강제 refetch.
 * `syncTimeTablesList`와 같은 이유이며, 대상만 상세 쿼리다.
 *
 * 특히 "일정 추가" 화면이 그렇다 — 이 화면은 별도 웹뷰로 열리는데 추가 모드에서는
 * 상세를 한 번도 조회하지 않아 캐시에 그 키 자체가 없다. 그래서 invalidate는 아무
 * 것도 refetch하지 않고, 미러링할 성공 fetch도 생기지 않아 편집 화면 웹뷰로 돌아가도
 * 방금 추가한 일정이 보이지 않는다.
 *
 * 반환한 Promise는 mutation이 호출부 onSuccess를 실행하기 전에 await한다(v5 동작).
 * 이 대기는 필수다 — 호출부가 곧바로 navigate(-1) → appBridge.goBack()으로 웹뷰를
 * 닫아버리면, 사라지는 웹뷰에서 fetch가 끊겨 브로드캐스트가 아예 출발하지 못한다.
 * 필터 화면에서 이미 같은 이유로 유실을 겪었다(08ce1716 참고).
 *
 * 저장 자체는 이미 성공했으므로, 이 동기화가 실패해도 에러로 번지게 두지 않는다.
 */
export const syncTimeTableDetail = (queryClient: QueryClient, timeTableId: number) => {
  const token = useUserStore.getState().tokenInfo.accessToken;
  const memberId = getCurrentMemberId(token);
  return queryClient
    .fetchQuery({
      queryKey: getTimeTableDetailQueryKey(timeTableId, memberId),
      queryFn: () => getTimeTableDetail(timeTableId),
    })
    .catch(() => undefined);
};

export const useTimeTables = (
  year?: number,
  term?: Term,
  options?: { enabled?: boolean },
) => {
  const token = useUserStore((state) => state.tokenInfo.accessToken);
  const memberId = useMemo(() => getCurrentMemberId(token), [token]);
  const setTimetables = useTimetableStore((state) => state.setTimetables);
  const enabled = options?.enabled ?? true;

  const queryKey = useMemo(
    () => [
      ...TIMETABLES_QUERY_KEY,
      memberId ?? "anonymous",
      year ?? "all",
      term ?? "all",
    ],
    [memberId, year, term],
  );

  const query = useQuery({
    queryKey,
    queryFn: () => getTimeTables(year, term),
    enabled,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  // 서버에서 받아온 시간표 목록을 zustand 상태와 동기화
  useEffect(() => {
    if (query.data) {
      setTimetables(query.data);
    }
  }, [query.data, setTimetables]);

  return {
    ...query,
    timeTables: query.data ?? [],
  };
};

export const useTimeTableDetail = (
  timeTableId?: number | null,
  options?: { enabled?: boolean },
) => {
  const token = useUserStore((state) => state.tokenInfo.accessToken);
  const memberId = useMemo(() => getCurrentMemberId(token), [token]);
  const updateTimetableEvents = useTimetableStore(
    (state) => state.updateTimetableEvents,
  );
  const enabled = options?.enabled ?? true;

  const queryKey = useMemo(
    () =>
      timeTableId != null
        ? getTimeTableDetailQueryKey(timeTableId, memberId)
        : [...TIMETABLES_QUERY_KEY, "detail", null, memberId ?? "anonymous"],
    [timeTableId, memberId],
  );

  const query = useQuery({
    queryKey,
    queryFn: () => getTimeTableDetail(timeTableId!),
    enabled: enabled && timeTableId != null,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  // 상세 응답의 시간표 요소를 그리드용 이벤트로 변환해 zustand 상태와 동기화
  useEffect(() => {
    if (query.data) {
      updateTimetableEvents(
        query.data.id,
        mapDetailItemsToClassItems(query.data.items),
      );
    }
  }, [query.data, updateTimetableEvents]);

  return {
    ...query,
    detail: query.data ?? null,
  };
};

export const useCreateTimeTable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      semesterId,
      timeTableName,
    }: {
      semesterId: number;
      timeTableName: string;
    }) => createTimeTable(semesterId, timeTableName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TIMETABLES_QUERY_KEY });
      void syncTimeTablesList(queryClient);
    },
  });
};

export const useUpdateTimeTableName = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      timeTableId,
      timeTableName,
    }: {
      timeTableId: number;
      timeTableName: string;
    }) => updateTimeTableName(timeTableId, timeTableName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TIMETABLES_QUERY_KEY });
      void syncTimeTablesList(queryClient);
    },
  });
};

export const useUpdateTimeTableVisibility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      timeTableId,
      visibility,
    }: {
      timeTableId: number;
      visibility: TimeTableVisibility;
    }) => updateTimeTableVisibility(timeTableId, visibility),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TIMETABLES_QUERY_KEY });
      void syncTimeTablesList(queryClient);
    },
  });
};

export const useUpdateTimeTablePrimary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (timeTableId: number) => updateTimeTablePrimary(timeTableId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TIMETABLES_QUERY_KEY });
      void syncTimeTablesList(queryClient);
    },
  });
};

export const useDeleteTimeTable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (timeTableId: number) => deleteTimeTable(timeTableId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TIMETABLES_QUERY_KEY });
      void syncTimeTablesList(queryClient);
    },
  });
};

export const useCreateTimeTableCourseItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      timeTableId,
      body,
    }: {
      timeTableId: number;
      body: TimeTableCourseItemRequest;
    }) => createTimeTableCourseItem(timeTableId, body),
    // 대부분의 호출부(편집 화면 강의 검색 시트)는 상세를 이미 구독 중이라 invalidate로
    // 충분하다. 마법사(WizardSaveFlow)와 이미지 인식 등록(MobileTimetableImageImportPage)은
    // 이 mutation을 강의 수만큼 순차 호출하므로, 여기에 syncTimeTableDetail을 붙이면
    // 강의 하나당 상세 조회가 한 번씩 더 붙는다 - 그래서 그 호출부들이 루프가 끝난 뒤
    // syncTimeTableDetail을 직접 한 번만 부른다(export된 이유). 상세를 구독하지 않는
    // 웹뷰(이미지 인식 등록)에서 그 호출을 빼먹으면 invalidate가 아무 것도 못 건드려
    // 저장은 서버에 성공해도 돌아간 화면에 반영되지 않는다 - 실제로 한 번 빠뜨렸던
    // 버그다.
    onSuccess: (_data, { timeTableId }) => {
      queryClient.invalidateQueries({
        queryKey: [...TIMETABLES_QUERY_KEY, "detail", timeTableId],
      });
    },
  });
};

export const useCreateTimeTableCustomItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      timeTableId,
      body,
    }: {
      timeTableId: number;
      body: TimeTableCustomItemRequest;
    }) => createTimeTableCustomItem(timeTableId, body),
    onSuccess: (_data, { timeTableId }) => {
      queryClient.invalidateQueries({
        queryKey: [...TIMETABLES_QUERY_KEY, "detail", timeTableId],
      });
      return syncTimeTableDetail(queryClient, timeTableId);
    },
  });
};

export const useUpdateTimeTableCustomItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      timeTableId,
      customScheduleId,
      body,
    }: {
      timeTableId: number;
      customScheduleId: number;
      body: TimeTableCustomItemRequest;
    }) => updateTimeTableCustomItem(timeTableId, customScheduleId, body),
    onSuccess: (_data, { timeTableId }) => {
      queryClient.invalidateQueries({
        queryKey: [...TIMETABLES_QUERY_KEY, "detail", timeTableId],
      });
      return syncTimeTableDetail(queryClient, timeTableId);
    },
  });
};

export const useDeleteTimeTableItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      timeTableId,
      timeTableItemId,
    }: {
      timeTableId: number;
      timeTableItemId: number;
    }) => deleteTimeTableItem(timeTableId, timeTableItemId),
    // 삭제도 상세를 구독 중인 화면에서만 일어난다. 마법사가 기존 요소를 비울 때
    // 이 mutation을 요소 수만큼 순차 호출하므로 위 강의 추가와 같은 이유로 제외한다.
    onSuccess: (_data, { timeTableId }) => {
      queryClient.invalidateQueries({
        queryKey: [...TIMETABLES_QUERY_KEY, "detail", timeTableId],
      });
    },
  });
};

export const useSemesterTimeTables = (semesterId?: number) => {
  const token = useUserStore((state) => state.tokenInfo.accessToken);
  const memberId = useMemo(() => getCurrentMemberId(token), [token]);

  const query = useQuery({
    queryKey: [
      ...TIMETABLES_QUERY_KEY,
      "semester",
      semesterId,
      memberId ?? "anonymous",
    ],
    queryFn: () => getTimeTablesBySemester(semesterId!),
    enabled: semesterId !== undefined,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  return {
    ...query,
    timeTables: query.data ?? [],
  };
};
