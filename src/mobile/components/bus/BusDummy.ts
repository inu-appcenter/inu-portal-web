import type { BusData, ArrivalInfo } from "types/bus.ts";

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
    arrivalInfo: [
      {
        time: "9분 43초",
        station: "4번째전",
        status: "보통" as ArrivalInfo["status"],
      },
      {
        time: "24분",
        station: "12번째전",
        status: "여유" as ArrivalInfo["status"],
      },
    ],
  },
  {
    id: 3,
    number: "16",
    route: "정문",
    arrivalInfo: [
      {
        time: "9분 43초",
        station: "4번째전",
        status: "보통" as ArrivalInfo["status"],
      },
      {
        time: "24분",
        station: "12번째전",
        status: "여유" as ArrivalInfo["status"],
      },
    ],
  },
  {
    id: 4,
    number: "41",
    route: "북문 → 송도캠(기숙사) ",
    arrivalInfo: [
      {
        time: "9분 43초",
        station: "4번째전",
        status: "보통" as ArrivalInfo["status"],
      },
      {
        time: "24분",
        station: "12번째전",
        status: "여유" as ArrivalInfo["status"],
      },
    ],
  },
];

export const goSchool_INUExit1: BusData[] = [
  {
    id: 1,
    number: "46",
    route: "자연대 → 공대",
    arrivalInfo: [
      {
        time: "9분 43초",
        station: "4번째전",
        status: "보통" as ArrivalInfo["status"],
      },
      {
        time: "24분",
        station: "12번째전",
        status: "여유" as ArrivalInfo["status"],
      },
    ],
  },
];

export const goSchool_BITExit3: BusData[] = [
  {
    id: 1,
    number: "6-1",
    route: "자연대 → 공대(정보대 컨테이너) ",
    arrivalInfo: [
      {
        time: "9분 43초",
        station: "4번째전",
        status: "보통" as ArrivalInfo["status"],
      },
      {
        time: "24분",
        station: "12번째전",
        status: "여유" as ArrivalInfo["status"],
      },
    ],
  },
];

export const goHome_MainOut: BusData[] = [
  {
    id: 1,
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
    id: 2,
    number: "8",
    route: "정문 → 인입",
    arrivalInfo: [
      {
        time: "9분 43초",
        station: "4번째전",
        status: "보통" as ArrivalInfo["status"],
      },
      {
        time: "24분",
        station: "12번째전",
        status: "여유" as ArrivalInfo["status"],
      },
    ],
  },
  {
    id: 3,
    number: "16",
    route: "정문 → 인입",
    arrivalInfo: [
      {
        time: "9분 43초",
        station: "4번째전",
        status: "보통" as ArrivalInfo["status"],
      },
      {
        time: "24분",
        station: "12번째전",
        status: "여유" as ArrivalInfo["status"],
      },
    ],
  },
  {
    id: 4,
    number: "58",
    route: "많이 돌아가는 노선이니 주의하세요.",
    arrivalInfo: [
      {
        time: "9분 43초",
        station: "4번째전",
        status: "보통" as ArrivalInfo["status"],
      },
      {
        time: "24분",
        station: "12번째전",
        status: "여유" as ArrivalInfo["status"],
      },
    ],
  },
];

export const goHome_MainIn: BusData[] = [
  {
    id: 1,
    number: "46",
    route: "정문 → 탐스 → 인입 ",
    arrivalInfo: [
      {
        time: "9분 43초",
        station: "4번째전",
        status: "보통",
      },
    ],
  },
];

export const goHome_Dorm: BusData[] = [
  {
    id: 1,
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
    id: 2,
    number: "41",
    route: "송도캠 → 북문 → 인입",
    arrivalInfo: [
      {
        time: "9분 43초",
        station: "4번째전",
        status: "보통" as ArrivalInfo["status"],
      },
      {
        time: "24분",
        station: "12번째전",
        status: "여유" as ArrivalInfo["status"],
      },
    ],
  },
  {
    id: 3,
    number: "46",
    route: "송도캠 → 북문 → 정문 → 탐스 → 인입",
    arrivalInfo: [
      {
        time: "9분 43초",
        station: "4번째전",
        status: "보통" as ArrivalInfo["status"],
      },
      {
        time: "24분",
        station: "12번째전",
        status: "여유" as ArrivalInfo["status"],
      },
    ],
  },
];

export const goHome_Nature_INU: BusData[] = [
  {
    id: 1,
    number: "8",
    route: "공대 → 자연대 → 정문 → 인입",
    arrivalInfo: [
      {
        time: "9분 43초",
        station: "4번째전",
        status: "보통" as ArrivalInfo["status"],
      },
      {
        time: "24분",
        station: "12번째전",
        status: "여유" as ArrivalInfo["status"],
      },
    ],
  },
];

export const goHome_Nature_BIT: BusData[] = [
  {
    id: 1,
    number: "6-1",
    route: "공대 → 자연대 → 지정단 2번출구",
    arrivalInfo: [
      {
        time: "9분 43초",
        station: "4번째전",
        status: "보통" as ArrivalInfo["status"],
      },
    ],
  },
  {
    id: 2,
    number: "6",
    route: "공대 → 자연대 → 지정단 4번출구 (10분 이상 소요)",
    arrivalInfo: [
      {
        time: "9분 43초",
        station: "4번째전",
        status: "보통" as ArrivalInfo["status"],
      },
    ],
  },
];
