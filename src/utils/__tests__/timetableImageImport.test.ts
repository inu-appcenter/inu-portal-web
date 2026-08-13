import { describe, expect, it } from "vitest";
import {
  extractBracketedSubjectNumbers,
  findConfidentOffering,
  isConfidentOfferingMatch,
  parseAndGroupBlocks,
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
