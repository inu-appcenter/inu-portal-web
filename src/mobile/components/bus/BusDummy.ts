import type { BusData } from "types/bus.ts";

export const goSchool_INUExit2: BusData[] = [
  {
    id: 1,
    number: "셔틀",
    route: ["정문", "정보대", "송도캠(기숙사)"],
    arrivalInfo: {
      time: "08:30 ~ 10:20",
      station: "수시 운행 중 ",
    },
  },
  {
    id: 2,
    number: "8",
    route: ["인입", "", "정문", "자연대", "공대"],
    path: [
      { lat: 37.38548, lng: 126.63871 }, //인입2번출구
      { lat: 37.37942, lng: 126.63231 }, //꺾임
      { lat: 37.37764, lng: 126.63522 }, //정문
      { lat: 37.37617, lng: 126.63765 }, //꺾임
      { lat: 37.37318, lng: 126.63481 }, //공대
    ],
    routeId: "165000012",
    sectionLabel: "인입 2번출구",
    stopId: "go-school-INU2",
    lastStopId: "164000499",
  },
  {
    id: 3,
    number: "16",
    route: ["인입", "", "정문"],
    path: [
      { lat: 37.38548, lng: 126.63871 },
      { lat: 37.37942, lng: 126.63231 },
      { lat: 37.37764, lng: 126.63522 },
    ],
    routeId: "165000020",
    sectionLabel: "인입 2번출구",
    stopId: "go-school-INU2",
    lastStopId: "164000386",
  },
  {
    id: 4,
    number: "41",
    route: ["인입", "", "북문", "송도캠"],
    path: [
      { lat: 37.38548, lng: 126.63871 },
      { lat: 37.37554, lng: 126.62813 },
      { lat: 37.37375, lng: 126.63108 },
    ],
    routeId: "165000514",
    sectionLabel: "인입 2번출구",
    stopId: "go-school-INU2",
    lastStopId: "164000763",
  },
];

export const goSchool_INUExit1: BusData[] = [
  {
    id: 5,
    number: "46",
    route: ["인입", "", "", "", "자연대", "공대", "송도캠"],
    path: [
      { lat: 37.38513, lng: 126.63892 },
      { lat: 37.38557, lng: 126.63939 },
      { lat: 37.38219, lng: 126.64194 },
      { lat: 37.37617, lng: 126.63763 },
      { lat: 37.37212, lng: 126.63382 },
      { lat: 37.37374, lng: 126.63108 },
    ],
    routeId: "164000004",
    sectionLabel: "인입 1번출구",
    stopId: "go-school-INU1",
    lastStopId: "164000751",
  },
];

export const goSchool_BITExit3: BusData[] = [
  {
    id: 6,
    number: "6-1",
    route: ["지정단", "", "", "", "자연대", "공대"],
    path: [
      { lat: 37.37862, lng: 126.6452 },
      { lat: 37.38224, lng: 126.6424 },
      { lat: 37.38227, lng: 126.64203 },
      { lat: 37.38218, lng: 126.64195 },
      { lat: 37.37639, lng: 126.63783 },
      { lat: 37.37615, lng: 126.63764 },
      { lat: 37.37317, lng: 126.63482 },
    ],
    routeNotice: "지정단 → 자연대 → 공대(정보대)",
    routeId: "165000008",
    sectionLabel: "지정단 3번출구",
    stopId: "go-school-BIT3",
    lastStopId: "164000376",
  },
];

export const goHome_MainOut: BusData[] = [
  {
    id: 7,
    number: "셔틀",
    route: ["정문", "인입"],
    arrivalInfo: {
      time: "18:00, 18:15, 18:30",
      station: "3회 운영",
    },
  },
  {
    id: 8,
    number: "8",
    route: ["정문", "", "인입"],
    path: [
      { lat: 37.37837, lng: 126.63457 }, //정문
      { lat: 37.3794, lng: 126.63292 },
      { lat: 37.37975, lng: 126.63304 },
      { lat: 37.38514, lng: 126.63892 },
    ],
    routeId: "165000012",
    sectionLabel: "정문 (길 건너)",
    stopId: "go-home-main-out",
    lastStopId: "164000396",
  },
  {
    id: 9,
    number: "16",
    route: ["정문", "", "인입"],
    path: [
      { lat: 37.37837, lng: 126.63457 }, //정문
      { lat: 37.3794, lng: 126.63292 },
      { lat: 37.37975, lng: 126.63304 },
      { lat: 37.38514, lng: 126.63892 },
    ],
    routeId: "165000020",
    sectionLabel: "정문 (길 건너)",
    stopId: "go-home-main-out",
    lastStopId: "164000396",
  },
  {
    id: 10,
    number: "58",
    route: ["정문", "", "", "", "", "", "", "인입"],
    path: [
      { lat: 37.37837, lng: 126.63457 }, //정문
      { lat: 37.3817, lng: 126.62905 },
      { lat: 37.38266, lng: 126.63013 },
      { lat: 37.38279, lng: 126.62995 },
      { lat: 37.38376, lng: 126.62853 },
      { lat: 37.38697, lng: 126.63196 },
      { lat: 37.38367, lng: 126.63676 },
      { lat: 37.38368, lng: 126.63732 },
      { lat: 37.38509, lng: 126.63887 },
    ],
    routeNotice: "많이 돌아가는 노선이니 주의하세요!",
    routeId: "161000007",
    sectionLabel: "정문 (길 건너)",
    stopId: "go-home-main-out",
    lastStopId: "164000396",
  },
];

