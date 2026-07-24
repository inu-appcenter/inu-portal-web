import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTimeTables } from "@/apis/timetables";
import { useTimetableStore } from "@/stores/useTimetableStore";
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
