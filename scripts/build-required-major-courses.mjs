// 학과 홈페이지의 교육과정표에서 학번(입학연도)별 전공필수 과목을 뽑아 정적 데이터로 만든다.
//
//   node scripts/build-required-major-courses.mjs
//
// 결과는 src/resources/data/requiredMajorCourses.ts에 덮어쓴다.
// 갱신 주기는 졸업요건 데이터와 같다(매년 2월·8월 개강 전, issue #335).
//
// 출처: 각 학과 사이트의 "교육과정" 메뉴(K2Web curriculum 기능).
//   GET https://{host}/curriculum/{siteId}/{fnctNo}/curriculumView.do?year={입학연도}
// 페이지에서 쓰는 `?enc=...` 쿼리는 이 경로를 base64로 감싼 것일 뿐이다.
//
// 인천대 이수구분에서 전공필수 = 전공기초 + 전공핵심이다. 옛 교육과정표에 남은
// "전공필수" 표기도 같은 뜻으로 받는다. 본인 학번의 교육과정표를 따르므로 입학연도별로 뽑는다.

import { writeFileSync } from "node:fs";
import path from "node:path";

const OUT_PATH = path.join(
  import.meta.dirname,
  "../src/resources/data/requiredMajorCourses.ts",
);

const FIRST_YEAR = 2016;
const LAST_YEAR = new Date().getFullYear();
/** 가장 최근 교육과정은 이후 입학생에게도 그대로 적용한다. */
const OPEN_END_YEAR = 2099;

const REQUIRED_DIVISIONS = new Set(["전공기초", "전공핵심", "전공필수"]);
const DIVISIONS = new Set([
  ...REQUIRED_DIVISIONS,
  "전공심화",
  "전공선택",
  "기초교양",
  "핵심교양",
  "심화교양",
  "교양필수",
  "교양선택",
  "일반선택",
  "교직",
]);

/** IBE 교육과정표는 영문이다. */
const DIVISION_ALIASES = {
  "Major Basic": "전공기초",
  "Major Core": "전공핵심",
  "Major Requirement": "전공필수",
  "Major Elective": "전공선택",
};

/**
 * 학과 코드(navBarList) → 학부 교육과정표 위치.
 * 같은 사이트에 대학원 교육과정(fnctNo)이 따로 있는 학과가 있어 학부 것만 적는다.
 * 학과 메뉴에서 교육과정 페이지를 찾아 `fnctId=curriculum,fnctNo=N`을 확인해 채웠다.
 */
