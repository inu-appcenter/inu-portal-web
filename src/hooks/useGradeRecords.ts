import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteAllGradeRecords,
  getAllGradeRecords,
  upsertGradeRecords,
} from "@/apis/grades";
import useUserStore from "@/stores/useUserStore";
import type { Term } from "@/types/timetables";
import type { GradeRecordSaveRequest } from "@/types/gradeRecords";

export const GRADE_RECORDS_QUERY_KEY = ["gradeRecords"] as const;

/**
 * 로그인한 사용자의 전체 성적을 서버에서 불러온다. 비로그인 상태에서는 요청하지 않는다.
 */
export const useAllGradeRecords = (options?: { enabled?: boolean }) => {
  const isLoggedIn = Boolean(useUserStore((state) => state.tokenInfo.accessToken));
  const enabled = (options?.enabled ?? true) && isLoggedIn;

  const query = useQuery({
    queryKey: GRADE_RECORDS_QUERY_KEY,
    queryFn: getAllGradeRecords,
    enabled,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 30,
  });

  return {
    ...query,
    gradeRecords: query.data ?? [],
  };
};

/**
 * 특정 년도/학기 성적을 통째로 저장(교체)한다.
 */
export const useUpsertGradeRecords = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: GradeRecordSaveRequest) => upsertGradeRecords(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GRADE_RECORDS_QUERY_KEY });
    },
  });
};

/**
 * 특정 년도/학기 성적을 전체 삭제한다.
 */
export const useDeleteAllGradeRecords = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ year, term }: { year: number; term: Term }) =>
      deleteAllGradeRecords(year, term),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GRADE_RECORDS_QUERY_KEY });
    },
  });
};
