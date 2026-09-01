import { describe, expect, it } from "vitest";
import {
  extractBracketedSubjectNumbers,
  detectTimetableImageLayout,
  findConfidentOffering,
  findUniqueTitleOffering,
  isConfidentOfferingMatch,
  parseAndGroupBlocks,
  preprocessBlockCanvas,
  type DetectedTimetableBlock,
} from "../timetableImageImport";
import type { CourseOffering } from "@/types/courseOfferings";

const block = (rawText: string, day: DetectedTimetableBlock["day"]): DetectedTimetableBlock => ({
  id: day,
  crop: {} as HTMLCanvasElement,
  day,
  startTime: "10:30",
  endTime: "12:00",
  rawText,
  confidence: 80,
});

describe("parseAndGroupBlocks", () => {
  it("한글 요일 헤더가 있는 이미지를 에브리타임 격자로 판별한다", () => {
    expect(detectTimetableImageLayout("시간포 1\n월 화 수 목 금")).toBe(
      "EVERYTIME_GRID",
    );
  });

  it("강의실 표기를 교수명에서 제외하고 줄바꿈 과목명을 합친다", () => {
    const [course] = parseAndGroupBlocks([
      block("모바일소프\n트웨어\n07-4O8", "MONDAY"),
    ]);

    expect(course.title).toBe("모바일소프트웨어");
    expect(course.professor).toBe("");
  });

  it("과목명 첫 글자가 기호로 인식돼도 시간과 나머지 이름이 맞는 후보를 찾는다", () => {
    const course = parseAndGroupBlocks([
      {
        ...block("(언어\n07-408", "FRIDAY"),
        startTime: "10:00",
        endTime: "11:50",
      },
    ])[0];
    const offering = {
      courseTitle: "C언어",
      professor: "교수갑",
      meetings: [{
        day: "FRIDAY",
        startTime: "10:00:00",
        endTime: "11:50:00",
      }],
    } as CourseOffering;

    expect(isConfidentOfferingMatch(course, offering)).toBe(true);
    expect(findUniqueTitleOffering(course.title, [offering])?.courseTitle).toBe(
      "C언어",
    );
  });

  it("비슷한 정식 과목명이 여러 개면 표시명을 임의로 보정하지 않는다", () => {
    const candidates = [
      { courseTitle: "C언어" },
      { courseTitle: "R언어" },
    ] as CourseOffering[];

    expect(findUniqueTitleOffering("(언어", candidates)).toBeNull();
  });

  it("정식 과목명에 포함된 일반 괄호는 제거하지 않는다", () => {
    const [course] = parseAndGroupBlocks([
      block("프로그래밍(C++)\n07-408", "MONDAY"),
    ]);

    expect(course.title).toBe("프로그래밍(C++)");
  });

  it("장바구니 목록의 대괄호 수강번호를 중복 없이 추출한다", () => {
    const text = "[0012345001] 과목가\n[0012345002] 과목나\n[0012345001]";

    expect(extractBracketedSubjectNumbers(text)).toEqual([
      "0012345001",
      "0012345002",
    ]);
  });

  it("수강번호 안의 흔한 영문 OCR 오인식을 숫자로 복구한다", () => {
    expect(extractBracketedSubjectNumbers("[OO12345OOI] 과목가")).toEqual([
      "0012345001",
    ]);
  });

  it("여러 줄 수업 유형 문구를 과목명에서 제거한다", () => {
    const [course] = parseAndGroupBlocks([
      block("과목가[75\n분수업]\n교수갑", "MONDAY"),
    ]);

    expect(course.title).toBe("과목가");
    expect(course.professor).toBe("교수갑");
  });

  it("서로 다른 OCR 문자열은 개설 분반 확인 전에는 임의로 합치지 않는다", () => {
    const courses = parseAndGroupBlocks([
      block("과목가잡음\n교수갑", "WEDNESDAY"),
      block("과목가\n교수갑", "MONDAY"),
    ]);

    expect(courses).toHaveLength(2);
  });

  it("서버 시간이 초를 포함해도 확실한 분반으로 판단한다", () => {
    const [course] = parseAndGroupBlocks([
      block("과목가\n교수갑", "MONDAY"),
    ]);
    const offering = {
      courseTitle: "과목가",
      professor: "교수갑",
      meetings: [{
        day: "MONDAY",
        startTime: "10:30:00",
        endTime: "12:00:00",
      }],
    } as CourseOffering;

    expect(isConfidentOfferingMatch(course, offering)).toBe(true);
  });

  it("이미지 시간이 서버 시간보다 시작과 종료가 5분씩 밀려도 일치한다", () => {
    const course = parseAndGroupBlocks([
      {
        ...block("과목가\n07-408", "MONDAY"),
        startTime: "13:05",
        endTime: "14:55",
      },
    ])[0];
    const offering = {
      courseTitle: "과목가",
      professor: "교수갑",
      meetings: [{
        day: "MONDAY",
        startTime: "13:00:00",
        endTime: "14:50:00",
      }],
    } as CourseOffering;

    expect(isConfidentOfferingMatch(course, offering)).toBe(true);
  });

  it("과목명 OCR에 잡음이 있어도 교수와 시간이 일치하면 확실한 후보로 판단한다", () => {
    const [course] = parseAndGroupBlocks([
      block("과목가임의잡음\n교수갑", "MONDAY"),
    ]);
    const offering = {
      courseTitle: "과목가",
      professor: "교수갑",
      meetings: [{
        day: "MONDAY",
        startTime: "10:30:00",
        endTime: "12:00:00",
      }],
    } as CourseOffering;

    expect(isConfidentOfferingMatch(course, offering)).toBe(true);
  });

  it("과목명과 교수명이 정확히 같은 유일한 분반을 자동 선택한다", () => {
    const [course] = parseAndGroupBlocks([
      block("과목가\n교수갑", "MONDAY"),
    ]);
    const candidates = [
      { id: 1, courseTitle: "과목가", professor: "교수갑", meetings: [] },
      { id: 2, courseTitle: "과목가", professor: "교수을", meetings: [] },
    ] as CourseOffering[];

    expect(findConfidentOffering(course, candidates)?.id).toBe(1);
  });

  it("시간 후보군에서 같은 교수가 한 명뿐이면 OCR 잡음이 있어도 자동 선택한다", () => {
    const [course] = parseAndGroupBlocks([
      block("과목가잡음\n교수갑", "MONDAY"),
    ]);
    const candidates = [
      {
        id: 1,
        courseTitle: "과목가",
        professor: "교수갑",
        meetings: [{ day: "MONDAY", startTime: "10:30:00", endTime: "12:00:00" }],
      },
      { id: 2, courseTitle: "과목나", professor: "교수을", meetings: [] },
    ] as CourseOffering[];

    expect(findConfidentOffering(course, candidates)?.id).toBe(1);
  });
});

