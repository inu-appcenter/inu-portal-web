import { describe, expect, it } from "vitest";
import { groupClassItemsByCourse } from "../timetable";
import type { ClassItem } from "@/components/mobile/timetable/TimetableGrid";

const meeting = (
  overrides: Partial<ClassItem> & Pick<ClassItem, "id" | "name">,
): ClassItem => ({
  room: "",
  day: 0,
  startTime: 9,
  endTime: 10.5,
  ...overrides,
});

describe("groupClassItemsByCourse", () => {
  it("주 2회 강의를 하나로 묶는다", () => {
    // 시간표 상세는 모든 미팅에 같은 credits를 넣는다.
    const groups = groupClassItemsByCourse([
      meeting({ id: 1, itemId: 10, name: "자료구조", credits: 3, day: 0 }),
      meeting({ id: 2, itemId: 10, name: "자료구조", credits: 3, day: 2 }),
      meeting({ id: 3, itemId: 11, name: "운영체제", credits: 3, day: 1 }),
    ]);

    expect(groups).toHaveLength(2);
    expect(groups[0].name).toBe("자료구조");
    expect(groups[0].credits).toBe(3);
    expect(groups[0].totalHours).toBe(3);
  });

  it("첫 미팅에만 학점이 붙는 형식도 강의 학점을 잃지 않는다", () => {
    // 강의 검색·마법사 미리보기는 credits를 첫 미팅에만 넣는다.
    const groups = groupClassItemsByCourse([
      meeting({ id: 1, itemId: 10, name: "알고리즘", credits: 3 }),
      meeting({ id: 2, itemId: 10, name: "알고리즘", credits: 0, day: 2 }),
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0].credits).toBe(3);
  });

  it("itemId가 없으면 개설강의 id로, 그것도 없으면 과목명+교수로 묶는다", () => {
    const groups = groupClassItemsByCourse([
      meeting({ id: 1, courseOfferingId: 77, name: "영어회화" }),
      meeting({ id: 2, courseOfferingId: 77, name: "영어회화", day: 3 }),
      meeting({ id: 3, name: "미술사", professor: "홍길동" }),
      meeting({ id: 4, name: "미술사", professor: "홍길동", day: 4 }),
      meeting({ id: 5, name: "미술사", professor: "김철수" }),
    ]);

    expect(groups.map((group) => group.name)).toEqual([
      "영어회화",
      "미술사",
      "미술사",
    ]);
  });

  it("커스텀 일정은 구분해 둔다", () => {
    const groups = groupClassItemsByCourse([
      meeting({ id: 1, itemId: 10, name: "자료구조", credits: 3 }),
      meeting({ id: 2, itemId: 11, name: "알바", isCustom: true }),
    ]);

    expect(groups.find((group) => group.name === "알바")?.isCustom).toBe(true);
    expect(groups.find((group) => group.name === "알바")?.credits).toBeNull();
  });

  it("시간이 없는 요소는 시간 합에 넣지 않는다", () => {
    const groups = groupClassItemsByCourse([
      meeting({
        id: 1,
        itemId: 10,
        name: "현장실습",
        startTime: 0,
        endTime: 0,
        isUntimed: true,
      }),
    ]);

    expect(groups[0].totalHours).toBe(0);
  });
});
