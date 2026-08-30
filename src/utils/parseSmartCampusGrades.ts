import type { Term } from "@/types/timetables";
import type { ParsedGradeRow, ParsedGradeSheet } from "@/types/gradeImport";

/**
 * 스마트캠퍼스(학교 ERP) "과목별 성적" 표를 복사해 붙여넣은 텍스트를 파싱한다.
 *
 * 붙여넣기 방식이 기기마다 달라 들어오는 텍스트 모양이 제각각이다.
 *  - 안드로이드 앱: "모두 선택"이 있어 상단 메뉴 · 학기별 요약 표까지 화면 전체가 온다.
 *  - iOS: 드래그를 아무 데서나 시작할 수 있어 앞뒤가 잘린 채로 온다(첫 줄이 행 중간일 수도).
 * 그래서 "과목 행처럼 생긴 줄만 골라낸다"는 원칙으로 읽고, 나머지는 조용히 버린다.
 *
 * 셀 구분은 탭이 기본이지만 브라우저/앱에 따라 공백만 남는 경우도 있어 둘 다 받는다.
 * 탭이 있으면 빈 셀(성적 미발표 학기의 등급 등)이 보존되므로 탭 기준 분리를 우선한다.
 *
 * 기대하는 행 모양:
 *   `기업가정신 / 0005103` `1` `P` `심화교양` `사회` `(비고)`
 *   (교과목명/과목코드, 학점, 등급, 이수구분, 이수영역, 비고)
 *
 * 뒤쪽 열은 얼마든지 잘려 있을 수 있다. 사용자가 표를 과목명까지만 드래그해
 * `지능정보시스템 / 0009484`만 복사해 오는 경우도 정상 행으로 받아들이고,
 * 모자란 값은 null로 둔 뒤 계산기에서 채우게 한다.
 */

const GRADE_TOKENS = new Set([
  "A+",
  "A0",
  "A",
  "B+",
  "B0",
  "B",
  "C+",
  "C0",
  "C",
  "D+",
  "D0",
  "D",
  "F",
  "P",
  "NP",
  "W",
  "I",
]);

// 계산기가 다루는 등급 표기로 정규화한다(A -> A0 등).
const GRADE_ALIASES: Record<string, string> = {
  A: "A0",
  B: "B0",
  C: "C0",
  D: "D0",
};

// `교과목명 / 과목코드` — 과목코드는 "0004325"처럼 순수 숫자이거나 "XAA1358",
// "IA02009"처럼 영문 접두어가 붙는다. 숫자를 4자리 이상 요구하는 게 중요한데,
// 화면 전체를 복사하면 학기별 요약 표의 석차 칸("59/116")도 같이 오기 때문이다.
// 교과목명 자체에 슬래시가 들어가도 코드 패턴 덕분에 백트래킹으로 경계를 찾는다.
const TITLE_CODE_RE = /^(.*?)\s*\/\s*([A-Za-z]{0,4}\d{4,10})(?![0-9A-Za-z])/;

const SEMESTER_TITLE_RE =
  /(\d{4})\s*년도?\s*(1|2|여름|겨울|하계|동계|계절)\s*학기/;

/** "2022년 1학기 과목별 성적" — 과목 표의 제목 줄. */
const COURSE_TABLE_TITLE_RE = /과목별\s*성적/;

/** 과목명에 반드시 들어 있는 문자(한글/영문). 숫자·기호뿐인 셀은 과목명이 아니다. */
const NAME_LIKE_RE = /[가-힣A-Za-z]/;

/** 학점 칸으로 받아들일 범위. 이 밖의 숫자는 학점 열이 아니라고 본다. */
const MAX_CREDIT = 12;

const toTerm = (raw: string): Term => {
  switch (raw) {
    case "1":
      return "FIRST";
    case "2":
      return "SECOND";
    case "여름":
    case "하계":
      return "SUMMER";
    case "겨울":
    case "동계":
      return "WINTER";
    default:
      // "계절학기"만 적혀 있으면 어느 계절인지 알 수 없다. 여름을 기본값으로 두고
      // 사용자가 시트에서 바꿀 수 있게 한다.
      return "SUMMER";
  }
};

const normalizeGrade = (raw: string): string | null => {
  const token = raw.trim().toUpperCase().replace(/\s+/g, "");
  if (!token) return null;
  if (!GRADE_TOKENS.has(token)) return null;
  return GRADE_ALIASES[token] ?? token;
};

/** 행의 나머지 부분(학점 이후)을 셀 배열로 자른다. */
const splitCells = (rest: string): string[] => {
  if (rest.includes("\t")) {
    const cells = rest.split("\t").map((cell) => cell.trim());
    // 이름/코드 셀과 학점 셀 사이의 구분자 때문에 앞쪽에 빈 셀이 생긴다.
    while (cells.length > 0 && cells[0] === "") cells.shift();
    while (cells.length > 0 && cells[cells.length - 1] === "") cells.pop();
    return cells;
  }
  return rest.trim().split(/\s+/).filter(Boolean);
};

