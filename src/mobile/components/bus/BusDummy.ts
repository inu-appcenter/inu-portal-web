import type { BusData } from "types/bus.ts";

export const goSchool_INUExit2: BusData[] = [
  /*{
    id: 1,
    number: "셔틀",
    route: ["정문", "정보대", "송도캠(기숙사)"],
    arrivalInfo: {
      time: "08:30 ~ 10:20",
      station: "수시 운행 중 ",
    },
  },*/
  {
    id: 2,
    number: "8",
    route: ["인입", "정문", "자연대", "공대"],
    routeId: "165000012",
    routeImg: ["/Bus/8.svg"],
    sectionLabel: "인입 2번출구",
    stopId: "go-school-INU2",
  },
  {
    id: 3,
    number: "16",
    route: ["인입", "정문"],
    routeId: "165000020",
    routeImg: ["/Bus/8.svg"],
    sectionLabel: "인입 2번출구",
    stopId: "go-school-INU2",
  },
  {
    id: 4,
    number: "41",
    route: ["인입", "북문", "송도캠(기숙사)"],
    routeId: "165000514",
    routeImg: ["/Bus/8.svg"],
    sectionLabel: "인입 2번출구",
    stopId: "go-school-INU2",
  },
];

export const goSchool_INUExit1: BusData[] = [
  {
    id: 5,
    number: "46",
    route: ["인입", "자연대", "공대"],
    routeId: "164000004",
    routeImg: ["/Bus/8.svg"],
    sectionLabel: "인입 1번출구",
    stopId: "go-school-INU1",
  },
];

export const goSchool_BITExit3: BusData[] = [
  {
    id: 6,
    number: "6-1",
    route: ["지정단", "자연대", "공대(정보대)"],
    routeId: "165000008",
    routeImg: ["/Bus/8.svg"],
    sectionLabel: "지정단 3번출구",
    stopId: "go-school-BIT3",
  },
];

export const goHome_MainOut: BusData[] = [
  /*{
    id: 7,
    number: "셔틀",
    route: ["정문", "인입"],
    arrivalInfo: {
      time: "18:00, 18:15, 18:30",
      station: "3회 운영",
    },
  },*/
  {
    id: 8,
    number: "8",
    route: ["정문", "인입"],
    routeId: "165000012",
    routeImg: ["/Bus/8.svg"],
    sectionLabel: "정문 (길 건너)",
    stopId: "go-home-main-out",
  },
  {
    id: 9,
    number: "16",
    route: ["정문", "인입"],
    routeId: "165000020",
    routeImg: ["/Bus/8.svg"],
    sectionLabel: "정문 (길 건너)",
    stopId: "go-home-main-out",
  },
  {
    id: 10,
    number: "58",
    route: ["정문", "인입"],
    routeNotice: "많이 돌아가는 노선이니 주의하세요!",
    routeId: "161000007",
    routeImg: ["/Bus/8.svg"],
    sectionLabel: "정문 (길 건너)",
    stopId: "go-home-main-out",
  },
];

export const goHome_MainIn: BusData[] = [
  {
    id: 11,
    number: "46",
    route: ["정문", "탐스", "인입"],
    routeId: "164000004",
    routeImg: ["/Bus/8.svg"],
    sectionLabel: "정문",
    stopId: "go-home-main-in",
  },
];

export const goHome_Dorm: BusData[] = [
  /*{
    id: 12,
    number: "셔틀",
    route: ["송도캠", "공대", "정문", "인입"],
    arrivalInfo: {
      time: "18:00, 18:15, 18:30",
      station: "3회 운영",
    },
  },*/
  {
    id: 13,
    number: "41",
    route: ["송도캠", "북문", "인입"],
    routeId: "165000514",
    routeImg: ["/Bus/8.svg"],
    sectionLabel: "송도캠",
    stopId: "go-home-dorm",
  },
  {
    id: 14,
    number: "46",
    route: ["송도캠", "북문", "정문", "탐스", "인입"],
    routeId: "164000004",
    routeImg: ["/Bus/8.svg"],
    sectionLabel: "송도캠",
    stopId: "go-home-dorm",
  },
];

export const goHome_Nature_INU: BusData[] = [
  {
    id: 15,
    number: "8",
    route: ["공대", "자연대", "정문", "인입"],
    routeId: "165000012",
    routeImg: ["/Bus/8.svg"],
    sectionLabel: "자연대",
    stopId: "go-home-dorm",
  },
];

export const goHome_Nature_BIT: BusData[] = [
  {
    id: 16,
    number: "6-1",
    route: ["공대", "자연대", "지정단 2번출구"],
    routeId: "165000008",
    routeImg: ["/Bus/8.svg"],
    sectionLabel: "자연대",
    stopId: "go-home-science",
  },
  {
    id: 17,
    number: "6",
    route: ["공대", "자연대", "지정단 4번출구"],
    routeId: "165000007",
    routeImg: ["/Bus/8.svg"],
    sectionLabel: "자연대",
    stopId: "go-home-science",
  },
];
