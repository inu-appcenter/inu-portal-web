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
  options?: { enabled?: boolean },
) => {
  const queryKey = [
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
  ];

  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam = 0 }) =>
      getCourseOfferingsPage(year!, term!, pageParam as number, 50, filters),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (!lastPage) return undefined;
      const currentPage =
        typeof lastPage.number === "number"
          ? lastPage.number
          : (lastPageParam as number) ?? 0;
      const totalPages = lastPage.totalPages ?? 1;

      if (
        lastPage.last ||
        currentPage >= totalPages - 1 ||
        !lastPage.content ||
        lastPage.content.length === 0
      ) {
        return undefined;
      }
      return currentPage + 1;
    },
    enabled:
      year !== undefined && term !== undefined && (options?.enabled ?? true),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  const courseOfferings = useMemo(
    () => query.data?.pages.flatMap((page) => page?.content ?? []) ?? [],
    [query.data],
  );

  return {
    ...query,
    courseOfferings,
  };
};

