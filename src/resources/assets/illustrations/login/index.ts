/**
 * 로그인 화면들에서 쓰는 다색 일러스트/브랜드 이미지. 이름으로 조회하지 않는
 * 고정 에셋이라 named export로 둔다. 단색 아이콘(login-user, login-password)은
 * `currentColor` 대상이라 여기 대신 `icons/ui/`로 옮겼다.
 *
 * 원래 `login/`(4파일)과 `mobile-login/`(1파일)로 나뉘어 있었지만 둘 다
 * "로그인 화면의 브랜드 이미지"라는 같은 성질이라 배럴 하나로 묶었다.
 */
export { default as loginModalLogo } from "./login-modal-logo.webp";
export { default as loginModalBubble } from "./login-modal-bubble.svg";
export { default as mobileLoginLogoWithText } from "./logo-with-text.webp";
