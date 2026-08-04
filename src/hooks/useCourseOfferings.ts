import { useInfiniteQuery } from "@tanstack/react-query";
import { getCourseOfferingsPage } from "@/apis/courseOfferings";
import type { Term } from "@/types/timetables";
import type { CourseOfferingFilters } from "@/types/courseOfferings";
import { useMemo } from "react";

export const COURSE_OFFERINGS_QUERY_KEY = ["courseOfferings"] as const;

export const useCourseOfferings = (
  year?: number,
  term?: Term,
  filters?: CourseOfferingFilters,
) => {
  const query = useInfiniteQuery({
    queryKey: [
      ...COURSE_OFFERINGS_QUERY_KEY,
      year ?? "none",
      term ?? "none",
      filters?.deptName ?? "",
      filters?.collegeName ?? "",
      filters?.hyNames?.join(",") ?? "",
      filters?.isuNames?.join(",") ?? "",
      filters?.isuFldNames?.join(",") ?? "",
      filters?.ssupTypeNames?.join(",") ?? "",
      filters?.credits?.join(",") ?? "",
      filters?.keyword ?? "",
      filters?.meetingFilterMode ?? "",
      filters?.meetings?.join(",") ?? "",
    ],
    queryFn: ({ pageParam = 0 }) =>
      getCourseOfferingsPage(year!, term!, pageParam as number, 50, filters),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage.last || lastPage.page >= lastPage.totalPages - 1) {
        return undefined;
      }
      return lastPage.page + 1;
    },
    enabled: year !== undefined && term !== undefined,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  const courseOfferings = useMemo(
    () => query.data?.pages.flatMap((page) => page.content ?? []) ?? [],
    [query.data],
  );

  return {
    ...query,
    courseOfferings,
  };
};

