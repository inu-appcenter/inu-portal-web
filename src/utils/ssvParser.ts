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