const SOURCES = {
  ENGLISH: ["english.inu.ac.kr", "ui", 9],
  GERMAN: ["german.inu.ac.kr", "german", 8],
  CHINESE: ["inuchina.inu.ac.kr", "inuchina", 5],
  FRENCH: ["inufrance.inu.ac.kr", "inufrance", 7],
  MATHEMATICS: ["math.inu.ac.kr", "isu", 14],
  PHYSICS: ["physics.inu.ac.kr", "physics", 13],
  CHEMISTRY: ["chem.inu.ac.kr", "chem", 18],
  FASHION: ["uifashion.inu.ac.kr", "uifashion", 15],
  MARINE: ["marine.inu.ac.kr", "marine", 17],
  SOCIAL_WELFARE: ["dsw.inu.ac.kr", "dsw", 21],
  MEDIA_COMMUNICATION: ["newdays.inu.ac.kr", "shinbang", 22],
  LIBRARY_INFO: ["cls.inu.ac.kr", "cls", 20],
  CREATIVE_HRD: ["hrd.inu.ac.kr", "hrd", 23],
  PUBLIC_ADMINISTRATION: ["uipa.inu.ac.kr", "uipa", 28],
  POLITICS_DIPLOMACY: ["politics.inu.ac.kr", "politics", 26],
  ECONOMICS: ["econ.inu.ac.kr", "econ", 24],
  TRADE: ["trade.inu.ac.kr", "trade", 25],
  CONSUMER_SCIENCE: ["ccs.inu.ac.kr", "ccs", 27],
  MECHANICAL_ENGINEERING: ["me.inu.ac.kr", "me", 29],
  ELECTRICAL_ENGINEERING: ["elec.inu.ac.kr", "elec", 37],
  ELECTRONICS_ENGINEERING: ["ee.inu.ac.kr", "electron", 38],
  INDUSTRIAL_MANAGEMENT: ["ime.inu.ac.kr", "ime", 32],
  MATERIAL_SCIENCE: ["mse.inu.ac.kr", "mse", 33],
  SAFETY_ENGINEERING: ["safety.inu.ac.kr", "safety", 34],
  ENERGY_CHEMICAL: ["energy.inu.ac.kr", "energy", 35],
  COMPUTER_ENGINEERING: ["cse.inu.ac.kr", "isis", 41],
  INFORMATION_COMMUNICATION_ENGINEERING: ["ite.inu.ac.kr", "ite", 40],
  EMBEDDED_SYSTEM: ["ese.inu.ac.kr", "ese", 39],
  BUSINESS_ADMINISTRATION: ["biz.inu.ac.kr", "biz", 42],
  TAX_ACCOUNTING: ["tax.inu.ac.kr", "tax", 43],
  FINE_ARTS: ["finearts.inu.ac.kr", "finearts", 48],
  DESIGN: ["design.inu.ac.kr", "design", 46],
  PERFORMING_ART: ["uipa10.inu.ac.kr", "uipa10", 45],
  HEALTH_EXERCISE: ["uiex.inu.ac.kr", "uiex", 47],
  KOREAN_EDUCATION: ["edukorean.inu.ac.kr", "edukorean", 51],
  ENGLISH_EDUCATION: ["eduenglish.inu.ac.kr", "eduenglish", 55],
  JAPANESE_EDUCATION: ["edujapanese.inu.ac.kr", "edujapanese", 59],
  MATH_EDUCATION: ["mathedu.inu.ac.kr", "edumath", 53],
  PHYSICAL_EDUCATION: ["eduphysical.inu.ac.kr", "eduphysical", 60],
  EARLY_CHILDHOOD_EDUCATION: ["ece.inu.ac.kr", "ece", 57],
  HISTORY_EDUCATION: ["eduhistory.inu.ac.kr", "eduhistory", 54],
  ETHICS_EDUCATION: ["eduethics.inu.ac.kr", "eduethics", 58],
  URBAN_ADMINISTRATION: ["urban.inu.ac.kr", "urban", 66],
  CIVIL_ENVIRONMENT_ENGINEERING: ["civil.inu.ac.kr", "civil", 61],
  ENVIRONMENT_ENGINEERING: ["et.inu.ac.kr", "et", 63],
  URBAN_ENGINEERING: ["scity.inu.ac.kr", "ucv", 62],
  URBAN_ARCHITECTURE: ["archi.inu.ac.kr", "archi", 64],
  LIFE_SCIENCE: ["life.inu.ac.kr", "life", 68],
  LIFE_SCIENCE_MOLECULAR: ["molbio.inu.ac.kr", "molbio", 69],
  BIOENGINEERING: ["bioeng.inu.ac.kr", "engineeringlife", 70],
  BIOENGINEERING_NANO: ["nanobio.inu.ac.kr", "nanobio", 113],
  SMART_LOGISTICS_ENGINEERING: ["slog.inu.ac.kr", "slog", 151],
  LAW: ["law.inu.ac.kr", "law", 71],
  // 학과 메뉴에는 트랙 소개만 있고, 교육과정 기능은 메뉴에 안 걸려 번호를 대입해 찾았다.
  NORTHEAST_ASIAN_TRADE: ["www.inu.ac.kr", "nas", 44],
  IBE: ["ibe.inu.ac.kr", "ibe", 152],
};

const 기초 = "전공기초";
const 핵심 = "전공핵심";

/**
 * 교육과정 기능 대신 PDF·이미지·일반 페이지로 교육과정을 올린 학과. 학번별 이력이 없어
 * 한 구간만 둔다. 적용 학번이 적혀 있지 않은 곳은 전공기초·전공핵심 명칭을 쓰는
 * 2023학년도 교육과정 개편 이후로 본다.
 */