describe("preprocessBlockCanvas", () => {
  it("document가 없는 Node 환경에서는 원본 Canvas를 안전하게 반환한다", () => {
    const mockCanvas = { width: 100, height: 40 } as HTMLCanvasElement;
    const result = preprocessBlockCanvas(mockCanvas);
    expect(result).toBe(mockCanvas);
  });
});

describe("decomposeHangul & hangulSimilarity", () => {
  it("음성인식입문 오타 텍스트를 높은 유사도로 판정한다", () => {
    const noisy = "음서이시인무2ㄷ";
    const target = "음성인식입문";
    const [course] = parseAndGroupBlocks([
      {
        ...block(noisy, "WEDNESDAY"),
        startTime: "13:30",
        endTime: "14:45",
      },
    ]);
    const candidates = [
      {
        id: 101,
        courseTitle: target,
        professor: "교수갑",
        meetings: [{ day: "WEDNESDAY", startTime: "13:30:00", endTime: "14:45:00" }],
      },
    ] as CourseOffering[];

    expect(findConfidentOffering(course, candidates)?.id).toBe(101);
  });

  it("지능정보시스템 오타 텍스트(지능정보시스Ela)를 정확히 매칭한다", () => {
    const noisy = "지능정보시스\nEla\n07-416";
    const target = "지능정보시스템";
    const [course] = parseAndGroupBlocks([
      {
        ...block(noisy, "THURSDAY"),
        startTime: "10:30",
        endTime: "11:45",
      },
    ]);
    const candidates = [
      {
        id: 102,
        courseTitle: target,
        professor: "교수을",
        meetings: [{ day: "THURSDAY", startTime: "10:30:00", endTime: "11:45:00" }],
      },
    ] as CourseOffering[];

    expect(findConfidentOffering(course, candidates)?.id).toBe(102);
  });

  it("강의실 번호(07-505)만 읽힌 블록이라도 해당 시간대의 유일한 강좌를 매칭한다", () => {
    const noisy = "07-505";
    const target = "자연어처리";
    const [course] = parseAndGroupBlocks([
      {
        ...block(noisy, "MONDAY"),
        startTime: "09:00",
        endTime: "10:15",
      },
    ]);
    const candidates = [
      {
        id: 103,
        courseTitle: target,
        professor: "교수병",
        meetings: [{ day: "MONDAY", startTime: "09:00:00", endTime: "10:15:00" }],
      },
    ] as CourseOffering[];

    expect(findConfidentOffering(course, candidates)?.id).toBe(103);
  });

  it("앞글자가 잘린 과목명(:근콘크리트, 크리트)도 철근콘크리트구조로 정확히 매칭한다", () => {
    const noisy = ":근콘크리트";
    const target = "철근콘크리트구조";
    const [course] = parseAndGroupBlocks([
      {
        ...block(noisy, "WEDNESDAY"),
        startTime: "09:00",
        endTime: "10:00",
      },
    ]);
    const candidates = [
      {
        id: 104,
        courseTitle: target,
        professor: "교수정",
        meetings: [{ day: "WEDNESDAY", startTime: "09:00:00", endTime: "10:00:00" }],
      },
    ] as CourseOffering[];

    expect(findConfidentOffering(course, candidates)?.id).toBe(104);
  });
});
