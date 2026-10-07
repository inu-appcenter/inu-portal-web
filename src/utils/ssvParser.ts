import { getCollegeByDepartmentCode } from "./departmentOptions";

export interface AcademicBasicInfo {
  displayFields?: Record<string, string>;
  studentId: string;
  koreanName: string;
  englishName?: string;
  enrollmentStatus: string;
  entranceClassification?: string;
  entranceType?: string;
  entranceDate?: string;
  latestEnrollmentChange?: string;
  latestEnrollmentChangeDate?: string;
  gender?: string;
  birthDate?: string;
  departmentCode?: string;
  departmentName: string;
  majorCode?: string;
  majorName?: string;
  collegeName?: string;
  completedSemesterCode?: string;
  completedSemesterName?: string;
  completedSemesterCount?: string;
  acquiredCredits: string;
  gradeAverage: string;
  advisorProfessorName?: string;
  rawFields: Record<string, string>;
}

export interface TimetableTimeSlot {
  day: string;
  periods: string;
  building?: string;
  room?: string;
  rawLocation?: string;
}

export interface TimetableCourseItem {
  courseName: string;
  courseCode: string;
  credits: string;
  professorName: string;
  courseType: string;
  departmentName: string;
  targetGrade: string;
  lessonType: string;
  timeInfoRaw: string;
  timeSlots: TimetableTimeSlot[];
  year: string;
  semester: string;
  status: string;
  rawFields?: Record<string, string>;
}

export const INU_DEPARTMENT_MAP: Record<string, { departmentName: string; collegeName: string }> = {
  // 인문대학
  AIA1: { departmentName: "국어국문학과", collegeName: "인문대학" },
  AIB1: { departmentName: "영어영문학과", collegeName: "인문대학" },
  AIE1: { departmentName: "독어독문학과", collegeName: "인문대학" },
  AIF1: { departmentName: "불어불문학과", collegeName: "인문대학" },
  "0000793": { departmentName: "일본지역문화학과", collegeName: "인문대학" },
  AID1: { departmentName: "중어중국학과", collegeName: "인문대학" },
  // 자연과학대학
  BKA1: { departmentName: "수학과", collegeName: "자연과학대학" },
  BKB1: { departmentName: "물리학과", collegeName: "자연과학대학" },
  BKC1: { departmentName: "화학과", collegeName: "자연과학대학" },
  BLB1: { departmentName: "패션산업학과", collegeName: "자연과학대학" },
  "0000189": { departmentName: "해양학과", collegeName: "자연과학대학" },
  // 사회과학대학
  "0000144": { departmentName: "사회복지학과", collegeName: "사회과학대학" },
  "0000794": { departmentName: "미디어커뮤니케이션학과", collegeName: "사회과학대학" },
  "0000053": { departmentName: "문헌정보학과", collegeName: "사회과학대학" },
  "0000054": { departmentName: "창의인재개발학과", collegeName: "사회과학대학" },
  // 글로벌정경대학
  "0000698": { departmentName: "행정학과", collegeName: "글로벌정경대학" },
  "0000699": { departmentName: "정치외교학과", collegeName: "글로벌정경대학" },
  "0000700": { departmentName: "경제학과", collegeName: "글로벌정경대학" },
  "0000913": { departmentName: "Global Trade & Service학부", collegeName: "글로벌정경대학" },
  "0000704": { departmentName: "소비자학과", collegeName: "글로벌정경대학" },
  // 공과대학
  "0000055": { departmentName: "에너지화학공학과", collegeName: "공과대학" },
  EPB1: { departmentName: "전기공학과", collegeName: "공과대학" },
  "0000813": { departmentName: "전자공학부", collegeName: "공과대학" },
  EPC1: { departmentName: "전자공학과", collegeName: "공과대학" },
  "0000828": { departmentName: "전자공학전공", collegeName: "공과대학" },
  EPG1: { departmentName: "산업경영공학과", collegeName: "공과대학" },
  "0000076": { departmentName: "신소재공학과", collegeName: "공과대학" },
  "0000459": { departmentName: "기계공학과", collegeName: "공과대학" },
  "0000814": { departmentName: "바이오-로봇시스템공학과", collegeName: "공과대학" },
  "0000075": { departmentName: "안전공학과", collegeName: "공과대학" },
  // 정보기술대학
  "0000077": { departmentName: "컴퓨터공학부", collegeName: "정보기술대학" },
  IAB1: { departmentName: "정보통신공학과", collegeName: "정보기술대학" },
  "0000042": { departmentName: "임베디드시스템공학과", collegeName: "정보기술대학" },
  // 경영대학
  JA01: { departmentName: "경영학부", collegeName: "경영대학" },
  "0000812": { departmentName: "데이터과학과", collegeName: "경영대학" },
  "0000057": { departmentName: "세무회계학과", collegeName: "경영대학" },
  // 예술체육대학
  "0000192": { departmentName: "조형예술학부", collegeName: "예술체육대학" },
  "0000193": { departmentName: "한국화전공", collegeName: "예술체육대학" },
  "0000194": { departmentName: "서양화전공", collegeName: "예술체육대학" },
  "0000195": { departmentName: "디자인학부", collegeName: "예술체육대학" },
  "0000196": { departmentName: "공연예술학과", collegeName: "예술체육대학" },
  "0000815": { departmentName: "스포츠과학부", collegeName: "예술체육대학" },
  "0000191": { departmentName: "운동건강학부", collegeName: "예술체육대학" },
  // 사범대학
  "0000064": { departmentName: "국어교육과", collegeName: "사범대학" },
  "0000065": { departmentName: "영어교육과", collegeName: "사범대학" },
  "0000066": { departmentName: "일어교육과", collegeName: "사범대학" },
  "0000067": { departmentName: "수학교육과", collegeName: "사범대학" },
  "0000068": { departmentName: "체육교육과", collegeName: "사범대학" },
  "0000069": { departmentName: "유아교육과", collegeName: "사범대학" },
  "0000070": { departmentName: "역사교육과", collegeName: "사범대학" },
  "0000071": { departmentName: "윤리교육과", collegeName: "사범대학" },
  // 도시과학대학
  "0000073": { departmentName: "도시행정학과", collegeName: "도시과학대학" },
  "0000156": { departmentName: "건설환경공학전공", collegeName: "도시과학대학" },
  "0000157": { departmentName: "환경공학전공", collegeName: "도시과학대학" },
  "0000463": { departmentName: "도시공학과", collegeName: "도시과학대학" },
  "0000038": { departmentName: "도시건축학부", collegeName: "도시과학대학" },
  "0000160": { departmentName: "건축공학전공", collegeName: "도시과학대학" },
  "0000464": { departmentName: "도시건축학전공", collegeName: "도시과학대학" },
  // 생명과학기술대학
  "0000184": { departmentName: "생명과학전공", collegeName: "생명과학기술대학" },
  "0000185": { departmentName: "분자의생명전공", collegeName: "생명과학기술대학" },
  "0000187": { departmentName: "생명공학전공", collegeName: "생명과학기술대학" },
  "0000833": { departmentName: "나노바이오공학전공", collegeName: "생명과학기술대학" },
  // 융합자유전공 / 동북아 / 법학부
  "0000838": { departmentName: "자유전공학부", collegeName: "융합자유전공대학" },
  "0000817": { departmentName: "동북아국제통상전공", collegeName: "동북아국제통상물류학부" },
  "0000818": { departmentName: "스마트물류공학전공", collegeName: "동북아국제통상물류학부" },
  "0000832": { departmentName: "IBE전공", collegeName: "동북아국제통상물류학부" },
  "0000707": { departmentName: "법학부", collegeName: "법학부" },
};

const RECORD_SEPARATOR = String.fromCharCode(30);
const UNIT_SEPARATOR = String.fromCharCode(31);
const NULL_MARKER = String.fromCharCode(3);
const ROW_TYPE = "_RowType_";

function formatNexacroDate(raw?: string): string | undefined {
  if (!raw || raw.length !== 8) return raw;
  return `${raw.substring(0, 4)}-${raw.substring(4, 6)}-${raw.substring(6, 8)}`;
}

