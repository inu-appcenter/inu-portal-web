/**
 * 학식 API가 내려주는 메뉴 문자열을 코너 단위로 나눈다.
 *
 * 서버(생협 크롤러)는 한 끼니 값 안에 코너를 [1코너(백반)] 같은 머리말과 개행으로 구분해 담는다.
 * 2호관식당처럼 메인을 택1 하는 끼니는 [선택1]/[선택2]/[공통] 블록이라 나누지 않고 한 덩어리로 둔다.
 */
export interface CafeteriaSection {
  /** 코너 이름. 코너 구분이 없으면 null. */
  title: string | null;
  menu: string;
  price: string | null;
  calorie: string | null;
}

const NOT_OPERATED = "-";
const SECTION_TITLE = /^\[([^\]]+)\]$/;
const CHOICE_TITLE = /^(선택\d+|공통)$/;
const PRICE = /[0-9,]+원/;
const CALORIE = /[0-9,]+(?:\s*\/\s*[0-9,]+)*\s*kcal/i;
const CALORIES = /[0-9,]+(?:\s*\/\s*[0-9,]+)*\s*kcal/gi;

export const parseCafeteriaSections = (
  text: string | null | undefined,
): CafeteriaSection[] => {
  const trimmed = text?.trim();
  if (!trimmed || trimmed === NOT_OPERATED) {
    return [];
  }

  const lines = trimmed.split("\n").map((line) => line.trimEnd());
  const isChoiceMenu = lines.some((line) => {
    const title = line.trim().match(SECTION_TITLE)?.[1];
    return title !== undefined && CHOICE_TITLE.test(title);
  });
  if (isChoiceMenu) {
    return [toSection(null, lines)];
  }

  const sections: CafeteriaSection[] = [];
  let title: string | null = null;
  let body: string[] = [];
  for (const line of lines) {
    const nextTitle = line.trim().match(SECTION_TITLE)?.[1];
    if (nextTitle === undefined) {
      body.push(line);
      continue;
    }
    if (body.some((menu) => menu.trim().length > 0)) {
      sections.push(toSection(title, body));
    }
    title = nextTitle;
    body = [];
  }
  if (body.some((menu) => menu.trim().length > 0)) {
    sections.push(toSection(title, body));
  }
  return sections;
};

/** 코너 하나가 칼로리를 하나만 적었을 때만 가격/칼로리를 본문에서 떼어낸다. */
const toSection = (title: string | null, body: string[]): CafeteriaSection => {
  const lines = [...body];
  while (lines.length > 0 && lines[0].trim().length === 0) {
    lines.shift();
  }
  while (lines.length > 0 && lines[lines.length - 1].trim().length === 0) {
    lines.pop();
  }

  // 칼로리가 여러 개거나 "1,330/1,606kcal"처럼 선택별로 적혀 있으면 하나로 뽑을 수 없다.
  const menu = lines.join("\n");
  const calories = menu.match(CALORIES) ?? [];
  if (calories.length !== 1 || calories[0].includes("/")) {
    return { title, menu, price: null, calorie: null };
  }

  const price = menu.match(PRICE)?.[0] ?? null;
  const calorie = menu.match(CALORIE)?.[0] ?? null;
  while (
    lines.length > 0 &&
    (PRICE.test(lines[lines.length - 1]) || CALORIE.test(lines[lines.length - 1]))
  ) {
    lines.pop();
  }
  return { title, menu: lines.join("\n").trim() || menu, price, calorie };
};

/** "*11:30~13:30*", "<천원의아침밥>" 처럼 메뉴가 아닌 안내 줄. */
const NOTICE_LINE = /^(\*.*\*|<.*>)$/;

/** 위젯에 한 줄로 보여줄 대표 메뉴. 머리말과 안내·가격 줄은 건너뛴다. */
export const firstMenuOf = (section: CafeteriaSection): string => {
  const menu = section.menu
    .split("\n")
    .map((line) => line.replace(/^\[[^\]]*\]\s*/, "").trim())
    .find(
      (line) =>
        line.length > 0 &&
        !NOTICE_LINE.test(line) &&
        !/^"?[0-9,]+원/.test(line) &&
        !/^[0-9,\s/]*kcal/i.test(line),
    );
  return (menu ?? section.menu.split("\n")[0] ?? "").replace(/\s*"?[0-9,]+원.*$/, "").trim();
};

/**
 * 홈 위젯 한 장에 담을 코너 묶음.
 * 학생식당은 코너가 많아 한 장이 길어지므로 두 장으로 나누고, 고정 메뉴인 국밥은 뺀다.
 */
const WIDGET_CORNER_GROUPS: Record<string, (string | null)[][]> = {
  학생식당: [
    ["1코너(백반)", "2코너(일품)", null],
    ["4코너(일품)", "5코너(고급일품)"],
  ],
};

/** 위젯 슬라이드별 코너 목록. 보여줄 코너가 없는 뒷장은 만들지 않는다. */
export const groupSectionsForWidget = (
  cafeteria: string,
  sections: CafeteriaSection[],
): CafeteriaSection[][] => {
  const groups = WIDGET_CORNER_GROUPS[cafeteria];
  if (!groups) {
    return [sections];
  }
  return groups
    .map((corners) => sections.filter((section) => corners.includes(section.title)))
    .filter((group, index) => index === 0 || group.length > 0);
};
