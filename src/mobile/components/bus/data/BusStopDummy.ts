import { BusStopData } from "types/bus.ts";

export const BusStopDummy: BusStopData[] = [
  {
    id: "go-school-INU2",
    stopName: "인천대입구역 2번 출구",
    stopNotice:
      "※ 계단에서 줄서기를 꼭 지켜주세요!\n차양막과 여름철 안개 분사 장치가 있어 대기 중에도 쾌적해요.",
    busList: ["셔틀", "8", "16", "41"],
    lat: 37.38547992733756,
    lng: 126.63872424244481,
  },
  {
    id: "go-school-INU1",
    stopName: "인천대입구역 1번 출구",
    stopNotice: "※ 에스컬레이터가 있어 이동하기 편리합니다.",
    busList: ["46"],
    lat: 37.385140392568694,
    lng: 126.63892065212548,
  },
  {
    id: "go-school-BIT3",
    stopName: "지식정보단지역",
    stopNotice: "※ 엘리베이터를 타면 정류장을 쉽게 찾을 수 있어요.",
    busList: ["6-1"],
    lat: 37.37862478339092,
    lng: 126.64521251646616,
  },
  {
    id: "go-home-main-out",
    stopName: "인천대 정문",
    stopNotice: "※ 인문대 학생들이 이용하기 좋아요.",
    busList: ["셔틀", "8", "16", "58"],
    lat: 37.37838746332504,
    lng: 126.63458920609504,
  },
  {
    id: "go-home-main-in",
    stopName: "인천대 정문",
    stopNotice: "※ 정류장 위치를 꼭 확인해주세요!",
    busList: ["46"],
    lat: 37.377628082135054,
    lng: 126.63523080363775,
  },
  {
    id: "go-home-engineering",
    stopName: "인천대 공과대학",
    stopNotice: "※ 줄 서기를 꼭 지켜주세요!",
    busList: ["셔틀", "8", "6-1", "6"],
    lat: 37.37238638306375,
    lng: 126.63451098800367,
  },
  {
    id: "go-home-science",
    stopName: "인천대 자연과학대학",
    stopNotice: "※ 정보대, 자연대 학생들이 이용하기 좋아요.",
    busList: ["8", "6-1", "6"],
    lat: 37.37427959645153,
    lng: 126.63630545656764,
  },
  {
    id: "go-home-dorm",
    stopName: "인천대 송도캠퍼스",
    stopNotice: "※ 암벽장 앞, 기숙사 근처에 위치해 있어요.",
    busList: ["셔틀", "41", "46"],
    lat: 37.37374085801472,
    lng: 126.6310921152427,
  },
];