function firstValue(row: Record<string, string>, keys: string[]): string | undefined {
  return keys.map((key) => row[key]?.trim()).find(Boolean);
}

export function parseRows(responseBody: string, datasetName: string): Record<string, string>[] {
  const records = responseBody.split(RECORD_SEPARATOR);
  let datasetIndex = -1;

  for (let i = 0; i < records.length; i++) {
    if (records[i] === `Dataset:${datasetName}`) {
      datasetIndex = i;
      break;
    }
  }

  if (datasetIndex < 0) {
    throw new Error(`Dataset '${datasetName}' not found in SSV response.`);
  }

  const rows: Record<string, string>[] = [];
  let columnNames: string[] | null = null;
  let hasRowTypeColumn = false;

  for (let i = datasetIndex + 1; i < records.length; i++) {
    const record = records[i];
    if (!record) continue;
    if (record.startsWith("Dataset:")) {
      break;
    }

    if (
      record.startsWith("ErrorCode") ||
      record.startsWith("ErrorMsg") ||
      record.startsWith("_Const_") ||
      record.startsWith("ConstColumnInfo")
    ) {
      continue;
    }

    if (columnNames === null) {
      const parts = record.split(UNIT_SEPARATOR);
      const parsedCols: string[] = [];
      for (const part of parts) {
        if (!part) continue;
        const colName = part.split(":")[0];
        parsedCols.push(colName);
      }

      if (parsedCols.length > 0) {
        hasRowTypeColumn = parsedCols[0] === ROW_TYPE;
        columnNames = hasRowTypeColumn ? parsedCols.slice(1) : parsedCols;
        continue;
      }
    }

    if (!columnNames) continue;
    const tokens = record.split(UNIT_SEPARATOR);
    const startIndex = hasRowTypeColumn || tokens.length === columnNames.length + 1 ? 1 : 0;

    if (tokens.length >= columnNames.length + startIndex) {
      const row: Record<string, string> = {};
      row[ROW_TYPE] = tokens[0];

      for (let c = 0; c < columnNames.length; c++) {
        const rawVal = tokens[c + startIndex];
        if (rawVal === NULL_MARKER || rawVal === "" || rawVal === undefined) {
          row[columnNames[c]] = "";
        } else {
          row[columnNames[c]] = rawVal;
        }
      }
      rows.push(row);
    }
  }

  return rows;
}

/**
 * SSV 문자열 전체에서 모든 Dataset을 파싱하여 { [datasetName]: rows[] } 맵으로 반환
 */
export function parseNexacroDatasets(responseBody: string): Record<string, Record<string, string>[]> {
  const result: Record<string, Record<string, string>[]> = {};
  if (!responseBody) return result;

  const records = responseBody.split(RECORD_SEPARATOR);
  let currentDataset: string | null = null;
  let columnNames: string[] | null = null;
  let hasRowTypeColumn = false;

  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    if (!record) continue;

    if (record.startsWith("Dataset:")) {
      currentDataset = record.substring("Dataset:".length).trim();
      result[currentDataset] = [];
      columnNames = null;
      hasRowTypeColumn = false;
      continue;
    }

    if (!currentDataset) continue;

    if (
      record.startsWith("ErrorCode") ||
      record.startsWith("ErrorMsg") ||
      record.startsWith("_Const_") ||
      record.startsWith("ConstColumnInfo")
    ) {
      continue;
    }

    if (columnNames === null) {
      const parts = record.split(UNIT_SEPARATOR);
      const parsedCols: string[] = [];
      for (const part of parts) {
        if (!part) continue;
        const colName = part.split(":")[0];
        parsedCols.push(colName);
      }

      if (parsedCols.length > 0) {
        hasRowTypeColumn = parsedCols[0] === ROW_TYPE;
        columnNames = hasRowTypeColumn ? parsedCols.slice(1) : parsedCols;
        continue;
      }
    }

    if (!columnNames) continue;
    const tokens = record.split(UNIT_SEPARATOR);
    const startIndex = hasRowTypeColumn || tokens.length === columnNames.length + 1 ? 1 : 0;

    if (tokens.length >= columnNames.length + startIndex) {
      const row: Record<string, string> = {};
      row[ROW_TYPE] = tokens[0];

      for (let c = 0; c < columnNames.length; c++) {
        const rawVal = tokens[c + startIndex];
        if (rawVal === NULL_MARKER || rawVal === "" || rawVal === undefined) {
          row[columnNames[c]] = "";
        } else {
          row[columnNames[c]] = rawVal;
        }
      }
      result[currentDataset].push(row);
    }
  }

  return result;
}

export function parseAcademicBasicInfo(responseBody: string): AcademicBasicInfo {
  let commonCodes = "";
  let departments: Record<string, string> = {};
  if (responseBody.startsWith("{")) {
    try {
      const envelope = JSON.parse(responseBody);
      if (envelope.rawSsv) {
        responseBody = envelope.rawSsv;
      } else if (envelope.ssv) {
        responseBody = envelope.ssv;
        commonCodes = envelope.commonCodes || "";
        departments = envelope.departments || {};
      }
    } catch {
      // not json envelope
    }
  }

  if (!responseBody || !responseBody.includes("ErrorCode:int=0")) {
    const preview = responseBody ? responseBody.substring(0, 200).replace(/[\r\n\x1e\x1f]/g, " ") : "EMPTY_RESPONSE";
    throw new Error(`인천대 학사 시스템(ERP) 응답 오류 또는 세션 만료 (${preview})`);
  }

  const rows = parseRows(responseBody, "DS_SREG101");
  if (rows.length === 0) {
    throw new Error("학적 정보(DS_SREG101) 데이터를 찾을 수 없습니다.");
  }

  const row = rows[0];
  const departmentCode = firstValue(row, ["hgCd", "deptCd", "dptCd", "sustCd", "dpmjCd"]);
  const deptMapped = departmentCode ? INU_DEPARTMENT_MAP[departmentCode] : undefined;
  const departmentName =
    firstValue(row, ["hgNm", "deptNm", "dptNm", "sustNm", "dpmjNm", "dpmjKorNm", "deptKorNm"]) ||
    deptMapped?.departmentName ||
    departments[departmentCode || ""] ||
    "";
  const collegeName =
    row["colgNm"]?.trim() ||
    deptMapped?.collegeName ||
    getCollegeByDepartmentCode(departmentCode) ||
    "";

  // 학적 변동 코드 한글 매핑 기본값
  const SCHREG_MOD_MAP: Record<string, string> = {
    "0101": "신입학",
    "0102": "편입학",
    "0201": "일반휴학",
    "0202": "군휴학",
    "0301": "일반복학",
    "0302": "제대복학",
    "0501": "자퇴",
    "0601": "제적",
    "0701": "졸업유예",
    "0702": "수료",
    "0801": "졸업",
  };

  // 학적 상태 한글 매핑 기본값
  let status = row["schregStGbn"] || "재학";
  const modGbn = row["flSchregModGbn"] || "";
  if (status === "10" || status === "1") status = "재학";
  else if (status === "20" || status === "2") status = "휴학";
  else if (status === "30" || status === "3") status = "졸업";
  else if (status === "70") {
    if (modGbn === "0701" || modGbn === "07") {
      status = "졸업유예";
    } else {
      status = "수료";
    }
  }

  const latestModName = SCHREG_MOD_MAP[modGbn] || modGbn;

  const baseResult: AcademicBasicInfo = {
    studentId: row["stuno"] || "",
    koreanName: row["korNm"] || "",
    englishName: row["engNm"] || "",
    enrollmentStatus: status,
    entranceClassification: row["entrClsfGbn"],
    entranceType: row["entrGbn"],
    entranceDate: formatNexacroDate(row["entrDt"]),
    latestEnrollmentChange: latestModName,
    latestEnrollmentChangeDate: formatNexacroDate(row["flSchregModDt"]),
    gender: row["genGbn"] === "1" ? "남" : row["genGbn"] === "2" ? "여" : row["genGbn"],
    birthDate: formatNexacroDate(row["birthDt"]),
    departmentCode,
    departmentName: departmentName || "학과 미지정",
    majorCode: row["hgMjCd"],
    majorName: row["mjNm"],
    collegeName: collegeName || undefined,
    completedSemesterCode: row["cnpassHySeqGbn"],
    completedSemesterName: row["cptnTmNm"],
    completedSemesterCount: row["mrksCptnTmCnt"] ? `${row["mrksCptnTmCnt"]}학기` : "",
    acquiredCredits: (row["acqHp"] || "0").trim(),
    gradeAverage: (row["mrksAvg"] || "0.0").trim(),
    advisorProfessorName: firstValue(row, ["profNm", "profName", "profKorNm", "advProfNm", "advisorNm", "tutProfNm"]) || "",
    rawFields: Object.fromEntries(
      Object.entries(row).filter(([key]) => !["_RowType_", "_Column_", "phtFile1", "phtFile2"].includes(key))
    ),
  };

  const enriched = enrichAcademicRow(row, commonCodes || responseBody, departments);
  return {
    ...baseResult,
    ...enriched,
    enrollmentStatus:
      enriched.enrollmentStatus && enriched.enrollmentStatus !== "확인 불가"
        ? enriched.enrollmentStatus
        : baseResult.enrollmentStatus,
    departmentName:
      enriched.departmentName && enriched.departmentName !== "확인 불가"
        ? enriched.departmentName
        : baseResult.departmentName,
    collegeName:
      enriched.collegeName && enriched.collegeName !== "확인 불가"
        ? enriched.collegeName
        : baseResult.collegeName,
  };
}