const parseLine = (line: string): ParsedGradeRow | null => {
  const match = TITLE_CODE_RE.exec(line);
  if (!match) return null;

  const title = match[1].trim();
  const courseCode = match[2].trim().toUpperCase();
  // 과목명 칸 안에서 `과목명 / 코드`가 끝나야 한다. 탭이 끼어 있으면 여러 셀을 가로질러
  // 슬래시를 찾은 것(요약 표의 "2026\t1학기\t…\t59/116" 같은 줄)이라 과목 행이 아니다.
  if (!title || title.includes("\t") || !NAME_LIKE_RE.test(title)) return null;

  const cells = splitCells(line.slice(match[0].length));

  // 학점 칸: 있으면 숫자여야 한다. 숫자가 아니면 학점 열이 통째로 빠진 것으로 보고
  // 나머지 열을 한 칸씩 당겨 읽는다.
  let cursor = 0;
  let credit: number | null = null;
  if (cells.length > 0) {
    const parsedCredit = Number.parseFloat(cells[0]);
    if (
      Number.isFinite(parsedCredit) &&
      parsedCredit >= 0 &&
      parsedCredit <= MAX_CREDIT &&
      /^\d+(\.\d+)?$/.test(cells[0])
    ) {
      credit = parsedCredit;
      cursor += 1;
    }
  }

  // 등급 칸: 탭 구분이면 빈 문자열로 남고, 공백 구분이면 아예 사라진다.
  // 다음 셀이 등급으로 읽히지 않으면 등급 없이 이수구분이 온 것으로 본다.
  let grade: string | null = null;
  if (cursor < cells.length) {
    const candidate = cells[cursor];
    if (candidate === "") {
      cursor += 1;
    } else {
      const normalized = normalizeGrade(candidate);
      if (normalized) {
        grade = normalized;
        cursor += 1;
      }
    }
  }

  const isuName = cells[cursor]?.trim() || null;
  const isuFldName = cells[cursor + 1]?.trim() || null;
  // 비고 이후에도 열이 더 있을 수 있어 남은 셀을 전부 이어붙인다.
  const note = cells.slice(cursor + 2).join(" ").trim() || null;

  return {
    title,
    courseCode,
    credit,
    grade,
    isuName,
    isuFldName,
    note,
    // "재수강성적취소" - 재수강해서 이 회차 성적이 무효가 된 행("성적폐기사유" 열).
    voided: note !== null && (note.includes("취소") || note.includes("폐기")),
  };
};

export const parseSmartCampusGrades = (input: string): ParsedGradeSheet => {
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.trim() !== "");

  // 화면 전체를 복사한 경우("모두 선택") 과목 표 제목 위쪽은 상단 메뉴와 학기별 요약
  // 표다. 제목이 딸려왔다면 그 아래만 과목 행 후보로 본다. iOS처럼 표 중간부터 드래그해
  // 제목이 없으면 전체를 훑되, parseLine의 행 모양 검증이 요약 행을 걸러낸다.
  const tableTitleIndex = lines.findIndex((line) =>
    COURSE_TABLE_TITLE_RE.test(line),
  );

  const rows: ParsedGradeRow[] = [];
  const skippedLines: string[] = [];
  // 학기는 "2022년 1학기 과목별 성적" 제목에서 읽은 값이 가장 믿을 만하다. 요약 표에도
  // 연도·학기가 있어서(그것도 내가 보고 있는 학기가 아니다) 제목 쪽을 우선한다.
  let titleSemester: ParsedGradeSheet["detectedSemester"] = null;
  let fallbackSemester: ParsedGradeSheet["detectedSemester"] = null;

  lines.forEach((line, index) => {
    const semesterMatch = SEMESTER_TITLE_RE.exec(line);
    if (semesterMatch) {
      const semester = {
        year: Number.parseInt(semesterMatch[1], 10),
        term: toTerm(semesterMatch[2]),
      };
      if (COURSE_TABLE_TITLE_RE.test(line)) {
        titleSemester ??= semester;
      } else {
        fallbackSemester ??= semester;
      }
      // 제목·요약 줄은 과목 행이 아니다.
      return;
    }

    // 표 위쪽(메뉴·요약)은 버릴 게 뻔하니 skippedLines에도 담지 않는다.
    if (tableTitleIndex >= 0 && index < tableTitleIndex) return;

    const row = parseLine(line);
    if (row) {
      rows.push(row);
      return;
    }

    // 과목 행으로 못 읽은 줄(표 헤더, 드래그가 중간에서 시작돼 잘린 첫 행 등)은
    // 조용히 버리되 무엇을 버렸는지는 남겨 UI에서 알릴 수 있게 한다.
    skippedLines.push(line.trim());
  });

  return {
    rows,
    detectedSemester: titleSemester ?? fallbackSemester,
    skippedLines,
  };
};

/** 이수구분/이수영역 문자열로 전공 과목인지 판별한다. */
export const isMajorCompletion = (
  isuName: string | null,
  isuFldName: string | null,
): boolean => {
  const source = `${isuName ?? ""} ${isuFldName ?? ""}`;
  return source.includes("전공");
};
