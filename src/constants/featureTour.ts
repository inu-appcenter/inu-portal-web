import type { IconType } from "react-icons";
import {
  LuCalculator,
  LuMousePointerClick,
  LuUsers,
  LuWandSparkles,
} from "react-icons/lu";

import { ROUTES } from "@/constants/routes";

export interface FeatureTourItem {
  id: string;
  icon: IconType;
  title: string;
  /** 기능 설명은 한 줄로. 읽는 데 드는 비용이 곧 이탈이다. */
  description: string;
  route: string;
}

/**
 * 최초 진입 시 한 번 보여주는 신규 기능 목록.
 *
 * 설명을 늘어놓는 대신 "하나 골라서 바로 써보기"가 목적이라, 항목은
 * 4개를 넘기지 않는다. 더 늘려야 한다면 실험실 페이지로 보내는 편이 낫다.
 */
export const FEATURE_TOUR_ITEMS: FeatureTourItem[] = [
  {
    id: "timetable-wizard",
    icon: LuWandSparkles,
    title: "시간표 마법사",
    description: "공강·오전 수업 같은 조건만 정하면 시간표를 대신 짜줘요",
    route: ROUTES.TIMETABLE.WIZARD,
  },
  {
    id: "timetable-compare",
    icon: LuUsers,
    title: "친구와 시간표 공유",
    description: "친구들과 겹치는 공강을 찾아 약속을 잡아요",
    route: ROUTES.TIMETABLE.COMPARE,
  },
  {
    id: "grade-calculator",
    icon: LuCalculator,
    title: "성적 붙여넣기",
    description: "스마트캠퍼스 성적을 복붙하면 학점이 자동으로 계산돼요",
    route: ROUTES.TIMETABLE.CALCULATOR,
  },
  {
    id: "sugang-simulator",
    icon: LuMousePointerClick,
    title: "수강신청 시뮬레이터",
    description: "실제와 비슷한 화면에서 수강신청을 미리 연습해요",
    route: ROUTES.TIMETABLE.SIMULATOR,
  },
];