function enrichAcademicRow(row: Record<string, string>, codes: string, departments: Record<string, string>): Record<string, any> {
  const displayFields: Record<string, string> = {};
  const fields: Record<string, string> = {};
  const mappings = [
    ["schregStGbn", "DS_SCHREG_ST_GBN", "enrollmentStatus", "학적 상태"],
    ["entrClsfGbn", "DS_ENTR_CLSF_GBN", "entranceClassification", "입학 구분"],
    ["entrGbn", "DS_ENTR_GBN", "entranceType", "입학 전형"],
    ["flSchregModGbn", "DS_SCHREG_MOD_GBN", "latestEnrollmentChange", "최근 학적 변동"],
    ["genGbn", "DS_GEN_GBN", "gender", "성별"],
    ["corsGbn", "DS_CORS_GBN", "courseName", "과정"],
    ["hySeqGbn", "DS_HY_SEQ_GBN", "semesterSequenceName", "학기"],
    ["natGbn", "DS_NAT_GBN", "nationalityName", "국적"],
    ["milFinishGbn", "DS_MIL_FINISH_GBN", "militaryStatusName", "병역 상태"],
    ["capaIoGbn", "DS_CAPA_IO_GBN", "capacityIoName", "정원 내외 구분"],
    ["skilStdGbn", "DS_SKIL_STD_GBN", "skillStandardName", "특기 기준"],
  ];
  for (const [column, dataset, field, label] of mappings) {
    let name = "";
    if (codes && row[column]) {
      try {
        const item = parseRows(codes, dataset).find((item) => item.code?.trim() === row[column]?.trim());
        if (item) name = firstValue(item, ["chnlCdNm", "fullNm", "korCdNm", "codeNm", "remark"]) || "";
      } catch {
        /* Keep basic data when enrichment is unavailable */
      }
    }
    if (name) {
      fields[field] = name;
      displayFields[label] = name;
    }
  }

  const deptCode = firstValue(row, ["hgCd", "deptCd", "dptCd", "sustCd", "dpmjCd"]);
  const deptMapped = deptCode && INU_DEPARTMENT_MAP[deptCode] ? INU_DEPARTMENT_MAP[deptCode] : undefined;
  const deptNm = row["hgNm"]?.trim() || departments[deptCode || ""] || deptMapped?.departmentName;
  if (deptNm) {
    fields["departmentName"] = deptNm;
    displayFields["학과"] = deptNm;
  }
  const collegeNm = row["colgNm"]?.trim() || deptMapped?.collegeName;
  if (collegeNm) {
    fields["collegeName"] = collegeNm;
    displayFields["단과대"] = collegeNm;
  }

  for (const [column, label] of [
    ["engNm", "영문명"],
    ["entrDt", "입학일"],
    ["flSchregModDt", "학적 변동일"],
    ["birthDt", "생년월일"],
    ["cptnTmNm", "이수 학기명"],
    ["handpNo", "휴대전화"],
  ]) {
    if (row[column]) displayFields[label] = column.endsWith("Dt") ? formatNexacroDate(row[column]) || "" : row[column].trim();
  }
  const advisor = firstValue(row, ["profNm", "profName", "profKorNm", "advProfNm", "advisorNm", "tutProfNm"]);
  if (advisor) {
    displayFields["지도교수"] = `${advisor} 교수님`;
  }
  if (row.rrn) displayFields["주민등록번호(마스킹)"] = "******-*******";
  for (const [column, label] of [
    ["readmiYn", "재입학 여부"],
    ["earlyGrdtYn", "조기졸업 여부"],
    ["grdtExpcYn", "졸업예정 여부"],
    ["bcrmstConnYn", "학석사 연계 여부"],
  ]) {
    if (row[column]) {
      displayFields[label] = ["1", "Y"].includes(row[column]) ? "예" : ["0", "N"].includes(row[column]) ? "아니오" : row[column];
    }
  }
  return { ...fields, displayFields };
}

/**
 * 시간표 요일 및 교시/강의실 문자열 파싱
 * 예: "[04-104:월(7-8A)(8B-9)]" -> { day: "월", periods: "(7-8A)(8B-9)", building: "4호관", room: "104호", rawLocation: "04-104" }
 * 예: "[07-304:금(1)(2)(3)]" -> { day: "금", periods: "(1)(2)(3)", building: "7호관", room: "304호", rawLocation: "07-304" }
 */
export function parseTimeInfo(raw?: string): TimetableTimeSlot[] {
  if (!raw || !raw.trim()) return [];
  const text = raw.trim();
  const slots: TimetableTimeSlot[] = [];

  // Match pattern like [room:day(periods)]
  const bracketMatches = text.match(/\[([^\]]+)\]/g);
  if (bracketMatches) {
    for (const match of bracketMatches) {
      const inner = match.slice(1, -1).trim(); // "04-104:월(7-8A)(8B-9)"
      if (inner.includes(":")) {
        const [locPart, timePart] = inner.split(":");
        const dayMatch = timePart.match(/^([월화수목금토일])/);
        const day = dayMatch ? dayMatch[1] : "";
        const periods = dayMatch ? timePart.slice(dayMatch[0].length).trim() : timePart.trim();

        let building: string | undefined;
        let room: string | undefined;
        if (locPart.includes("-")) {
          const [b, r] = locPart.split("-");
          building = `${parseInt(b, 10) || b}호관`;
          room = `${r}호`;
        }

        slots.push({
          day,
          periods,
          building,
          room,
          rawLocation: locPart,
        });
      } else {
        slots.push({
          day: "",
          periods: inner,
        });
      }
    }
  } else {
    // Fallback if not wrapped in brackets e.g. "월1,2,3"
    const dayMatch = text.match(/^([월화수목금토일])/);
    if (dayMatch) {
      slots.push({
        day: dayMatch[1],
        periods: text.slice(dayMatch[0].length).trim(),
      });
    } else {
      slots.push({
        day: "",
        periods: text,
      });
    }
  }

  return slots;
}

/**
 * 학생별 수강 시간표 SSV 응답(DS_LIST) 파싱
 */