const MANUAL = {
  // https://korean.inu.ac.kr/pdfView/korean/128/fileDownload.do ("입학년도: 2023 이후")
  KOREAN: {
    startYear: 2023,
    courses: [
      ["자기설계 Seminar1", 1, 기초],
      ["고전과 삶", 3, 기초],
      ["한국어 논리와 표현", 3, 기초],
      ["언어와 인간", 3, 기초],
      ["한자와 생활", 3, 기초],
      ["한국문학의 이해", 3, 기초],
      ["문학과 문화", 3, 기초],
      ["한국의 언어", 3, 핵심],
      ["한국어 문법의 이해", 3, 핵심],
      ["현대문학사1", 3, 핵심],
      ["고전문학사", 3, 핵심],
    ],
  },
  // https://unjapan.inu.ac.kr/unjapan/2053/subview.do (학사개요 > 3. 전공학점, 적용 학번 없음)
  JAPANESE: {
    startYear: 2023,
    courses: [
      ["자기설계Seminar Ⅰ", 1, 기초],
      ["일본어입문(1)", 3, 기초],
      ["자기설계Seminar Ⅱ", 1, 기초],
      ["일본어입문(2)", 3, 기초],
      ["아카데믹일본어(1)", 2, 기초],
      ["아카데믹일본어(2)", 2, 기초],
      ["일본문화콘텐츠입문", 3, 핵심],
      ["일본지역학입문", 3, 핵심],
      ["일본근현대사", 3, 핵심],
      ["일본문학비평", 3, 핵심],
      ["일본지역사회의이해", 3, 핵심],
      ["현대일본문화론", 3, 핵심],
    ],
  },
  // https://bio-robot.inu.ac.kr/meca/3047/subview.do ("2024 교육과정 개정(안)")
  BIO_ROBOTICS_ENGINEERING: {
    startYear: 2024,
    courses: [
      ["공학프로그래밍", 2, 기초],
      ["정역학", 3, 기초],
      ["자기설계세미나", 1, 기초],
      ["공업수학1", 3, 기초],
      ["전기회로실험", 2, 기초],
      ["동역학", 3, 핵심],
      ["재료역학", 3, 핵심],
      ["전기회로", 3, 핵심],
      ["공업수학2", 3, 핵심],
      ["디지털회로", 3, 핵심],
      ["전자기학", 3, 핵심],
      ["시스템동역학1", 3, 핵심],
      ["설계공학", 3, 핵심],
      ["자동제어", 3, 핵심],
    ],
  },
  // https://datascience.inu.ac.kr/datascience/3707/subview.do (전공교육과정 편성표, 적용 학번 없음)
  DATA_SCIENCE: {
    startYear: 2023,
    courses: [
      ["데이터과학개론", 3, 기초],
      ["데이터과학을 위한 기초통계학", 3, 기초],
      ["비즈니스 프로그래밍1", 3, 기초],
      ["데이터과학을 위한 기초수학", 3, 기초],
      ["데이터과학을 위한 계량경영학", 3, 핵심],
      ["데이터 애널리틱스", 3, 핵심],
      ["데이터분석 실습1", 3, 핵심],
      ["비즈니스 프로그래밍2", 3, 핵심],
      ["데이터과학 사례 연구", 3, 핵심],
      ["데이터분석 실습2", 3, 핵심],
    ],
  },
  // https://sports.inu.ac.kr:53034/sub3_2.php (학부 자체 사이트, 적용 학번 없음)
  SPORTS_SCIENCE: {
    startYear: 2023,
    courses: [
      ["자기설계세미나 I", 1, 기초],
      ["기초수영", 2, 기초],
      ["인체해부학", 2, 기초],
      ["자기설계세미나II", 1, 기초],
      ["수영심화", 2, 기초],
      ["기초기능해부학", 2, 기초],
      ["웨이트트레이닝기초", 2, 기초],
      ["웨이트트레이닝심화", 2, 기초],
      ["스포츠심리학", 3, 핵심],
      ["운동생리학", 3, 핵심],
      ["스포츠사회학", 3, 핵심],
      ["운동역학", 3, 핵심],
      ["스포츠교육학", 3, 핵심],
      ["Sport Management", 3, 핵심],
      ["트레이닝방법론", 3, 핵심],
      ["운동학습및제어", 3, 핵심],
    ],
  },
};

const decode = (value) =>
  value
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/\s+/g, " ")
    .trim();

/**
 * 교육과정표 한 해치를 행으로 푼다.
 * 학년·학기·이수구분은 rowspan으로 묶인 <th>라 이전 행 값을 이어 받는다.
 */
const parseCurriculum = (html) => {
  const start = html.indexOf("<tbody");
  const body = html.slice(start, html.indexOf("</tbody>", start));
  const rows = [];
  let division = null;
  let grade = null;

  for (const [, row] of body.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)) {
    for (const [, th] of row.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)) {
      const text = DIVISION_ALIASES[decode(th)] ?? decode(th);
      if (DIVISIONS.has(text)) division = text;
      else if (/학년|공통|Common|^\d$/.test(text)) grade = text;
    }
    const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map(
      ([, td]) => decode(td),
    );
    if (cells.length < 2) continue;
    const credits = Number(cells[1]);
    if (!cells[0] || !Number.isFinite(credits)) continue;
    rows.push({ grade, division, courseName: cells[0], credits });
  }
  return rows;
};

const fetchYear = async ([host, siteId, fnctNo], year) => {
  const url = `https://${host}/curriculum/${siteId}/${fnctNo}/curriculumView.do?year=${year}`;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
      if (response.ok) return parseCurriculum(await response.text());
    } catch {
      // 학과 서버가 가끔 끊긴다. 몇 번 더 시도한다.
    }
  }
  throw new Error(`교육과정을 못 받았다: ${url}`);
};

