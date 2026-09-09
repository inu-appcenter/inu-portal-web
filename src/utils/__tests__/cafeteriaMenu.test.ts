import { describe, expect, it } from "vitest";
import { firstMenuOf, parseCafeteriaSections } from "../cafeteriaMenu";

const 학생식당_중식 = `[1코너(백반)]
사골왕만두국(pork)
계란옷동그랑땡(pork)
쌀밥
6,500원 (구성원 5,500원)
1315kcal

[2코너(일품)]
장각삼계탕
깍두기
7,500원 (구성원 6,500원)
1229kcal

[국밥]
(pork)수육국밥 / 순대국밥 / 얼큰국밥
7,500(구성원 6,500원)
1153kcal 1210kcal 1233kcal`;

const 이호관_중식 = `[선택1] 냉열무국수
[선택2] 돈육장조림버터비빔밥(pork), 온육수

[공통]
새우까스*칠리S
쌀밥
8,000원(구성원 7,000원)
1,330/1,606kcal`;

const 이십칠호관_중식 = `[비빔밥·돈가스]
제육야채비빔밥 8,500원(구성원 7,500원)
주꾸미비빔밥 8,500원(구성원 7,500원)

[국밥]
순대국밥(다대기O) 7,500원(구성원 6,500원)`;

describe("parseCafeteriaSections", () => {
  it("코너 머리말로 나누고 가격·칼로리를 떼어낸다", () => {
    const sections = parseCafeteriaSections(학생식당_중식);

    expect(sections.map((section) => section.title)).toEqual([
      "1코너(백반)",
      "2코너(일품)",
      "국밥",
    ]);
    expect(sections[0]).toMatchObject({
      menu: "사골왕만두국(pork)\n계란옷동그랑땡(pork)\n쌀밥",
      price: "6,500원",
      calorie: "1315kcal",
    });
  });

  it("칼로리가 여러 개인 코너는 본문을 그대로 둔다", () => {
    const 국밥 = parseCafeteriaSections(학생식당_중식)[2];

    expect(국밥.price).toBeNull();
    expect(국밥.menu).toContain("1153kcal 1210kcal 1233kcal");
  });

  it("택1 메뉴는 코너로 쪼개지 않는다", () => {
    const sections = parseCafeteriaSections(이호관_중식);

    expect(sections).toHaveLength(1);
    expect(sections[0].title).toBeNull();
    expect(sections[0].menu).toContain("[선택1] 냉열무국수");
    expect(sections[0].calorie).toBeNull();
    expect(sections[0].menu).toContain("1,330/1,606kcal");
  });

  it("칼로리 없이 줄마다 가격이 붙는 상시 메뉴도 코너로 나눈다", () => {
    const sections = parseCafeteriaSections(이십칠호관_중식);

    expect(sections.map((section) => section.title)).toEqual([
      "비빔밥·돈가스",
      "국밥",
    ]);
    expect(sections[0].menu).toContain("제육야채비빔밥 8,500원(구성원 7,500원)");
    expect(sections[0].price).toBeNull();
  });

  it("머리말이 없으면 한 코너로 본다", () => {
    const sections = parseCafeteriaSections(
      "예거슈니첼돈까스(pork)\n계란파국\n6,500원 (구성원 5,500원)\n1184kcal",
    );

    expect(sections).toHaveLength(1);
    expect(sections[0]).toMatchObject({
      title: null,
      menu: "예거슈니첼돈까스(pork)\n계란파국",
      price: "6,500원",
      calorie: "1184kcal",
    });
  });

  it("휴무는 그대로 두고, 미운영과 빈 값은 코너가 없다", () => {
    expect(parseCafeteriaSections("오늘은 쉽니다")[0].menu).toBe("오늘은 쉽니다");
    expect(parseCafeteriaSections("-")).toEqual([]);
    expect(parseCafeteriaSections(null)).toEqual([]);
  });
});

describe("firstMenuOf", () => {
  it("코너의 대표 메뉴 한 개를 고른다", () => {
    const [백반, , 국밥] = parseCafeteriaSections(학생식당_중식);

    expect(firstMenuOf(백반)).toBe("사골왕만두국(pork)");
    expect(firstMenuOf(국밥)).toBe("(pork)수육국밥 / 순대국밥 / 얼큰국밥");
  });

  it("시간·행사 안내 줄은 대표 메뉴로 고르지 않는다", () => {
    const 조식 = parseCafeteriaSections(
      "<천원의아침밥>\n*08:00~09:30*\n순대제육볶음(pork)\n계란파국\n6,000원\n1264kcal",
    )[0];

    expect(firstMenuOf(조식)).toBe("순대제육볶음(pork)");
  });

  it("택1 메뉴는 선택 머리말을 떼고, 상시 메뉴는 가격을 뗀다", () => {
    expect(firstMenuOf(parseCafeteriaSections(이호관_중식)[0])).toBe("냉열무국수");
    expect(firstMenuOf(parseCafeteriaSections(이십칠호관_중식)[0])).toBe("제육야채비빔밥");
  });
});
