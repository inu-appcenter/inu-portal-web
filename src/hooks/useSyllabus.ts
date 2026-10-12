import { useQuery } from "@tanstack/react-query";
import { getSyllabus } from "@/apis/syllabus";

export const SYLLABUS_QUERY_KEY = ["syllabus"] as const;

export const useSyllabus = (
  courseOfferingId?: number,
  options?: { enabled?: boolean },
) => {
  const enabled = courseOfferingId !== undefined && (options?.enabled ?? true);

  const query = useQuery({
    queryKey: [...SYLLABUS_QUERY_KEY, courseOfferingId ?? "none"],
    queryFn: () => getSyllabus(courseOfferingId!),
    enabled,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  return {
    ...query,
    // data가 null이면 "강의계획서 없음"(404)이 정상적으로 확인된 상태
    syllabus: query.data ?? null,
  };
};
