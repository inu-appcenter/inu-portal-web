import 일산김포시간표 from "@/resources/assets/bus/일산김포시간표.jpeg";
import 부천송내시간표 from "@/resources/assets/bus/부천송내시간표.jpeg";
import 안산시흥시간표 from "@/resources/assets/bus/안산시흥시간표.jpeg";

export const SHUTTLE_ROUTES = [
  {
    id: "ilsan-gimpo",
    name: "일산 / 김포",
    buttonImage: "/Bus/일산김포버튼.svg",
    infoImage: 일산김포시간표,
    isActive: false,
  },
  {
    id: "bucheon",
    name: "부천 / 송내",
    buttonImage: "/Bus/부천송내버튼.svg",
    infoImage: 부천송내시간표,
    isActive: true,
  },
  {
    id: "ansan-siheung",
    name: "안산 / 시흥",
    buttonImage: "/Bus/안산시흥버튼.svg",
    infoImage: 안산시흥시간표,
    isActive: true,
  },
];
