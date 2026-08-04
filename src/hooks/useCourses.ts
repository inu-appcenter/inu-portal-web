import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCourses } from "@/apis/courses";
import { useCourseStore } from "@/stores/useCourseStore";

export const COURSES_QUERY_KEY = ["courses"] as const;

export const useCourses = (
  department?: string,
  options?: { enabled?: boolean },
) => {
  const setCourses = useCourseStore((state) => state.setCourses);
  const enabled = options?.enabled ?? true;

  const query = useQuery({
    queryKey: [...COURSES_QUERY_KEY, department ?? "all"],
    queryFn: () => getCourses(department),
    enabled,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  // 서버에서 받아온 강의 목록을 zustand 상태와 동기화
  useEffect(() => {
    if (query.data) {
      setCourses(query.data);
    }
  }, [query.data, setCourses]);

  const courses = query.data ?? [];

  return {
    ...query,
    courses,
  };
};
