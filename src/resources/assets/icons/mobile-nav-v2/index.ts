import BusIcon from "./bus.svg?react";
import ChatIcon from "./chat.svg?react";
import HomeIcon from "./home.svg?react";
import MyIcon from "./my.svg?react";
import TimetableIcon from "./timetable.svg?react";

/**
 * 신(新) 하단 내비게이션(MobileBottomNav.tsx, 사용 중)의 탭 아이콘.
 * 원본 fill 값(#B0B8C1)은 이미 소비처(MobileBottomNav.tsx)의
 * `IconWrapper` CSS가 `svg path { fill: currentColor; }`로 덮어쓰고 있어
 * 실질적으로 currentColor처럼 동작했다. 여기서는 소스 자체를
 * currentColor로 정리해 그 암묵적 동작을 명시적으로 맞췄다(렌더 결과 동일).
 */
export { BusIcon, ChatIcon, HomeIcon, MyIcon, TimetableIcon };
