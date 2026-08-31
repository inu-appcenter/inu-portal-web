/**
 * 캠퍼스 건물 지도 핀.
 *
 * 키(한글 호관명)는 지도 데이터에서 오는 값이므로 그대로 유지해야 한다.
 * 파일명은 ASCII 슬러그이고, 이 매핑이 그 경계 역할을 한다.
 */
import Building1 from "./building-1.svg";
import Building10 from "./building-10.svg";
import Building11 from "./building-11.svg";
import Building12 from "./building-12.svg";
import Building13 from "./building-13.svg";
import Building14 from "./building-14.svg";
import Building15 from "./building-15.svg";
import Building16 from "./building-16.svg";
import Building17 from "./building-17.svg";
import Building181 from "./building-18-1.svg";
import Building182 from "./building-18-2.svg";
import Building183 from "./building-18-3.svg";
import Building19 from "./building-19.svg";
import Building2 from "./building-2.svg";
import Building20 from "./building-20.svg";
import Building21 from "./building-21.svg";
import Building22 from "./building-22.svg";
import Building23 from "./building-23.svg";
import Building24 from "./building-24.svg";
import Building25 from "./building-25.svg";
import Building26 from "./building-26.svg";
import Building27 from "./building-27.svg";
import Building28 from "./building-28.svg";
import Building29 from "./building-29.svg";
import Building3 from "./building-3.svg";
import Building30 from "./building-30.svg";
import Building4 from "./building-4.svg";
import Building5 from "./building-5.svg";
import Building6 from "./building-6.svg";
import Building7 from "./building-7.svg";
import Building8 from "./building-8.svg";
import Building9 from "./building-9.svg";
import BuildingA from "./building-a.svg";
import BuildingB from "./building-b.svg";

export const BUILDING_PINS = {
  "1호관": Building1,
  "2호관": Building2,
  "3호관": Building3,
  "4호관": Building4,
  "5호관": Building5,
  "6호관": Building6,
  "7호관": Building7,
  "8호관": Building8,
  "9호관": Building9,
  "10호관": Building10,
  "11호관": Building11,
  "12호관": Building12,
  "13호관": Building13,
  "14호관": Building14,
  "15호관": Building15,
  "16호관": Building16,
  "17호관": Building17,
  "18-1호관": Building181,
  "18-2호관": Building182,
  "18-3호관": Building183,
  "19호관": Building19,
  "20호관": Building20,
  "21호관": Building21,
  "22호관": Building22,
  "23호관": Building23,
  "24호관": Building24,
  "25호관": Building25,
  "26호관": Building26,
  "27호관": Building27,
  "28호관": Building28,
  "29호관": Building29,
  "30호관": Building30,
  미추홀별관A동: BuildingA,
  미추홀별관B동: BuildingB,
} as const satisfies Record<string, string>;

export type BuildingPinName = keyof typeof BUILDING_PINS;
