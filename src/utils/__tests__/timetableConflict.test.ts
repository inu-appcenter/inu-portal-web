import { describe, it, expect } from "vitest";
import { findConflictingCourseDetails } from "../timetable";
import type { ClassItem } from "@/components/mobile/timetable/TimetableGrid";

describe("findConflictingCourseDetails", () => {
  const existingEvents: ClassItem[] = [
    {
      id: 1,
      name: "자료구조",
      professor: "김교수",
      courseId: "2600002001",
      day: 1, // 화요일
      startTime: 9.0, // 09:00
      endTime: 10.5, // 10:30
      room: "1호관 101호",
    },
    {
      id: 2,
      name: "운영체제",
      professor: "이교수",
      courseId: "2600003001",
      day: 3, // 목요일
      startTime: 13.0, // 13:00
      endTime: 15.0, // 15:00
      room: "2호관 202호",
    },
    {
      id: 3,
      name: "온라인강의",
      professor: "박교수",
      courseId: "2600004001",
      day: 0,
      startTime: 0,
      endTime: 0,
      room: "",
      isUntimed: true,
    },
  ];

  it("기존 강의와 요일 및 시간이 겹치면 충돌한 강의 정보(과목명, 교수명, 분반, 요일, 시간)를 반환한다", () => {
    const newSchedules: ClassItem[] = [
      {
        id: 101,
        name: "알고리즘",
        professor: "최교수",
        courseId: "2600005001",
        day: 1, // 화요일
        startTime: 10.0, // 10:00 ~ 11:30 (자료구조 09:00~10:30과 10:00~10:30 겹침)
        endTime: 11.5,
        room: "3호관 303호",
      },
    ];

    const conflicts = findConflictingCourseDetails(newSchedules, existingEvents);

    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]).toEqual({
      courseName: "자료구조",
      professor: "김교수",
      courseId: "2600002001",
      day: "화요일",
      time: "09:00 ~ 10:30",
    });
  });

  it("요일이 다르면 시간이 겹쳐도 충돌하지 않는다", () => {
    const newSchedules: ClassItem[] = [
      {
        id: 102,
        name: "컴퓨터구조",
        day: 2, // 수요일 (자료구조는 화요일)
        startTime: 9.0,
        endTime: 10.5,
        room: "1호관 101호",
      },
    ];

    const conflicts = findConflictingCourseDetails(newSchedules, existingEvents);
    expect(conflicts).toHaveLength(0);
  });

  it("같은 요일이라도 시간이 겹치지 않으면 충돌하지 않는다 (연속 시간)", () => {
    const newSchedules: ClassItem[] = [
      {
        id: 103,
        name: "데이터베이스",
        day: 1, // 화요일
        startTime: 10.5, // 10:30 (자료구조가 끝나는 정각)
        endTime: 12.0,
        room: "1호관 101호",
      },
    ];

    const conflicts = findConflictingCourseDetails(newSchedules, existingEvents);
    expect(conflicts).toHaveLength(0);
  });

  it("시간 미지정(비대면/untimed) 강의는 시간 충돌을 일으키지 않는다", () => {
    const newSchedules: ClassItem[] = [
      {
        id: 104,
        name: "비대면 교양",
        day: 0,
        startTime: 0,
        endTime: 0,
        room: "",
        isUntimed: true,
      },
    ];

    const conflicts = findConflictingCourseDetails(newSchedules, existingEvents);
    expect(conflicts).toHaveLength(0);
  });

  it("여러 요일에 걸쳐 복수의 강의와 충돌하는 경우 충돌 목록을 모두 반환한다", () => {
    const newSchedules: ClassItem[] = [
      {
        id: 105,
        name: "종합설계",
        day: 1, // 화요일 09:30~11:00 (자료구조와 충돌)
        startTime: 9.5,
        endTime: 11.0,
        room: "",
      },
      {
        id: 106,
        name: "종합설계",
        day: 3, // 목요일 14:00~16:00 (운영체제와 충돌)
        startTime: 14.0,
        endTime: 16.0,
        room: "",
      },
    ];

    const conflicts = findConflictingCourseDetails(newSchedules, existingEvents);
    expect(conflicts).toHaveLength(2);
    expect(conflicts[0].courseName).toBe("자료구조");
    expect(conflicts[0].day).toBe("화요일");
    expect(conflicts[1].courseName).toBe("운영체제");
    expect(conflicts[1].day).toBe("목요일");
  });

  it("교수명이나 분반 정보가 없는 경우 기본값('-')으로 표시된다", () => {
    const eventsWithoutMeta: ClassItem[] = [
      {
        id: 10,
        name: "개인 일정",
        day: 4, // 금요일
        startTime: 10.0,
        endTime: 12.0,
        room: "",
      },
    ];

    const newSchedules: ClassItem[] = [
      {
        id: 107,
        name: "세미나",
        day: 4,
        startTime: 11.0,
        endTime: 13.0,
        room: "",
      },
    ];

    const conflicts = findConflictingCourseDetails(newSchedules, eventsWithoutMeta);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]).toEqual({
      courseName: "개인 일정",
      professor: "-",
      courseId: "-",
      day: "금요일",
      time: "10:00 ~ 12:00",
    });
  });
});
