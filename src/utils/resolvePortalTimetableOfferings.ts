import { getOfferingCourseCode, searchCourseOfferings } from "../apis/courseOfferings";
import type { CourseOffering } from "../types/courseOfferings";
import type { Term } from "../types/timetables";
import type { TimetableCourseItem } from "./ssvParser";

export type PortalMatchStatus = "MATCHED_EXACT" | "MATCHED_FUZZY" | "UNMATCHED";

export interface ResolvedPortalTimetableItem {
  rawItem: TimetableCourseItem;
  offering: CourseOffering | null;
  matchStatus: PortalMatchStatus;
  isSelected: boolean;
  isAlreadyAdded: boolean;
}

/**
 * 포털 ERP에서 가져온 학생별 수강 시간표 항목들을 서버의 CourseOffering과 매칭합니다.
 */
export async function resolvePortalTimetableItems(
  items: TimetableCourseItem[],
  year: number,
  term: Term,
  existingOfferingIds: number[] = [],
  existingSubjectNumbers: string[] = [],
): Promise<ResolvedPortalTimetableItem[]> {
  const results: ResolvedPortalTimetableItem[] = [];

  for (const item of items) {
    let matchedOffering: CourseOffering | null = null;
    let matchStatus: PortalMatchStatus = "UNMATCHED";

    try {
      // 1. 전체 수강번호(subjectNumber, 10자리)로 1차 검색
      const candidateList = await searchCourseOfferings(year, term, item.courseCode);

      // 정확한 subjectNumber 일치
      matchedOffering =
        candidateList.find(
          (o) => o.subjectNumber?.toUpperCase() === item.courseCode.toUpperCase(),
        ) ?? null;

      if (matchedOffering) {
        matchStatus = "MATCHED_EXACT";
      } else {
        // 과목명으로 추가 검색
        const nameCandidates = item.courseName
          ? await searchCourseOfferings(year, term, item.courseName)
          : [];
        const allCandidates = [...candidateList, ...nameCandidates];

        // 2. 학수번호(haksuNo, 앞 7자리 등) + 교수명 또는 과목명 일치
        const haksuNo =
          item.courseCode.length > 3
            ? item.courseCode.slice(0, -3)
            : item.courseCode;

        matchedOffering =
          allCandidates.find((o) => {
            const code = getOfferingCourseCode(o);
            const isCodeMatch =
              Boolean(code) &&
              code?.toUpperCase() === haksuNo.toUpperCase();
            const isProfMatch =
              Boolean(item.professorName) &&
              Boolean(o.professor) &&
              (o.professor?.includes(item.professorName) ||
                item.professorName.includes(o.professor ?? ""));
            const isTitleMatch =
              Boolean(item.courseName) &&
              Boolean(o.courseTitle) &&
              (o.courseTitle?.includes(item.courseName) ||
                item.courseName.includes(o.courseTitle ?? ""));
            return (isCodeMatch && isProfMatch) || (isCodeMatch && isTitleMatch);
          }) ?? null;

        if (matchedOffering) {
          matchStatus = "MATCHED_FUZZY";
        } else {
          // 3. 과목명 정확 일치 + 교수명 일치 (코드 다른 분반/연계과목 등)
          matchedOffering =
            allCandidates.find((o) => {
              const cleanOfferingTitle = (o.courseTitle || "").replace(/\s+/g, "");
              const cleanItemTitle = (item.courseName || "").replace(/\s+/g, "");
              const isTitleExact =
                Boolean(cleanOfferingTitle) &&
                cleanOfferingTitle === cleanItemTitle;
              const isProfMatch =
                !item.professorName ||
                !o.professor ||
                o.professor.includes(item.professorName) ||
                item.professorName.includes(o.professor);
              return isTitleExact && isProfMatch;
            }) ?? null;

          if (matchedOffering) {
            matchStatus = "MATCHED_FUZZY";
          }
        }
      }
    } catch (e) {
      console.error("개설강의 매칭 중 오류 발생:", item.courseName, e);
    }

    const isAlreadyAdded = Boolean(
      matchedOffering &&
        (existingOfferingIds.includes(matchedOffering.id) ||
          (matchedOffering.subjectNumber &&
            existingSubjectNumbers.includes(matchedOffering.subjectNumber))),
    );

    results.push({
      rawItem: item,
      offering: matchedOffering,
      matchStatus,
      isSelected: Boolean(matchedOffering && !isAlreadyAdded),
      isAlreadyAdded,
    });
  }

  return results;
}
