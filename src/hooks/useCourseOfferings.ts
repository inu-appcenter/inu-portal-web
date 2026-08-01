import { useQuery } from "@tanstack/react-query";
import { getAllCourseOfferings } from "@/apis/courseOfferings";
import type { Term } from "@/types/timetables";

export const COURSE_OFFERINGS_QUERY_KEY = ["courseOfferings"] as const;

export const useCourseOfferings = (year?: number, term?: Term) => {
  const query = useQuery({
    queryKey: [...COURSE_OFFERINGS_QUERY_KEY, year ?? "none", term ?? "none"],
    queryFn: () => getAllCourseOfferings(year!, term!),
    enabled: year !== undefined && term !== undefined,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  return {
    ...query,
    courseOfferings: query.data ?? [],
  };
};