export function parseTimetableList(responseBody: string): TimetableCourseItem[] {
  let ssv = responseBody;
  if (responseBody.startsWith("{")) {
    try {
      const envelope = JSON.parse(responseBody);
      if (envelope.rawSsv) ssv = envelope.rawSsv;
      else if (envelope.ssv) ssv = envelope.ssv;
    } catch {
      // not json envelope
    }
  }

  if (!ssv || !ssv.includes("ErrorCode:int=0")) {
    const preview = ssv ? ssv.substring(0, 200).replace(/[\r\n\x1e\x1f]/g, " ") : "EMPTY_RESPONSE";
    throw new Error(`인천대 학사 시스템(ERP) 시간표 응답 오류 또는 세션 만료 (${preview})`);
  }

  let rows: Record<string, string>[] = [];
  try {
    rows = parseRows(ssv, "DS_LIST");
  } catch (err: any) {
    // Empty timetable or dataset missing
    return [];
  }

  return rows
    .map((row) => {
      const timeInfoRaw = row["timeInfo"] || "";
      const status = (row["delGbn"] || "신청").trim();
      return {
        courseName: (row["scNm"] || "").trim(),
        courseCode: (row["haksuNo"] || "").trim(),
        credits: (row["hp"] || "0").trim(),
        professorName: (row["profNm"] || "").trim(),
        courseType: (row["cptnGbn"] || "").trim(),
        departmentName: (row["openHgMjNm"] || "").trim(),
        targetGrade: (row["openHySeqGbn"] || "").trim(),
        lessonType: (row["lsnTypeGbn"] || "").trim(),
        timeInfoRaw,
        timeSlots: parseTimeInfo(timeInfoRaw),
        year: (row["yy"] || "").trim(),
        semester: (row["tmGbn"] || "").trim(),
        status,
        rawFields: row,
      };
    })
    .filter((item) => {
      // 수강 취소/삭제된 과목은 제외하고 정상 '신청' 상태인 과목만 포함
      const s = item.status;
      if (s === "취소" || s === "삭제" || s === "C" || s === "Y" || s.includes("취소") || s.includes("삭제")) {
        return false;
      }
      return true;
    });
}

// ==========================================
// 신규 개인학적조회(M002043) 기반 종합 성적/장학/시간표 타입 및 파서
// ==========================================

export interface SemesterGradeItem {
  year: string;
  semester: string;
  semesterName: string;
  targetGrade: string; // 학년
  appliedCredits: string; // 신청학점
  acquiredCredits: string; // 취득학점
  averageScore: string; // 평점평균 (예: 4.33)
  percentage: string; // 백분위 (예: 98.30)
  rank: string; // 전공석차 (예: 14/92)
  departmentRank?: string;
  cumulativeAppliedCredits: string; // 총누적신청학점
  cumulativeAcquiredCredits: string; // 총누적취득학점
  cumulativeAverageScore: string; // 총누적평점평균 (예: 4.24)
  cumulativePercentage: string; // 총누적백분위 (예: 97.40)
  isAcademicWarning: boolean;
}

export interface CourseGradeItem {
  year: string;
  semester: string;
  semesterName: string;
  courseCode: string; // 학수번호
  courseName: string;
  courseNameEng?: string;
  courseType: string; // 이수구분 코드
  courseTypeName: string; // 이수구분명 (전선, 전필 등)
  credits: string; // 학점
  grade: string; // 등급 (A+, A0, P 등)
  score: string; // 평점 (4.50, 4.00 등)
  isRetake: boolean; // 재수강 여부
  isPassed: boolean;
}

export interface CreditSummary {
  totalCredits: string;
  standardTotalCredits: string;
  majorCredits: string;
  majorCoreCredits: string;
  majorDeepCredits: string;
  generalCredits: string;
  generalRequiredCredits: string;
  collegeGeneralCredits: string;
  completedSemesterCount: string;
}

export interface GeneralEducationAreaItem {
  areaName: string; // 영역명 (예: INU핵심문제해결)
  courseTypeName: string; // 이수구분명 (교양필수, 교양선택 등)
  acquiredCredits: string; // 취득학점
  standardCredits: string; // 기준학점
  isSatisfied: boolean;
}

export interface ScholarshipItem {
  year: string;
  semester: string;
  semesterName: string;
  scholarshipName: string;
  amount: number;
  tuitionAmount: number;
  entranceAmount: number;
  paymentMethod: string;
}

export interface GraduationRequirement {
  passFlag: string;
  graduationYear?: string;
  graduationDate?: string;
  englishTestPassed: boolean;
  thesisPassed: boolean;
  degreeName?: string;
}

export interface FullAcademicReport {
  studentId: string;
  semesterGrades: SemesterGradeItem[];
  courseGrades: CourseGradeItem[];
  creditSummary: CreditSummary;
  generalEducationAreas: GeneralEducationAreaItem[];
  scholarships: ScholarshipItem[];
  totalScholarshipAmount: number;
  graduation: GraduationRequirement | null;
  timetable: TimetableCourseItem[];
}

/**
 * 학기 코드 변환 헬퍼 (10: 1학기, 20: 2학기, 30: 여름학기, 40: 겨울학기)
 */
export function formatTmGbn(tmGbn: string): string {
  switch (tmGbn) {
    case "10":
      return "1학기";
    case "20":
      return "2학기";
    case "30":
      return "여름학기";
    case "40":
      return "겨울학기";
    default:
      return `${tmGbn}학기`;
  }
}

/**
 * 이수구분 코드 한글 변환
 */
export function formatCourseType(cptnGbn: string): string {
  switch (cptnGbn) {
    case "10":
      return "교양필수";
    case "11":
      return "단과대교양";
    case "20":
    case "21":
    case "23":
    case "25":
      return "교양선택";
    case "30":
    case "31":
      return "전공필수";
    case "40":
    case "41":
      return "전공선택";
    case "50":
      return "일반선택";
    case "60":
      return "교직";
    default:
      return "기타";
  }
}

/**
 * findTlsnAplyDetaCtntList.do (개인학적조회 수강탭) 응답 SSV 파싱
 */
export function parseTlsnTimetableList(responseBody: string): TimetableCourseItem[] {
  let ssv = responseBody;
  if (responseBody.startsWith("{")) {
    try {
      const envelope = JSON.parse(responseBody);
      if (envelope.timetableSsv) ssv = envelope.timetableSsv;
      else if (envelope.ssv) ssv = envelope.ssv;
    } catch {}
  }

  if (!ssv || !ssv.includes("ErrorCode:int=0")) {
    return [];
  }

  let rows: Record<string, string>[] = [];
  try {
    // 개인학적조회 수강탭 데이터셋은 DS_COUR760V2
    rows = parseRows(ssv, "DS_COUR760V2");
  } catch (err: any) {
    // Fallback: 기존 DS_LIST
    try {
      rows = parseRows(ssv, "DS_LIST");
    } catch {
      return [];
    }
  }

  return rows.map((row) => {
    const timeInfoRaw = row["suupTime"] || row["timeInfo"] || "";
    const status = (row["delGbn"] || "신청").trim();
    return {
      courseName: (row["scNm"] || "").trim(),
      courseCode: (row["haksuNo"] || "").trim(),
      credits: (row["hp"] || "0").trim(),
      professorName: (row["profEmpNm"] || row["profNm"] || "").trim(),
      courseType: formatCourseType((row["cptnGbn"] || "").trim()),
      departmentName: (row["deptClsfNm"] || row["openHgMjNm"] || "").trim(),
      targetGrade: (row["hySeqGbn"] || row["openHySeqGbn"] || "").trim(),
      lessonType: (row["lsnTypeGbn"] || "").trim(),
      timeInfoRaw,
      timeSlots: parseTimeInfo(timeInfoRaw),
      year: (row["yy"] || "").trim(),
      semester: (row["tmGbn"] || "").trim(),
      status,
      rawFields: row,
    };
  });
}

/**
 * 종합 학적·성적·장학·시간표 데이터 파싱
 */
