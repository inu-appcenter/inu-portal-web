import { describe, it, expect } from "vitest";
import { parseAcademicBasicInfo, parseTimetableList, parseTimeInfo } from "../ssvParser";

describe("Academic SSV Parser (Web Centralized)", () => {
  const RECORD_SEPARATOR = String.fromCharCode(30);
  const UNIT_SEPARATOR = String.fromCharCode(31);

  it("올바른 SSV 패킷으로부터 학적 기본 정보를 정상 파싱해야 한다", () => {
    const mockSsv = [
      "ErrorCode:int=0",
      "ErrorMsg:String=SUCCESS",
      "Dataset:DS_SREG101",
      `_Column_${UNIT_SEPARATOR}stuno:string${UNIT_SEPARATOR}korNm:string${UNIT_SEPARATOR}hgNm:string${UNIT_SEPARATOR}schregStGbn:string${UNIT_SEPARATOR}acqHp:string${UNIT_SEPARATOR}mrksAvg:string${UNIT_SEPARATOR}mrksCptnTmCnt:string${UNIT_SEPARATOR}colgNm:string${UNIT_SEPARATOR}profNm:string`,
      `N${UNIT_SEPARATOR}202101234${UNIT_SEPARATOR}홍길동${UNIT_SEPARATOR}컴퓨터공학부${UNIT_SEPARATOR}10${UNIT_SEPARATOR}98${UNIT_SEPARATOR}3.85${UNIT_SEPARATOR}5${UNIT_SEPARATOR}정보기술대학${UNIT_SEPARATOR}김교수`,
    ].join(RECORD_SEPARATOR);

    const result = parseAcademicBasicInfo(mockSsv);

    expect(result.studentId).toBe("202101234");
    expect(result.koreanName).toBe("홍길동");
    expect(result.departmentName).toBe("컴퓨터공학부");
    expect(result.enrollmentStatus).toBe("재학");
    expect(result.acquiredCredits).toBe("98");
    expect(result.gradeAverage).toBe("3.85");
    expect(result.completedSemesterCount).toBe("5학기");
    expect(result.collegeName).toBe("정보기술대학");
    expect(result.advisorProfessorName).toBe("김교수");
    expect(result.displayFields?.["지도교수"]).toBe("김교수 교수님");
  });

  it("ErrorCode가 0이 아니거나 세션 오류인 경우 예외를 발생시켜야 한다", () => {
    const errorSsv =
      "ErrorCode:int=-1" + RECORD_SEPARATOR + "ErrorMsg:String=Session expired";
    expect(() => parseAcademicBasicInfo(errorSsv)).toThrow(
      "인천대 학사 시스템(ERP) 응답 오류"
    );
  });

  it("rawSsv envelope 객체를 정상 파싱하고 학과 코드 및 졸업유예/지도교수를 매핑해야 한다", () => {
    const rawSsv = [
      "ErrorCode:int=0",
      "Dataset:DS_SREG101",
      "_RowType_\u001fstuno\u001fkorNm\u001fhgCd\u001fschregStGbn\u001fflSchregModGbn\u001facqHp\u001fmrksAvg\u001fprofNm",
      "N\u001f202001518\u001f배현준\u001f0000077\u001f70\u001f0701\u001f140\u001f4.24\u001f박문주",
    ].join(RECORD_SEPARATOR);

    const result = parseAcademicBasicInfo(JSON.stringify({ rawSsv }));
    expect(result.studentId).toBe("202001518");
    expect(result.koreanName).toBe("배현준");
    expect(result.departmentName).toBe("컴퓨터공학부");
    expect(result.collegeName).toBe("정보기술대학");
    expect(result.enrollmentStatus).toBe("졸업유예");
    expect(result.latestEnrollmentChange).toBe("졸업유예");
    expect(result.acquiredCredits).toBe("140");
    expect(result.gradeAverage).toBe("4.24");
    expect(result.advisorProfessorName).toBe("박문주");
    expect(result.displayFields?.["지도교수"]).toBe("박문주 교수님");
  });

  it("학생별 수강 시간표 SSV(DS_LIST)를 정상 파싱해야 한다", () => {
    const timetableSsv = [
      "ErrorCode:int=0",
      "Dataset:DS_LIST",
      "_RowType_\u001fcptnGbn\u001fhp\u001fdeptClsfCd\u001fstuno\u001ftimeInfo\u001fkorNm\u001fdelGbn\u001fscNm\u001fmodDttm\u001finptDttm\u001fyy\u001ftmGbn\u001fhaksuNo\u001frepeatGbn\u001fopenHgMjNm\u001fopenHySeqGbn\u001flsnTypeGbn\u001fprofNm",
      "N\u001f전공심화\u001f3\u001f0000587\u001f202001518\u001f[07-304:금(1)(2)(3)]\u001f배현준\u001f신청\u001f자연어처리\u001f2025-08-18 14:00:19\u001f2025-08-18 14:00:19\u001f2025\u001f20\u001f0010925001\u001f-\u001f컴퓨터공학부\u001f3\u001fe-Learning\u001f신유현",
      "N\u001f심화교양\u001f3\u001f0000587\u001f202001518\u001f[04-104:월(7-8A)(8B-9)]\u001f배현준\u001f신청\u001f디지털시대의모바일앱만들기\u001f2025-08-18 14:00:24\u001f2025-08-18 14:00:24\u001f2025\u001f20\u001f0011842001\u001f-\u001f교양\u001f전학년\u001f강의(이론)\u001f박승진",
    ].join(RECORD_SEPARATOR);

    const list = parseTimetableList(timetableSsv);
    expect(list).toHaveLength(2);

    const [nlp, mobile] = list;
    expect(nlp.courseName).toBe("자연어처리");
    expect(nlp.courseCode).toBe("0010925001");
    expect(nlp.credits).toBe("3");
    expect(nlp.professorName).toBe("신유현");
    expect(nlp.courseType).toBe("전공심화");
    expect(nlp.departmentName).toBe("컴퓨터공학부");
    expect(nlp.lessonType).toBe("e-Learning");
    expect(nlp.timeSlots).toHaveLength(1);
    expect(nlp.timeSlots[0].day).toBe("금");
    expect(nlp.timeSlots[0].building).toBe("7호관");
    expect(nlp.timeSlots[0].room).toBe("304호");
    expect(nlp.timeSlots[0].periods).toBe("(1)(2)(3)");

    expect(mobile.courseName).toBe("디지털시대의모바일앱만들기");
    expect(mobile.professorName).toBe("박승진");
    expect(mobile.timeSlots[0].day).toBe("월");
    expect(mobile.timeSlots[0].building).toBe("4호관");
    expect(mobile.timeSlots[0].room).toBe("104호");
  });

  it("수강 취소(delGbn: 취소)된 과목은 시간표 목록에서 제외해야 한다", () => {
    const timetableSsv = [
      "ErrorCode:int=0",
      "Dataset:DS_LIST",
      "_RowType_\u001fcptnGbn\u001fhp\u001fdeptClsfCd\u001fstuno\u001ftimeInfo\u001fkorNm\u001fdelGbn\u001fscNm\u001fmodDttm\u001finptDttm\u001fyy\u001ftmGbn\u001fhaksuNo\u001frepeatGbn\u001fopenHgMjNm\u001fopenHySeqGbn\u001flsnTypeGbn\u001fprofNm",
      "N\u001f전공심화\u001f3\u001f0000587\u001f202001518\u001f[07-304:금(1)(2)(3)]\u001f배현준\u001f신청\u001f자연어처리\u001f2025-08-18 14:00:19\u001f2025-08-18 14:00:19\u001f2025\u001f20\u001f0010925001\u001f-\u001f컴퓨터공학부\u001f3\u001fe-Learning\u001f신유현",
      "N\u001f전공선택\u001f3\u001f0000587\u001f202001518\u001f[07-201:화(1)(2)(3)]\u001f배현준\u001f취소\u001f운영체제\u001f2025-08-18 14:00:20\u001f2025-08-18 14:00:20\u001f2025\u001f20\u001f0010926001\u001f-\u001f컴퓨터공학부\u001f3\u001f강의(이론)\u001f홍길동",
      "N\u001f심화교양\u001f3\u001f0000587\u001f202001518\u001f[04-104:월(7-8A)(8B-9)]\u001f배현준\u001f신청\u001f디지털시대의모바일앱만들기\u001f2025-08-18 14:00:24\u001f2025-08-18 14:00:24\u001f2025\u001f20\u001f0011842001\u001f-\u001f교양\u001f전학년\u001f강의(이론)\u001f박승진",
    ].join(RECORD_SEPARATOR);

    const list = parseTimetableList(timetableSsv);
    expect(list).toHaveLength(2);
    expect(list.map((c) => c.courseName)).toEqual(["자연어처리", "디지털시대의모바일앱만들기"]);
  });

  it("timeInfo 포맷을 정확히 파싱해야 한다", () => {
    const slots1 = parseTimeInfo("[07-304:금(1)(2)(3)]");
    expect(slots1).toEqual([
      {
        day: "금",
        periods: "(1)(2)(3)",
        building: "7호관",
        room: "304호",
        rawLocation: "07-304",
      },
    ]);

    const slots2 = parseTimeInfo("[04-104:월(7-8A)(8B-9)]");
    expect(slots2[0].building).toBe("4호관");
    expect(slots2[0].room).toBe("104호");
    expect(slots2[0].day).toBe("월");

    const empty = parseTimeInfo("");
    expect(empty).toEqual([]);
  });
});

