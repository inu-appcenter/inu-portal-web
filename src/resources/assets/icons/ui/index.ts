import CafeteriaArrowIcon from "./cafeteria-arrow.svg?react";
import BusInfoIcon from "./bus-info.svg?react";
import CouncilSecretIcon from "./council-secret.svg?react";
import LoginUserIcon from "./login-user.svg?react";
import LoginPasswordIcon from "./login-password.svg?react";
import BackIcon from "./back.svg?react";
import CloseIcon from "./close.svg?react";
import DropdownIcon from "./dropdown.svg?react";
import MenuButtonIcon from "./menu-button.svg?react";

/**
 * 소비처가 화면 하나뿐인 단색 UI 아이콘들을 모은 세트.
 * 원래 각각 `mobile-cafeteria/`, `mobile-bus/`, `mobile-council/`라는
 * 화면 단위 디렉터리에 파일 1개씩 흩어져 있었다. 서로 다른 화면이지만 모두
 * "이 화면에 하나만 쓰이는 단색 UI 아이콘"이라는 같은 성질이라 배럴 하나로 묶었다
 * (개별 세트마다 1파일짜리 배럴을 만드는 대신 icons/ui/로 통합 — 슬라이스 지침의
 * "여러 화면의 단색 UI 아이콘을 icons/ui/로" 예시를 따름).
 *
 * - CafeteriaArrowIcon: 원래 #444444 (mobile-cafeteria/Vector.svg)
 * - BusInfoIcon: 원래 #9B9B9B (mobile-bus/busInfo.svg)
 * - CouncilSecretIcon: 원래 #E9E9E9 (mobile-council/secret.svg)
 * - LoginUserIcon: 원래 #969696 (login/login-user.svg)
 * - LoginPasswordIcon: 원래 #969696 (login/login-password.svg)
 * - BackIcon: 원래 black (mobile-common/backbtn.svg, 소비처 3곳)
 * - CloseIcon: 원래 #444444 (mobile-common/closebtn.svg, 소비처 2곳)
 * - DropdownIcon: 원래 #9FA3A6 stroke (mobile-common/dropdown.svg, 소비처 2곳)
 * - MenuButtonIcon: 원래 #444444 (mobile-common/menu-button.svg, 소비처 1곳)
 *
 * mobile-common(구 화면 공용 아이콘 디렉터리)의 4개는 "화면 하나뿐"이 아니라
 * 여러 화면(2~3곳)에서 재사용되던 범용 UI 아이콘이지만, 성격이 이 세트와
 * 동일(단색·소형·화면 어디서든 쓰이는 UI 부품)해 별도 세트를 새로 만들지 않고
 * 여기 합쳤다(중복 방지).
 *
 * 모두 currentColor로 통합했고, 각 호출부에서 color CSS로 원래 색을 재현한다.
 */
export {
  CafeteriaArrowIcon,
  BusInfoIcon,
  CouncilSecretIcon,
  LoginUserIcon,
  LoginPasswordIcon,
  BackIcon,
  CloseIcon,
  DropdownIcon,
  MenuButtonIcon,
};