export function parseFullAcademicReport(payload: any): FullAcademicReport {
  let envelope: any = payload;
  if (typeof payload === "string") {
    try {
      envelope = JSON.parse(payload);
    } catch {
      envelope = { ssv: payload };
    }
  }

  const timetableSsv = envelope.timetableSsv || envelope.ssv || "";
  const semGradesSsv = envelope.semesterGradesSsv || "";
  const crsGradesSsv = envelope.courseGradesSsv || "";
  const creditSsv = envelope.creditSummarySsv || "";
  const tmCntSsv = envelope.semesterCountSsv || "";
  const scalSsv = envelope.scholarshipSsv || "";
  const grdtSsv = envelope.graduationSsv || "";

  // 1. 시간표
  const timetable = parseTlsnTimetableList(timetableSsv);

  // 2. 학기별 성적 (DS_SCOR400V)
  let semesterGrades: SemesterGradeItem[] = [];
  try {
    if (semGradesSsv) {
      const rows = parseRows(semGradesSsv, "DS_SCOR400V");
      semesterGrades = rows.map((r) => {
        const yy = r["yy"] || "";
        const tm = r["tmGbn"] || "";
        return {
          year: yy,
          semester: tm,
          semesterName: `${yy}년 ${formatTmGbn(tm)}`,
          targetGrade: r["hySeqGbn"] ? `${r["hySeqGbn"]}학년` : "",
          appliedCredits: (r["aplyHp"] || "0").trim(),
          acquiredCredits: (r["acqHp"] || "0").trim(),
          averageScore: (r["avgMrks"] || "0.0").trim(),
          percentage: (r["percentage"] || "0.0").trim(),
          rank: (r["totRank"] || "").trim(),
          departmentRank: (r["deptClsfRank"] || "").trim(),
          cumulativeAppliedCredits: (r["sumAplyHp"] || "0").trim(),
          cumulativeAcquiredCredits: (r["sumAcqHp"] || "0").trim(),
          cumulativeAverageScore: (r["sumMrksAvg"] || "0.0").trim(),
          cumulativePercentage: (r["sumPercent"] || "0.0").trim(),
          isAcademicWarning: r["schaffWarnYn"] === "1",
        };
      });
    }
  } catch (e) {
    console.warn("Failed to parse semester grades:", e);
  }

  // 3. 과목별 성적 (DS_SCOR300V1)
  let courseGrades: CourseGradeItem[] = [];
  try {
    if (crsGradesSsv) {
      const rows = parseRows(crsGradesSsv, "DS_SCOR300V1");
      courseGrades = rows.map((r) => {
        const yy = r["yy"] || "";
        const tm = r["tmGbn"] || "";
        const cptn = (r["cptnGbn"] || "").trim();
        const grade = (r["mrksGrdGbn"] || "").trim();
        const score = (r["mrks"] || "").trim().replace(/\x03/g, "");
        return {
          year: yy,
          semester: tm,
          semesterName: `${yy}년 ${formatTmGbn(tm)}`,
          courseCode: (r["scCd"] || "").trim(),
          courseName: (r["scNm"] || "").trim(),
          courseNameEng: (r["scNmEng"] || "").trim(),
          courseType: cptn,
          courseTypeName: formatCourseType(cptn),
          credits: (r["hp"] || "0").trim(),
          grade,
          score,
          isRetake: r["repeatYn"] === "Y" || r["repeatYn"] === "1",
          isPassed: grade !== "F" && grade !== "NP" && grade !== "FA",
        };
      });
    }
  } catch (e) {
    console.warn("Failed to parse course grades:", e);
  }

  // 4. 이수구분별 취득학점 (DS_SCOR300V2 & DS_TMCNT)
  let creditSummary: CreditSummary = {
    totalCredits: "0",
    standardTotalCredits: "0",
    majorCredits: "0",
    majorCoreCredits: "0",
    majorDeepCredits: "0",
    generalCredits: "0",
    generalRequiredCredits: "0",
    collegeGeneralCredits: "0",
    completedSemesterCount: "0",
  };

  try {
    if (creditSsv) {
      const rows = parseRows(creditSsv, "DS_SCOR300V2");
      if (rows.length > 0) {
        const r = rows[0];
        creditSummary.totalCredits = (r["scoTot"] || r["hpTot"] || "0").trim();
        creditSummary.standardTotalCredits = (r["detmTot"] || "0").trim();
        creditSummary.majorCredits = (r["scoMj"] || "0").trim();
        creditSummary.majorCoreCredits = (r["scoCore"] || "0").trim();
        creditSummary.majorDeepCredits = (r["scoDeep"] || "0").trim();
        creditSummary.generalCredits = (r["scoCul"] || "0").trim();
        creditSummary.generalRequiredCredits = (r["sco10"] || "0").trim();
        creditSummary.collegeGeneralCredits = (r["sco11"] || "0").trim();
      }
    }
    if (tmCntSsv) {
      const rows = parseRows(tmCntSsv, "DS_TMCNT");
      if (rows.length > 0) {
        creditSummary.completedSemesterCount = (rows[0]["allTmCnt"] || "").trim();
      }
    }
  } catch (e) {
    console.warn("Failed to parse credit summary:", e);
  }

  // 5. 교양 영역별 이수 현황 (DS_SCOR300V3)
  let generalEducationAreas: GeneralEducationAreaItem[] = [];
  try {
    if (creditSsv) {
      const rows = parseRows(creditSsv, "DS_SCOR300V3");
      generalEducationAreas = rows.map((r) => {
        const acquired = Number(r["hp"] || 0);
        const standard = Number(r["detmHp"] || 0);
        return {
          areaName: (r["cptnFldGbnNm"] || "").trim(),
          courseTypeName: (r["cptnGbnNm"] || "").trim(),
          acquiredCredits: String(acquired),
          standardCredits: String(standard),
          isSatisfied: standard > 0 ? acquired >= standard : acquired > 0,
        };
      });
    }
  } catch (e) {
    console.warn("Failed to parse GE areas:", e);
  }

  // 6. 장학금 수혜 내역 (DS_ENRO020)
  let scholarships: ScholarshipItem[] = [];
  let totalScholarshipAmount = 0;
  try {
    if (scalSsv) {
      const rows = parseRows(scalSsv, "DS_ENRO020");
      scholarships = rows.map((r) => {
        const sumAmt = parseInt(r["sumAmt"] || "0", 10) || 0;
        const tuitAmt = parseInt(r["tuitAmt"] || "0", 10) || 0;
        const entrAmt = parseInt(r["entrAmt"] || "0", 10) || 0;
        const yy = r["yy"] || "";
        const tm = r["tmGbn"] || "";
        totalScholarshipAmount += sumAmt;
        return {
          year: yy,
          semester: tm,
          semesterName: `${yy}년 ${formatTmGbn(tm)}`,
          scholarshipName: (r["scalAmtNm"] || "").trim(),
          amount: sumAmt,
          tuitionAmount: tuitAmt,
          entranceAmount: entrAmt,
          paymentMethod: r["payMthdGbn"] === "1" ? "등록금 감면" : "계좌 지급",
        };
      });
    }
  } catch (e) {
    console.warn("Failed to parse scholarships:", e);
  }

  // 7. 졸업 요건 (DS_GRDT504)
  let graduation: GraduationRequirement | null = null;
  try {
    if (grdtSsv) {
      const rows = parseRows(grdtSsv, "DS_GRDT504");
      if (rows.length > 0) {
        const r = rows[0];
        graduation = {
          passFlag: (r["passFlag"] || "").trim(),
          graduationYear: (r["grdtYy"] || "").trim(),
          graduationDate: formatNexacroDate(r["grdtDt"]),
          englishTestPassed: Boolean(r["engVldScGbnNm"]),
          thesisPassed: Boolean(r["thssApprRsltCtnt"]),
          degreeName: (r["degrNm"] || "").trim(),
        };
      }
    }
  } catch (e) {
    console.warn("Failed to parse graduation:", e);
  }

  return {
    studentId: envelope.studentId || "",
    semesterGrades,
    courseGrades,
    creditSummary,
    generalEducationAreas,
    scholarships,
    totalScholarshipAmount,
    graduation,
    timetable,
  };
}

// ---------------------------------------------------------------------------
// 8. 생활원 사생정보조회 (Dormitory Student Info)
// ---------------------------------------------------------------------------

export interface DormitoryPointItem {
  date: string;
  type: "MERIT" | "DEMERIT";
  typeName: string;
  points: number;
  reason: string;
}

