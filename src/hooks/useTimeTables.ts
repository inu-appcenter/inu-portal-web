import { useEffect } from "react";
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
import { useTimetableStore } from "@/stores/useTimetableStore";
import { mapDetailItemsToClassItems } from "@/utils/timetable";
import type {
  Term,
  TimeTableCourseItemRequest,
  TimeTableCustomItemRequest,
  TimeTableVisibility,
} from "@/types/timetables";

export const TIMETABLES_QUERY_KEY = ["timetables"] as const;

/**
 * year/term 없이 조회하는 모든 소비자(root의 MobileTimeTablePage 등, 현재
 * useTimeTables() 호출부 전부)가 공유하는 정확한 쿼리 키.
 */
const ALL_TIMETABLES_QUERY_KEY = [...TIMETABLES_QUERY_KEY, "all", "all"] as const;

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
const syncTimeTablesList = (queryClient: QueryClient) =>
  queryClient.fetchQuery({
    queryKey: ALL_TIMETABLES_QUERY_KEY,
    queryFn: () => getTimeTables(),
  });

export const useTimeTables = (
  year?: number,
  term?: Term,
  options?: { enabled?: boolean },
) => {
  const setTimetables = useTimetableStore((state) => state.setTimetables);
  const enabled = options?.enabled ?? true;

  const query = useQuery({
    queryKey: [...TIMETABLES_QUERY_KEY, year ?? "all", term ?? "all"],
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
  const updateTimetableEvents = useTimetableStore(
    (state) => state.updateTimetableEvents,
  );
  const enabled = options?.enabled ?? true;

  const query = useQuery({
    queryKey: [...TIMETABLES_QUERY_KEY, "detail", timeTableId],
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
    onSuccess: (_data, { timeTableId }) => {
      queryClient.invalidateQueries({
        queryKey: [...TIMETABLES_QUERY_KEY, "detail", timeTableId],
      });
    },
  });
};

export const useSemesterTimeTables = (semesterId?: number) => {
  const query = useQuery({
    queryKey: [...TIMETABLES_QUERY_KEY, "semester", semesterId],
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
