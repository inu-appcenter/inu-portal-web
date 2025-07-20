import type { BusData } from "types/bus.ts";

export const goSchool_INUExit2: BusData[] = [
  {
    id: 1,
    number: "셔틀",
    route: "정문 → 정보대 → 송도캠(기숙사) ",
    arrivalInfo: [
      {
        time: "08:30 ~ 10:20",
        station: "수시 운행 중 ",
      },
    ],
  },
  {
    id: 2,
    number: "8",
    route: "정문 → 자연대 → 공대",
    routeId: "165000012",
  },
  {
    id: 3,
    number: "16",
    route: "정문",
    routeId: "165000020",
  },
  {
    id: 4,
    number: "41",
    route: "북문 → 송도캠(기숙사) ",
    routeId: "165000514",
  },
];

export const goSchool_INUExit1: BusData[] = [
  {
    id: 5,
    number: "46",
    route: "자연대 → 공대",
    routeId: "164000004",
  },
];

export const goSchool_BITExit3: BusData[] = [
  {
    id: 6,
    number: "6-1",
    route: "자연대 → 공대(정보대 컨테이너) ",
    routeId: "165000008",
  },
];

export const goHome_MainOut: BusData[] = [
  {
    id: 7,
    number: "셔틀",
    route: "정문 → 인입 ",
    arrivalInfo: [
      {
        time: "18:00, 18:15, 18:30",
        station: "3회 운영",
      },
    ],
  },
  {
    id: 8,
    number: "8",
    route: "정문 → 인입",
    routeId: "165000012",
  },
  {
    id: 9,
    number: "16",
    route: "정문 → 인입",
    routeId: "165000020",
  },
  {
    id: 10,
    number: "58",
    route: "많이 돌아가는 노선이니 주의하세요.",
    routeId: "161000007",
  },
];

export const goHome_MainIn: BusData[] = [
  {
    id: 11,
    number: "46",
    route: "정문 → 탐스 → 인입 ",
    routeId: "164000004",
  },
];

export const goHome_Dorm: BusData[] = [
  {
    id: 12,
    number: "셔틀",
    route: "송도캠 → 공대 → 정문 → 인입 ",
    arrivalInfo: [
      {
        time: "18:00, 18:15, 18:30",
        station: "3회 운영",
      },
    ],
  },
  {
    id: 13,
    number: "41",
    route: "송도캠 → 북문 → 인입",
    routeId: "165000514",
  },
  {
    id: 14,
    number: "46",
    route: "송도캠 → 북문 → 정문 → 탐스 → 인입",
    routeId: "164000004",
  },
];

export const goHome_Nature_INU: BusData[] = [
  {
    id: 15,
    number: "8",
    route: "공대 → 자연대 → 정문 → 인입",
    routeId: "165000012",
  },
];

export const goHome_Nature_BIT: BusData[] = [
  {
    id: 16,
    number: "6-1",
    route: "공대 → 자연대 → 지정단 2번출구",
    routeId: "165000008",
  },
  {
    id: 17,
    number: "6",
    route: "공대 → 자연대 → 지정단 4번출구 (10분 이상 소요)",
    routeId: "165000007",
  },
];