export interface DormitoryStudentProfile {
  name: string; // 성명 (nm)
  englishName: string; // 성명(영문) (engNm)
  gender: string; // 성별 (genGbn)
  nationality: string; // 국적 (natGbn)
  department: string; // 학부(과)/부서 (deptNm)
  grade: string; // 학년구분 (hySeqGbn)
  dormitoryType: string; // 기숙사구분 (dormGbn)
  dormitoryBuilding: string; // 기숙사건물구분 (dormBdNm || dormBdCd)
  studentDormNo: string; // 사생번호 (domstuNo)
  phoneNumber: string; // 휴대전화번호 (handpNo)
  email: string; // 이메일 (email)
  zipCode: string; // 우편번호 (zipNo)
  address: string; // 거주지 기본주소 (addr)
  detailedAddress: string; // 거주지 상세주소 (detaAddr)
  meritPoints: string; // 상점 (ardScr1)
  demeritPoints: string; // 일반벌점 (ardScr2)
  nonOffsetDemeritPoints: string; // 상세불가/상쇄불가벌점 (ardScr3)
  year: string; // 연도 (yy)
  term: string; // 학기 (tmGbn)
  studentId: string; // 학번 (persNo)
  photoBase64?: string; // 프로필 사진 (phtFile, phtFile2)
  // 확장 학적 및 인적사항 필드
  professorName?: string; // 지도교수 (profNm)
  averageScore?: string; // 평점평균 (mrksAvg)
  completedCredits?: string; // 총 이수학점 / 이수학기 (cptnTmNm)
  entranceDate?: string; // 입학일자 (entrDt)
  academicStatus?: string; // 학적상태 (schregStGbn)
  expectedGraduation?: string; // 졸업예정여부 (grdtExpcYn)
  maskedRrn?: string; // 주민등록번호 마스킹 (rrn)
  rawFields: Record<string, string>;
}

export interface DormitoryAddressItem {
  zipCode: string;
  address: string;
  detailedAddress: string;
  guardianPhone: string;
  year?: string;
  term?: string;
  rawFields: Record<string, string>;
}

export interface DormitoryRewardItem {
  type: string; // 구분 (dormArdGbn)
  name: string; // 상벌점명 (ardNm)
  reason: string; // 사유 (ardResn)
  score: string; // 점수 (ardScr)
  imposedDate: string; // 일자 (impsDttm)
  offsetPossible?: string;
  isFixed?: string;
  rawFields: Record<string, string>;
}

export interface DormitoryInOutItem {
  year: string;
  term: string;
  dormitoryType: string;
  studentDormNo: string;
  checkInDate: string;
  checkOutDate: string;
  status: string; // 입퇴사구분 (dormLeavdormGbn)
  rawFields: Record<string, string>;
}

export interface DormitoryApplyItem {
  year: string;
  term: string;
  applyType: string;
  passStatus?: string;
  applyDate: string;
  periodStart: string;
  periodEnd: string;
  rawFields: Record<string, string>;
}

export interface DormitoryPaymentItem {
  year: string;
  term: string;
  dormitoryType?: string;
  type: string; // 등록/환불구분 (gbn)
  amount: string; // 금액 (totAmt)
  date: string; // 처리일자 (dormDt)
  dormFee?: string; // 관리비/기숙사비 (dormFee)
  mealFee?: string; // 식비 (mealFee)
  depositFee?: string; // 보증금 (dpsFee)
  bankName?: string; // 은행명 (bankNm)
  accountNumber?: string; // 계좌번호 (acctNo)
  rawFields: Record<string, string>;
}

export interface DormitoryUtilityItem {
  useMonth: string; // 사용월 (useMm)
  electricUsage: string; // elQty
  electricFee: string; // elFee
  waterUsage: string; // wtrwkQty
  waterFee: string; // wtrwkFee
  hotWaterUsage: string; // hotwatQty
  heatingUsage: string; // heatQty
  subtotalFee: string; // subTotFee
  totalFee: string; // totFee
  facilityFee: string; // instRepartFee
  prevElectricIndex?: string; // 전월 전기 지침 (prvmmElIndc)
  currElectricIndex?: string; // 당월 전기 지침 (thmmElIndc)
  prevWaterIndex?: string; // 전월 수도 지침 (prvmmWtrwkIndc)
  currWaterIndex?: string; // 당월 수도 지침 (thmmWtrwkIndc)
  virtualAccount?: string; // 가상계좌 (virAcctNo)
  paymentDueDate?: string; // 납부기한 (payDd)
  paymentStatus?: string; // 납부여부 (payYn)
  rawFields: Record<string, string>;
}

export interface DormitoryPledgeItem {
  studentInfo: string;
  consentStatus: string;
  consentDate?: string;
  documentContent?: string;
  rawFields: Record<string, string>;
}

export interface DormitoryStudentInfo {
  profile: DormitoryStudentProfile | null;
  addressList: DormitoryAddressItem[];
  rewardList: DormitoryRewardItem[];
  inOutList: DormitoryInOutItem[];
  applyList: DormitoryApplyItem[];
  paymentList: DormitoryPaymentItem[];
  utilityList: DormitoryUtilityItem[];
  pledge: DormitoryPledgeItem | null;
  hasData: boolean;
  rawDatasets: Record<string, Record<string, string>[]>;

  // 하위 호환용 레거시 필드
  studentId?: string;
  studentName?: string;
  dormitoryBuilding?: string;
  roomNumber?: string;
  bedNumber?: string;
  roomType?: string;
  checkInDate?: string;
  checkOutDate?: string;
  status?: string;
  mealType?: string;
  meritPoints?: number;
  demeritPoints?: number;
  totalPoints?: number;
  pointsList?: DormitoryPointItem[];
  appliedYear?: string;
  appliedSemester?: string;
  photoBase64?: string;
  rawFields?: Record<string, string>;
}

/**
 * 생활원 사생정보조회(학생) SSV 패킷 및 7개 탭 데이터 파서
 * 데이터가 없을 때는 임의의 가짜 값(구라핑)을 채우지 않고 null 또는 빈 배열을 반환합니다.
 */
