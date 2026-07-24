import { useQuery } from "@tanstack/react-query";
import { getSemesters } from "@/apis/semesters";
import { sortSemestersDesc } from "@/utils/semester";

export const SEMESTERS_QUERY_KEY = ["semesters"] as const;

export const useSemesters = () => {
  const query = useQuery({
    queryKey: SEMESTERS_QUERY_KEY,
    queryFn: getSemesters,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  });

  // 최신 학기가 먼저 오도록 정렬
  const semesters = sortSemestersDesc(query.data ?? []);

  return {
    ...query,
    semesters,
  };
};
