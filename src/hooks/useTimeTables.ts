import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTimeTable,
  getTimeTables,
  getTimeTablesBySemester,
  getTimeTableDetail,
} from "@/apis/timetables";
import { useTimetableStore } from "@/stores/useTimetableStore";
import { mapDetailItemsToClassItems } from "@/utils/timetable";
import type { Term } from "@/types/timetables";

export const TIMETABLES_QUERY_KEY = ["timetables"] as const;

export const useTimeTables = (year?: number, term?: Term) => {
  const setTimetables = useTimetableStore((state) => state.setTimetables);

  const query = useQuery({
    queryKey: [...TIMETABLES_QUERY_KEY, year ?? "all", term ?? "all"],
    queryFn: () => getTimeTables(year, term),
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

export const useTimeTableDetail = (timeTableId?: number | null) => {
  const updateTimetableEvents = useTimetableStore(
    (state) => state.updateTimetableEvents,
  );

  const query = useQuery({
    queryKey: [...TIMETABLES_QUERY_KEY, "detail", timeTableId],
    queryFn: () => getTimeTableDetail(timeTableId!),
    enabled: timeTableId != null,
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