export const goHome_MainIn: BusData[] = [
  {
    id: 11,
    number: "46",
    route: ["정문", "", "", "탐스", "인입"],
    path: [
      { lat: 37.37764, lng: 126.63524 },
      { lat: 37.37617, lng: 126.63763 },
      { lat: 37.3763, lng: 126.63813 },
      { lat: 37.38204, lng: 126.64222 },
      { lat: 37.38261, lng: 126.64235 },
      { lat: 37.38599, lng: 126.63984 },
      { lat: 37.38582, lng: 126.63909 },
      { lat: 37.38547, lng: 126.63872 },
    ],
    routeId: "164000004",
    sectionLabel: "정문",
    stopId: "go-home-main-in",
    lastStopId: "164000395",
  },
];

export const goHome_Dorm: BusData[] = [
  {
    id: 12,
    number: "셔틀",
    route: ["송도캠", "공대", "정문", "인입"],
    arrivalInfo: {
      time: "18:00, 18:15, 18:30",
      station: "3회 운영",
    },
  },
  {
    id: 13,
    number: "41",
    route: ["송도캠", "북문", "", "인입"],
    path: [
      { lat: 37.37376, lng: 126.63108 },
      { lat: 37.37542, lng: 126.62832 },
      { lat: 37.38514, lng: 126.63891 },
    ],
    routeId: "165000514",
    sectionLabel: "송도캠",
    stopId: "go-home-dorm",
    lastStopId: "164000396",
  },
  {
    id: 14,
    number: "46",
    route: ["송도캠", "북문", "정문", "", "", "탐스", "인입"],
    path: [
      { lat: 37.37374, lng: 126.63109 }, //송도캠
      { lat: 37.37542, lng: 126.62834 }, //북문코너
      { lat: 37.37931, lng: 126.63249 }, //정문코너
      { lat: 37.37764, lng: 126.63524 }, //정문
      { lat: 37.37617, lng: 126.63763 },
      { lat: 37.3763, lng: 126.63813 },
      { lat: 37.38204, lng: 126.64222 },
      { lat: 37.38261, lng: 126.64235 },
      { lat: 37.38599, lng: 126.63984 },
      { lat: 37.38582, lng: 126.63909 },
      { lat: 37.38547, lng: 126.63872 },
    ],
    routeId: "164000004",
    sectionLabel: "송도캠",
    stopId: "go-home-dorm",
    lastStopId: "164000395",
  },
];

export const goHome_Nature_INU: BusData[] = [
  {
    id: 15,
    number: "8",
    route: ["자연대", "정문", "", "인입"],
    routeNotice: "공대 → 자연대 → 정문 → 인입",
    path: [
      { lat: 37.37239, lng: 126.63449 }, //공대
      { lat: 37.37599, lng: 126.6379 },
      { lat: 37.37642, lng: 126.63781 },
      { lat: 37.3794, lng: 126.63292 },
      { lat: 37.37975, lng: 126.63304 },
      { lat: 37.38514, lng: 126.63892 },
    ],
    routeId: "165000012",
    sectionLabel: "자연대",
    stopId: "go-home-dorm",
    lastStopId: "164000396",
  },
];

export const goHome_Nature_BIT: BusData[] = [
  {
    id: 16,
    number: "6-1",
    route: ["자연대", "", "", "", "지정단"],
    path: [
      { lat: 37.37239, lng: 126.63449 }, //공대
      { lat: 37.37599, lng: 126.63792 },
      { lat: 37.37639, lng: 126.6382 },
      { lat: 37.38162, lng: 126.64194 },
      { lat: 37.38165, lng: 126.64238 },
      { lat: 37.37893, lng: 126.64442 },
    ],
    routeNotice: "공대 → 자연대 → 지정단 2번출구",
    routeId: "165000008",
    sectionLabel: "자연대",
    stopId: "go-home-science",
    lastStopId: "164000404",
  },
  {
    id: 17,
    number: "6",
    route: ["자연대", "", "", "", "", "", "", "", "", "", "지정단"],
    path: [
      { lat: 37.37239, lng: 126.63449 }, //공대
      { lat: 37.37598, lng: 126.63792 },
      { lat: 37.37375, lng: 126.64153 },
      { lat: 37.37027, lng: 126.64508 },
      { lat: 37.37002, lng: 126.64541 },
      { lat: 37.36553, lng: 126.65276 },
      { lat: 37.36559, lng: 126.65355 },
      { lat: 37.36698, lng: 126.65493 },
      { lat: 37.36745, lng: 126.65491 },
      { lat: 37.36842, lng: 126.65335 },
      { lat: 37.36964, lng: 126.65231 },
      { lat: 37.37041, lng: 126.65127 },
      { lat: 37.37267, lng: 126.64947 },
      { lat: 37.37351, lng: 126.64894 },
      { lat: 37.3739, lng: 126.64858 },
      { lat: 37.37678, lng: 126.64654 },
    ],
    routeNotice: "많이 돌아가는 노선이니 주의하세요!",
    routeId: "165000007",
    sectionLabel: "자연대",
    stopId: "go-home-science",
    lastStopId: "164000380",
  },
];