/**
 * 전공필수 과목만 [과목명, 학점, 이수구분]으로 남긴다.
 * "공통" 학년 행은 학년과 무관하게 골라 듣는 현장교육실습뿐이라 뺀다.
 * 연도끼리 비교할 수 있게 과목명 순으로 정렬하고, 같은 과목이 두 번 적히면 하나로 합친다.
 */
const requiredCourses = (rows) => {
  const byName = new Map();
  rows
    .filter(
      (row) =>
        REQUIRED_DIVISIONS.has(row.division) &&
        !/공통|Common/.test(row.grade ?? ""),
    )
    .forEach((row) => {
      if (!byName.has(row.courseName)) {
        byName.set(row.courseName, [row.courseName, row.credits, row.division]);
      }
    });
  return [...byName.values()].sort(([a], [b]) => a.localeCompare(b, "ko"));
};

/** 연도별 목록을 같은 목록끼리 이어 붙여 학번 구간으로 만든다. */
const toRanges = (byYear) => {
  const ranges = [];
  for (const [year, courses] of byYear) {
    const key = JSON.stringify(courses);
    const last = ranges.at(-1);
    if (last && last.key === key && last.endYear === year - 1) {
      last.endYear = year;
    } else {
      ranges.push({ key, startYear: year, endYear: year, courses });
    }
  }
  if (ranges.length > 0) ranges.at(-1).endYear = OPEN_END_YEAR;
  return ranges.map(({ startYear, endYear, courses }) => ({
    startYear,
    endYear,
    courses,
  }));
};

const collect = async (code, source) => {
  const byYear = [];
  for (let year = FIRST_YEAR; year <= LAST_YEAR; year += 1) {
    const rows = await fetchYear(source, year);
    // 교육과정표가 없는 해(학과 신설 전·미게시)는 건너뛴다. 표는 있는데 전공필수가
    // 없는 해(IBE 2020~)는 빈 목록으로 남겨 앞 학번 목록이 이어 붙지 않게 한다.
    if (rows.length > 0) byYear.push([year, requiredCourses(rows)]);
  }
  return [code, toRanges(byYear)];
};

const results = [];
const entries = Object.entries(SOURCES);
const CONCURRENCY = 6;
for (let index = 0; index < entries.length; index += CONCURRENCY) {
  const batch = entries.slice(index, index + CONCURRENCY);
  results.push(
    ...(await Promise.all(
      batch.map(([code, source]) => collect(code, source)),
    )),
  );
  process.stderr.write(`${results.length}/${entries.length}\n`);
}

const manual = Object.entries(MANUAL).map(([code, { startYear, courses }]) => [
  code,
  [
    {
      startYear,
      endYear: OPEN_END_YEAR,
      courses: [...courses].sort(([a], [b]) => a.localeCompare(b, "ko")),
    },
  ],
]);

const data = Object.fromEntries(
  [...results, ...manual]
    .filter(([, ranges]) => ranges.length > 0)
    .sort(([a], [b]) => a.localeCompare(b)),
);

/** 과목 한 줄에 튜플 하나씩 적어 diff를 읽기 쉽게 한다. */
const serialize = (value) =>
  `{\n${Object.entries(value)
    .map(
      ([code, ranges]) =>
        `  ${code}: [\n${ranges
          .map(
            ({ startYear, endYear, courses }) =>
              `    {\n      startYear: ${startYear},\n      endYear: ${endYear},\n      courses: [\n${courses
                .map((course) => `        ${JSON.stringify(course)},`)
                .join("\n")}\n      ],\n    },`,
          )
          .join("\n")}\n  ],`,
    )
    .join("\n")}\n}`;

const header = `// 자동 생성 파일 — 직접 고치지 말고 scripts/build-required-major-courses.mjs를 다시 실행한다.
// 학과 홈페이지 교육과정표의 전공필수(전공기초·전공핵심, 옛 표기 "전공필수") 과목을
// 입학연도 구간별로 담는다. ${FIRST_YEAR}학번 이전은 교육과정표가 게시되지 않아 없다.
import type { RequiredMajorCourseSet } from "@/types/graduation";

export const REQUIRED_MAJOR_COURSES: Record<string, RequiredMajorCourseSet[]> = `;

writeFileSync(OUT_PATH, `${header}${serialize(data)};\n`);
console.log(
  `${Object.keys(data).length}개 학과 → ${path.relative(process.cwd(), OUT_PATH)}`,
);
