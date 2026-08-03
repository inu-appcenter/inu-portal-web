import { useQuery } from "@tanstack/react-query";
import { getAllCourseOfferings } from "@/apis/courseOfferings";
import type { Term } from "@/types/timetables";
import type { CourseOfferingFilters } from "@/types/courseOfferings";

export const COURSE_OFFERINGS_QUERY_KEY = ["courseOfferings"] as const;

export const useCourseOfferings = (
  year?: number,
  term?: Term,
  filters?: CourseOfferingFilters,
) => {
  const query = useQuery({
    queryKey: [
      ...COURSE_OFFERINGS_QUERY_KEY,
      year ?? "none",
      term ?? "none",
      filters?.department ?? "all",
      filters?.grades?.join(",") ?? "",
      filters?.types?.join(",") ?? "",
      filters?.credits?.join(",") ?? "",
    ],
    queryFn: () => getAllCourseOfferings(year!, term!, filters),
    enabled: year !== undefined && term !== undefined,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  return {
    ...query,
    courseOfferings: query.data ?? [],
  };
};
