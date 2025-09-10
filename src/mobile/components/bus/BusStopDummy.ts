import { BusStopData } from "types/bus";

export const BusStopDummy: BusStopData[] = [
  {
    id: "go-school-INU2",
    stopName: "인천대입구역",
    sectionLabel: "2번 출구",
    stopNotice:
      " 계단을 통해야 줄서기 가능. \n정류장에 차양막과 여름철 안개 분사 장치가 있어 \n대기 중에도 쾌적함.",
    busList: ["셔틀", "8", "16", "41"],
    lat: 37.38547992733756,
    lng: 126.63872424244481,
  },
  {
    id: "go-school-INU1",
    stopName: "인천대입구역",
    sectionLabel: "1번 출구",
    stopNotice:
      "에스컬레이터가 있어 접근이 편리함. 버스 \n헷갈리지 않도록 주의.",
    busList: ["46"],
    lat: 37.385140392568694,
    lng: 126.63892065212548,
  },
  {
    id: "go-school-BIT3",
    stopName: "지식정보단지역",
    sectionLabel: "3번 출구",
    stopNotice:
      "엘리베이터를 통해 나가는 것을 추천. \n정류장은 에어컨과 폰 충전이 가능한 최신식 시설",
    busList: ["6-1"],
    lat: 37.37862478339092,
    lng: 126.64521251646616,
  },
  {
    id: "go-home-main-out",
    stopName: "인천대 정문",
    sectionLabel: "길 건너",
    stopNotice: "항상 이용객이 많으며, 정차하지 않고 지나치는 경우 있음.",
    busList: ["셔틀", "8", "16", "58"],
    lat: 37.37838746332504,
    lng: 126.63458920609504,
  },
  {
    id: "go-home-main-in",
    stopName: "인천대 정문",
    stopNotice: "학교 올 때 내리는 정류장.",
    busList: ["46"],
    lat: 37.377628082135054,
    lng: 126.63523080363775,
  },
  {
    id: "go-home-engineering",
    stopName: "인천대 공과대학",
    stopNotice:
      "버스 출발지로 도착 정보가 표시되지 않는 경우가 있음.\n 자연대와 동일 노선 정차.",
    busList: ["셔틀", "8", "6-1", "6"],
    lat: 37.37238638306375,
    lng: 126.63451098800367,
  },
  {
    id: "go-home-science",
    stopName: "인천대 자연과학대학",
    stopNotice: "정보대 및 자연대 학생들이 주로 이용.",
    busList: ["8", "6-1", "6"],
    lat: 37.37427959645153,
    lng: 126.63630545656764,
  },
  {
    id: "go-home-dorm",
    stopName: "인천대 송도캠퍼스",
    sectionLabel: "기숙사 앞",
    stopNotice: "암벽장 앞에 위치.",
    busList: ["셔틀", "41", "46"],
    lat: 37.37374085801472,
    lng: 126.6310921152427,
  },
];
