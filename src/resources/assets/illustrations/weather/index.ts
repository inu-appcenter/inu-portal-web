import sun from "./sun.webp";
import moon from "./moon.webp";
import cloud from "./cloud.webp";
import cloudMoon from "./cloud-moon.webp";
import snow from "./snow.svg";
import sleet from "./sleet.svg";
import rain from "./rain.svg";
import pmGradeGood from "./pm-grade-good.svg";
import pmGradeNormal from "./pm-grade-normal.svg";
import pmGradeHarm from "./pm-grade-harm.svg";
import pmGradeVeryHarm from "./pm-grade-very-harm.svg";
import weatherBackground from "./weather-background.svg";

/**
 * 서버가 내려주는 한글 하늘 상태(sky) → ASCII 슬러그 매핑.
 * 원본 파일명(pmGrade-*, cloud_moon 등)은 케이스가 뒤섞여 있어 그대로는
 * 식별자로 쓸 수 없어 이 매핑이 경계 역할을 한다.
 * 하늘 상태 값(키) 자체는 서버 응답과 그대로 맞춰야 하므로 절대 바꾸지 말 것.
 */
export const SKY_CONDITION_SLUGS = {
  맑음: "clear",
  구름: "cloudy",
  눈: "snow",
  진눈깨비: "sleet",
  비: "rain",
} as const satisfies Record<string, string>;

export type SkyConditionName = keyof typeof SKY_CONDITION_SLUGS;
export type SkyConditionSlug = (typeof SKY_CONDITION_SLUGS)[SkyConditionName];

/** 폴백(알 수 없는 하늘 상태)에 쓰는 슬러그. 서버가 예상 밖 값을 내려줘도 깨지지 않는다. */
export const FALLBACK_SKY_CONDITION_SLUG = "clear" as const;

type SkyIllustration = {
  day: string;
  night: string;
  /** 아이콘을 좌우로 살짝 옮겨 표시해야 하는지 여부(눈/진눈깨비/비 아이콘의 시각적 여백 보정). */
  isShiftedIcon: boolean;
};

/**
 * 하늘 상태별 낮/밤 일러스트. 눈/진눈깨비/비는 낮·밤 이미지가 동일하다(원본 동작 유지).
 */
export const SKY_ILLUSTRATIONS = {
  clear: { day: sun, night: moon, isShiftedIcon: false },
  cloudy: { day: cloud, night: cloudMoon, isShiftedIcon: false },
  snow: { day: snow, night: snow, isShiftedIcon: true },
  sleet: { day: sleet, night: sleet, isShiftedIcon: true },
  rain: { day: rain, night: rain, isShiftedIcon: true },
} as const satisfies Record<SkyConditionSlug, SkyIllustration>;

/**
 * 서버가 내려주는 한글 미세먼지 등급(pm10Grade) → ASCII 슬러그 매핑.
 */
export const PM_GRADE_SLUGS = {
  좋음: "good",
  보통: "normal",
  나쁨: "harm",
  매우나쁨: "very-harm",
} as const satisfies Record<string, string>;

export type PmGradeName = keyof typeof PM_GRADE_SLUGS;
export type PmGradeSlug = (typeof PM_GRADE_SLUGS)[PmGradeName];

/** 미세먼지 등급별 배지 일러스트. 매핑에 없는 등급은 표시하지 않는다(원본 동작 유지). */
export const PM_GRADE_ILLUSTRATIONS = {
  good: pmGradeGood,
  normal: pmGradeNormal,
  harm: pmGradeHarm,
  "very-harm": pmGradeVeryHarm,
} as const satisfies Record<PmGradeSlug, string>;

/** 날씨 카드 고정 배경(하늘 상태와 무관). */
export const WEATHER_BACKGROUND = weatherBackground;