export function parseDormitoryStudentInfo(
  payload: string | Record<string, any>
): DormitoryStudentInfo {
  let combinedSsv = "";
  if (typeof payload === "string") {
    combinedSsv = payload;
  } else if (payload && typeof payload === "object") {
    // 배치 응답 또는 각 키별 ssv 취합
    const parts: string[] = [];
    for (const key of Object.keys(payload)) {
      const val = payload[key];
      if (typeof val === "string" && val.includes("Dataset:")) {
        parts.push(val);
      }
    }
    combinedSsv = parts.join("\x1e");
  }

  // payload가 이미 파싱된 객체 형태({ studentId, rawFields: ... })인 경우 fallback
  if (
    payload &&
    typeof payload === "object" &&
    !combinedSsv &&
    (payload.rawFields || payload.studentId || payload.studentName)
  ) {
    const rf = payload.rawFields || {};
    const photo = rf["phtFile2"] || rf["phtFile"] || payload.photoBase64 || "";
    const prof: DormitoryStudentProfile = {
      name: payload.studentName || rf["korNm"] || rf["nm"] || "",
      englishName: rf["engNm"] || "",
      gender: rf["genGbn"] || "",
      nationality: rf["natGbn"] || "",
      department: payload.departmentName || rf["deptNm"] || "",
      grade: rf["hySeqGbn"] || "",
      dormitoryType: payload.dormitoryBuilding || rf["dormGbn"] || "",
      dormitoryBuilding: payload.dormitoryBuilding || rf["dormBdNm"] || "",
      studentDormNo: rf["domstuNo"] || "",
      phoneNumber: rf["handpNo"] || "",
      email: rf["email"] || "",
      zipCode: rf["zipNo"] || "",
      address: rf["addr"] || "",
      detailedAddress: rf["detaAddr"] || "",
      meritPoints: String(payload.meritPoints ?? rf["ardScr1"] ?? "0"),
      demeritPoints: String(payload.demeritPoints ?? rf["ardScr2"] ?? "0"),
      nonOffsetDemeritPoints: rf["ardScr3"] || "0",
      year: payload.appliedYear || rf["yy"] || "",
      term: payload.appliedSemester || rf["tmGbn"] || "",
      studentId: payload.studentId || rf["persNo"] || rf["stuno"] || "",
      photoBase64: photo || undefined,
      rawFields: rf,
    };
    return {
      profile: prof,
      addressList: payload.addressList || [],
      rewardList: payload.rewardList || [],
      inOutList: payload.inOutList || [],
      applyList: payload.applyList || [],
      paymentList: payload.paymentList || [],
      utilityList: payload.utilityList || [],
      pledge: payload.pledge || null,
      hasData: true,
      rawDatasets: {},
      studentId: prof.studentId,
      studentName: prof.name,
      dormitoryBuilding: prof.dormitoryBuilding,
      roomNumber: payload.roomNumber || "",
      bedNumber: payload.bedNumber || "",
      roomType: payload.roomType || "",
      checkInDate: payload.checkInDate || "",
      checkOutDate: payload.checkOutDate || "",
      status: payload.status || "",
      mealType: payload.mealType || "",
      meritPoints: Number(prof.meritPoints) || 0,
      demeritPoints: Number(prof.demeritPoints) || 0,
      totalPoints: (Number(prof.meritPoints) || 0) - (Number(prof.demeritPoints) || 0),
      pointsList: payload.pointsList || [],
      appliedYear: prof.year,
      appliedSemester: prof.term,
      photoBase64: photo || undefined,
      rawFields: rf,
    };
  }

  const datasets = parseNexacroDatasets(combinedSsv);

  // 1. 상단 기본 사생정보 (DS_DMTY209, DS_DMSD_INFO, DS_BASE_SCHREG_INFO 등 포괄)
  let mainRows =
    datasets["DS_DMTY209"] ||
    datasets["DS_DMSD_INFO"] ||
    datasets["DS_DORM_INFO"] ||
    datasets["DS_INFO"] ||
    datasets["DS_BASE_SCHREG_INFO"] ||
    datasets["DS_SCHREG"] ||
    datasets["DS_MAIN"] ||
    [];

  // 만약 지정된 키로 못 찾았으면 stuno/korNm/nm/persNo가 있는 데이터셋 탐색
  if (mainRows.length === 0) {
    for (const dsName of Object.keys(datasets)) {
      const rows = datasets[dsName];
      if (rows && rows.length > 0) {
        const candidate = rows[0];
        if (
          candidate["stuno"] ||
          candidate["korNm"] ||
          candidate["nm"] ||
          candidate["persNo"] ||
          candidate["roomNo"] ||
          candidate["dormRoomNo"]
        ) {
          mainRows = rows;
          break;
        }
      }
    }
  }

  // 그래도 없으면 데이터가 있는 첫 데이터셋 사용
  if (mainRows.length === 0) {
    for (const dsName of Object.keys(datasets)) {
      if (datasets[dsName].length > 0) {
        mainRows = datasets[dsName];
        break;
      }
    }
  }

  let profile: DormitoryStudentProfile | null = null;
  let legacyRoomNo = "";
  let legacyBedNo = "";
  let legacyRoomType = "";
  let legacyMealType = "";
  let legacyCheckInDt = "";
  let legacyCheckOutDt = "";

  if (mainRows.length > 0) {
    const row = mainRows[0];
    legacyRoomNo = (row["roomNo"] || row["dormRoomNo"] || "").trim();
    legacyBedNo = (row["bedNo"] || row["dormBedNo"] || "").trim();
    legacyRoomType = (row["roomTypeNm"] || row["roomType"] || "").trim();
    legacyMealType = (row["mealTypeNm"] || row["mealType"] || "").trim();
    legacyCheckInDt = (row["entyDt"] || row["inDt"] || row["entrDt"] || "").trim();
    legacyCheckOutDt = (row["leavDt"] || row["outDt"] || "").trim();

    const rawPhoto =
      row["phtFile"] ||
      row["phtFile2"] ||
      row["photo"] ||
      row["pic"] ||
      datasets["DS_PIC"]?.[0]?.["phtFile"] ||
      datasets["DS_DMTY206"]?.[0]?.["phtFile"] ||
      "";

    // 학적 데이터셋(DS_BASE_SCHREG_INFO)이 함께 수신된 경우 인적사항 보완
    const schregRows = datasets["DS_BASE_SCHREG_INFO"] || datasets["DS_SCHREG"] || [];
    const schregRow = schregRows[0] || {};

    // 유효한 행인지 확인 (성명, 학번, 또는 건물코드 등이 하나라도 존재하는지)
    if (
      row["nm"] ||
      row["korNm"] ||
      row["persNo"] ||
      row["stuno"] ||
      row["domstuNo"] ||
      row["deptNm"] ||
      row["hgNm"] ||
      row["dmtyNm"] ||
      row["dormBdNm"] ||
      schregRow["korNm"] ||
      schregRow["stuno"]
    ) {
      profile = {
        name: (row["nm"] || row["korNm"] || row["studNm"] || schregRow["korNm"] || "").trim(),
        englishName: (row["engNm"] || schregRow["engNm"] || "").trim(),
        gender: (row["genGbn"] || schregRow["genGbn"] || "").trim(),
        nationality: (row["natGbn"] || schregRow["natGbn"] || "").trim(),
        department: (row["deptNm"] || row["hgNm"] || schregRow["deptNm"] || schregRow["hgNm"] || "").trim(),
        grade: (row["hySeqGbn"] || schregRow["hySeqGbn"] || "").trim(),
        dormitoryType: (row["dormGbn"] || "").trim(),
        dormitoryBuilding: (row["dormBdNm"] || row["dormBdCd"] || row["dmtyNm"] || row["domNm"] || "").trim(),
        studentDormNo: (row["domstuNo"] || row["domStuNo"] || "").trim(),
        phoneNumber: (row["handpNo"] || row["hpNo"] || schregRow["handpNo"] || "").trim(),
        email: (row["email"] || schregRow["email"] || "").trim(),
        zipCode: (row["zipNo"] || schregRow["zipNo"] || "").trim(),
        address: (row["addr"] || schregRow["addr"] || "").trim(),
        detailedAddress: (row["detaAddr"] || schregRow["detaAddr"] || "").trim(),
        meritPoints: (row["ardScr1"] || row["rwrdScore"] || row["meritPnt"] || "0").trim(),
        demeritPoints: (row["ardScr2"] || row["pnshScore"] || row["demeritPnt"] || "0").trim(),
        nonOffsetDemeritPoints: (row["ardScr3"] || "0").trim(),
        year: (row["yy"] || schregRow["yy"] || "").trim(),
        term: (row["tmGbnNm"] || row["tmGbn"] || schregRow["tmGbn"] || "").trim(),
        studentId: (row["persNo"] || row["stuno"] || row["studNo"] || schregRow["stuno"] || "").trim(),
        photoBase64: rawPhoto || schregRow["phtFile2"] || schregRow["phtFile"] || undefined,
        professorName: (row["profNm"] || schregRow["profNm"] || "").trim(),
        averageScore: (row["mrksAvg"] || schregRow["mrksAvg"] || "").trim(),
        completedCredits: (row["cptnTmNm"] || schregRow["cptnTmNm"] || "").trim(),
        entranceDate: (row["entrDt"] || schregRow["entrDt"] || "").trim(),
        academicStatus: (row["schregStGbn"] || schregRow["schregStGbn"] || "").trim(),
        expectedGraduation: (row["grdtExpcYn"] || schregRow["grdtExpcYn"] || "").trim(),
        maskedRrn: (row["rrn"] || schregRow["rrn"] || "").trim(),
        rawFields: Object.assign({}, schregRow, row),
      };
    }
  }

  // 2. 탭 1 (주소사항: DS_DMTY209_TAB01)
  const tab01Rows = datasets["DS_DMTY209_TAB01"] || [];
  const addressList: DormitoryAddressItem[] = tab01Rows
    .filter((r) => r["addr"] || r["zipNo"] || r["guardPsnHandpNo"])
    .map((r) => ({
      zipCode: (r["zipNo"] || "").trim(),
      address: (r["addr"] || "").trim(),
      detailedAddress: (r["detaAddr"] || "").trim(),
      guardianPhone: (r["guardPsnHandpNo"] || "").trim(),
      year: (r["yy"] || "").trim(),
      term: (r["tmGbn"] || "").trim(),
      rawFields: r,
    }));

  // 3. 탭 2 (상벌점이력: DS_DMTY209_TAB02 및 레거시 DS_POINT_LIST)
  const tab02Rows = datasets["DS_DMTY209_TAB02"] || datasets["DS_POINT_LIST"] || [];
  const rewardList: DormitoryRewardItem[] = tab02Rows
    .filter((r) => r["ardNm"] || r["ardScr"] || r["impsDttm"] || r["pointGbnNm"] || r["pointVal"])
    .map((r) => ({
      type: (r["dormArdGbn"] || r["pointGbnNm"] || "").trim(),
      name: (r["ardNm"] || r["pointGbnNm"] || "").trim(),
      reason: (r["ardResn"] || r["rsn"] || "").trim(),
      score: (r["ardScr"] || r["pointVal"] || "0").trim(),
      imposedDate: (r["impsDttm"] || r["pointDt"] || "").trim(),
      offsetPossible: (r["dormOffstPosbGbn"] || "").trim(),
      isFixed: (r["fxdYn"] || "").trim(),
      rawFields: r,
    }));

  // 4. 탭 3 (입퇴사이력: DS_DMTY209_TAB03)
  const tab03Rows = datasets["DS_DMTY209_TAB03"] || [];
  const inOutList: DormitoryInOutItem[] = tab03Rows
    .filter((r) => r["joinCoDt"] || r["dormLeavdormDt"] || r["domstuNo"])
    .map((r) => ({
      year: (r["yy"] || "").trim(),
      term: (r["tmGbn"] || "").trim(),
      dormitoryType: (r["dormGbn"] || "").trim(),
      studentDormNo: (r["domstuNo"] || "").trim(),
      checkInDate: (r["joinCoDt"] || "").trim(),
      checkOutDate: (r["dormLeavdormDt"] || "").trim(),
      status: (r["dormLeavdormGbn"] || "").trim(),
      rawFields: r,
    }));

  // 5. 탭 4 (신청이력: DS_DMTY209_TAB04)
  const tab04Rows = datasets["DS_DMTY209_TAB04"] || [];
  const applyList: DormitoryApplyItem[] = tab04Rows
    .filter((r) => r["aplyDt"] || r["dormJoinGbn"] || r["frDttm"])
    .map((r) => ({
      year: (r["yy"] || "").trim(),
      term: (r["tmGbn"] || "").trim(),
      applyType: (r["dormJoinGbn"] || "").trim(),
      passStatus: (r["dormPassGbn"] || "").trim(),
      applyDate: (r["aplyDt"] || "").trim(),
      periodStart: (r["frDttm"] || "").trim(),
      periodEnd: (r["toDttm"] || "").trim(),
      rawFields: r,
    }));

  // 6. 탭 5 (등록/환불이력: DS_DMTY209_TAB05)
  const tab05Rows = datasets["DS_DMTY209_TAB05"] || [];
  const paymentList: DormitoryPaymentItem[] = tab05Rows
    .filter((r) => r["totAmt"] || r["dormDt"] || r["gbn"])
    .map((r) => ({
      year: (r["yy"] || "").trim(),
      term: (r["tmGbn"] || "").trim(),
      dormitoryType: (r["dormGbn"] || "").trim(),
      type: (r["gbn"] || "").trim(),
      amount: (r["totAmt"] || "0").trim(),
      date: (r["dormDt"] || "").trim(),
      dormFee: (r["dormFee"] || "").trim(),
      mealFee: (r["mealFee"] || "").trim(),
      depositFee: (r["dpsFee"] || "").trim(),
      bankName: (r["bankNm"] || "").trim(),
      accountNumber: (r["acctNo"] || "").trim(),
      rawFields: r,
    }));

  // 7. 탭 6 (공공요금 부과내역: DS_DMTY209_TAB07)
  const tab07Rows = datasets["DS_DMTY209_TAB07"] || [];
  const utilityList: DormitoryUtilityItem[] = tab07Rows
    .filter((r) => r["useMm"] || r["totFee"] || r["subTotFee"])
    .map((r) => ({
      useMonth: (r["useMm"] || "").trim(),
      electricUsage: (r["elQty"] || "0").trim(),
      electricFee: (r["elFee"] || "0").trim(),
      waterUsage: (r["wtrwkQty"] || "0").trim(),
      waterFee: (r["wtrwkFee"] || "0").trim(),
      hotWaterUsage: (r["hotwatQty"] || "0").trim(),
      heatingUsage: (r["heatQty"] || "0").trim(),
      subtotalFee: (r["subTotFee"] || "0").trim(),
      totalFee: (r["totFee"] || "0").trim(),
      facilityFee: (r["instRepartFee"] || "0").trim(),
      prevElectricIndex: (r["prvmmElIndc"] || "").trim(),
      currElectricIndex: (r["thmmElIndc"] || "").trim(),
      prevWaterIndex: (r["prvmmWtrwkIndc"] || "").trim(),
      currWaterIndex: (r["thmmWtrwkIndc"] || "").trim(),
      virtualAccount: (r["virAcctNo"] || "").trim(),
      paymentDueDate: (r["payDd"] || "").trim(),
      paymentStatus: (r["payYn"] || "").trim(),
      rawFields: r,
    }));

  // 8. 탭 7 (입사서약서: DS_DATA)
  const pledgeRows = datasets["DS_DATA"] || [];
  let pledge: DormitoryPledgeItem | null = null;
  if (pledgeRows.length > 0) {
    const pr = pledgeRows[0];
    if (pr["stuInfo"] || pr["consntYn"] || pr["docCtnt"]) {
      pledge = {
        studentInfo: (pr["stuInfo"] || "").trim(),
        consentStatus: (pr["consntYn"] || "").trim(),
        consentDate: (pr["consntDt"] || "").trim(),
        documentContent: (pr["docCtnt"] || "").trim(),
        rawFields: pr,
      };
    }
  }

  // 레거시 상벌점 목록 호환
  const pointsList: DormitoryPointItem[] = rewardList.map((rw) => ({
    date: rw.imposedDate,
    type: rw.type.includes("벌점") || parseInt(rw.score, 10) < 0 ? "DEMERIT" : "MERIT",
    typeName: rw.type || "상벌점",
    points: Math.abs(parseInt(rw.score, 10) || 0),
    reason: rw.reason || rw.name || "상벌점",
  }));

  const mPts = profile ? parseInt(profile.meritPoints, 10) || 0 : 0;
  const dmPts = profile ? parseInt(profile.demeritPoints, 10) || 0 : 0;
  const hasData = Boolean(
    profile !== null ||
    addressList.length > 0 ||
    rewardList.length > 0 ||
    inOutList.length > 0 ||
    applyList.length > 0 ||
    paymentList.length > 0 ||
    utilityList.length > 0 ||
    pledge !== null
  );

  return {
    profile,
    addressList,
    rewardList,
    inOutList,
    applyList,
    paymentList,
    utilityList,
    pledge,
    hasData,
    rawDatasets: datasets,

    // 하위 호환 필드
    studentId: profile?.studentId || (mainRows[0]?.["stuno"] || mainRows[0]?.["persNo"] || "").trim(),
    studentName: profile?.name || (mainRows[0]?.["korNm"] || mainRows[0]?.["nm"] || "").trim(),
    dormitoryBuilding: profile?.dormitoryBuilding || (mainRows[0]?.["dormBdNm"] || mainRows[0]?.["dmtyNm"] || "").trim(),
    roomNumber: legacyRoomNo,
    bedNumber: legacyBedNo,
    roomType: legacyRoomType,
    checkInDate: legacyCheckInDt || inOutList[0]?.checkInDate || (mainRows[0]?.["entrDt"] || "").trim(),
    checkOutDate: legacyCheckOutDt || inOutList[0]?.checkOutDate || "",
    status: inOutList[0]?.status || (profile?.dormitoryBuilding ? "사생" : "거주"),
    mealType: legacyMealType,
    meritPoints: mPts,
    demeritPoints: dmPts,
    totalPoints: mPts - dmPts,
    pointsList,
    appliedYear: profile?.year || (mainRows[0]?.["yy"] || "").trim(),
    appliedSemester: profile?.term || (mainRows[0]?.["tmGbn"] || "").trim(),
    photoBase64: profile?.photoBase64 || (mainRows[0]?.["phtFile2"] || mainRows[0]?.["phtFile"] || undefined),
    rawFields: profile?.rawFields || mainRows[0] || {},
  };
}




