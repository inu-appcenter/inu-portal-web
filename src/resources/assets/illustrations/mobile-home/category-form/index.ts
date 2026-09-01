/**
 * 홈 화면 카테고리 진입 아이콘(다색 일러스트). 서버 문자열 → 슬러그 매핑을 쓰는
 * icons/category/CategoryIcon.tsx 패턴 재사용을 검토했으나 맞지 않아 채택하지
 * 않았다: 이 세트는 소비처(Category.tsx, MenuButton.tsx)가 모두 고정된 8~9개
 * 항목을 화면에 나열할 뿐, 서버가 내려주는 런타임 문자열로 아이콘을 조회하지
 * 않는다(각 소비처가 이미 파일명 그대로 고정 import). 그래서 이름→슬러그
 * 매핑 테이블이나 CategoryIcon 같은 룩업 컴포넌트를 새로 만들 필요가 없고,
 * map/markers/의 "이름으로 조회하지 않는 고정 에셋" named export 배럴이 더
 * 정직한 선례다.
 *
 * 또한 각 파일이 여러 fill 색(#9CAFE2, #4071B9 등)을 쓰는 다색 일러스트라
 * icons/가 아니라 illustrations/에 둔다(단색 currentColor 변환 대상 아님).
 * menu.svg는 data:image base64 래스터 임베드(가짜 SVG)라 currentColor 자체가
 * 불가능하다.
 *
 * input.svg는 원본부터 어디서도 참조되지 않는 미참조 에셋이었다(감사 보고서
 * [3a]). 삭제 대신 세트의 일부로 이관만 한다.
 */
export { default as bus } from "./bus.svg";
export { default as calendar } from "./calendar.svg";
export { default as club } from "./club.svg";
export { default as council } from "./council.svg";
export { default as input } from "./input.svg";
export { default as map } from "./map.svg";
export { default as menu } from "./menu.svg";
export { default as notice } from "./notice.svg";
export { default as schoolNotice } from "./school-notice.svg";
export { default as tip } from "./tip.svg";
export { default as util } from "./util.svg";
