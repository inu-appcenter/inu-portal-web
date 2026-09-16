import tokenInstance from "@/apis/tokenInstance";
import { StudentInfo, StudentInfoResponse } from "@/types/portal";
import { AcademicInfoData } from "@/apis/mobileAgentBridge";

/**
 * 모바일 앱 브릿지에서 반환된 AcademicInfoData를 StudentInfo 형식으로 변환합니다.
 */
export function adaptAcademicInfoToStudentInfo(data: AcademicInfoData): StudentInfo {
  const raw = data.rawFields || {};
  const display = data.displayFields || {};

  return {
    studentId: data.studentId || raw.stuno || "",
    koreanName: data.koreanName || raw.korNm || "",
    englishName: (data as any).englishName || raw.engNm || "",
    genderCode: raw.genGbn || "",
    genderName:
      (data as any).genderName ||
      (data as any).gender ||
      display["성별"] ||
      (raw.genGbn === "1" ? "남" : raw.genGbn === "2" ? "여" : ""),
    birthDate: (data as any).birthDate || raw.birthDt || display["생년월일"] || "",
    mobilePhone: (data as any).mobilePhone || raw.handpNo || display["휴대전화"] || "",
    nationalityCode: raw.natGbn || "",
    nationalityName: (data as any).nationalityName || display["국적"] || "",
    residentRegistrationNumberMasked: display["주민등록번호(마스킹)"] || "******-*******",

    enrollmentStatusCode: raw.schregStGbn || "",
    enrollmentStatusName: data.enrollmentStatus || display["학적 상태"] || "재학",
    courseCode: raw.corsGbn || "",
    courseName: (data as any).courseName || display["과정"] || "학사",
    collegeGroupCode: raw.colgGrscCd || "",
    collegeGroupName: "",
    collegeCode: raw.colgCd || "",
    collegeName: data.collegeName || display["단과대"] || null,
    departmentCode: (data as any).departmentCode || raw.deptCd || "",
    departmentName: data.departmentName || display["학과"] || null,
    majorCode: (data as any).majorCode || raw.hgMjCd || "",
    majorName: (data as any).majorName || data.departmentName || null,
    advisorProfessorName: data.advisorProfessorName || display["지도교수"] || "",

    entranceDate: (data as any).entranceDate || raw.entrDt || display["입학일"] || "",
    entranceClassificationCode: raw.entrClsfGbn || "",
    entranceClassificationName: (data as any).entranceClassification || display["입학 구분"] || "",
    entranceTypeCode: raw.entrGbn || "",
    entranceTypeName: (data as any).entranceType || display["입학 전형"] || "",
    latestEnrollmentChangeCode: raw.flSchregModGbn || "",
    latestEnrollmentChangeName: (data as any).latestEnrollmentChange || display["최근 학적 변동"] || "",
    latestEnrollmentChangeDate: (data as any).latestEnrollmentChangeDate || raw.flSchregModDt || display["학적 변동일"] || "",

    semesterSequenceCode: raw.hySeqGbn || "",
    semesterSequenceName: display["학기"] || "",
    completedSemesterCode: (data as any).completedSemesterCode || raw.cnpassHySeqGbn || "",
    completedSemesterName: (data as any).completedSemesterName || raw.cptnTmNm || display["이수 학기명"] || "",
    completedSemesterCount: (data as any).completedSemesterCount
      ? String((data as any).completedSemesterCount).replace("학기", "").trim()
      : (raw.mrksCptnTmCnt || ""),
    acquiredCredits: String(data.acquiredCredits || raw.acqHp || "0").trim(),
    gradeAverage: String(data.gradeAverage || raw.mrksAvg || "0.0").trim(),

    militaryStatusCode: raw.milFinishGbn || "",
    militaryStatusName: (data as any).militaryStatusName || display["병역 상태"] || null,
    readmissionYn: raw.readmiYn === "1" ? "1" : "0",
    earlyGraduationYn: raw.earlyGrdtYn === "1" ? "1" : "0",
    graduationExpectedYn: raw.grdtExpcYn === "1" ? "1" : "0",
    bcrmstConnectionYn: raw.bcrmstConnYn === "1" ? "1" : "0",
    capacityIoCode: raw.capaIoGbn || "",
    capacityIoName: (data as any).capacityIoName || display["정원 내외 구분"] || "",
    skillStandardCode: raw.skilStdGbn || "",
    skillStandardName: (data as any).skillStandardName || display["특기 기준"] || "",
  };
}

// 내 기본 학적 정보 가져오기 (레거시 서버 API fallback)
export const getMyBasicInfo = async ({
  portalId,
  portalPassword,
}: {
  portalId: string;
  portalPassword: string;
}) => {
  const response = await tokenInstance.post<StudentInfoResponse>(
    `/api/portal/basic-info`,
    { portalId, portalPassword },
  );
  return response.data;
};

