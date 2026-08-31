/**
 * `src/resources/assets/` 바로 아래 흩어져 있던 브랜드 로고 5개를 모은 배럴.
 * 이름으로 조회하지 않는 고정 에셋이라 named export로 둔다.
 *
 * - appcenterLogo / appcenterLogoMark: 앱센터(App Center) 로고. 전자는 문구 포함
 *   가로형, 후자는 문구를 뺀 마크만 있는 버전(원래 파일명 `앱센터로고_글씨x.png`의
 *   "글씨X" = "문구 없음").
 * - intipLogoMascot / intipLogoWordmark: INTIP 로고의 두 버전. 전자는 마스코트
 *   캐릭터가 포함된 구 버전(원래 `intip-logo.webp`), 후자는 마스코트 없이 워드마크만
 *   있는 현재 버전(원래 `intip-logo-new.webp`). 두 버전 모두 화면별로 실제 쓰이고
 *   있어(데스크톱 Nav·모바일 MenuButton은 마스코트 버전, 모바일 헤더는 워드마크
 *   버전) 어느 하나로 통합하지 않았다. "-new"는 시간이 지나면 의미를 잃으므로
 *   실제로 무엇이 다른지(마스코트 유무)로 이름을 바꿨다.
 * - copyrightText: 푸터의 저작권 문구 이미지.
 */
export { default as appcenterLogo } from "./appcenter-logo.webp";
export { default as appcenterLogoMark } from "./appcenter-logo-mark.png";
export { default as intipLogoMascot } from "./intip-logo-mascot.webp";
export { default as intipLogoWordmark } from "./intip-logo-wordmark.webp";
export { default as copyrightText } from "./copyright-text.svg";
