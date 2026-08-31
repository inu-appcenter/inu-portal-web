/**
 * 횃불이 AI 관련 일러스트/이미지. 이름으로 조회하지 않는 고정 에셋이라
 * map/markers/의 named export 배럴 패턴을 따른다.
 *
 * - torchAiLogo: 마스코트 로고. 그라디언트·다색이라 icons/가 아닌 illustrations/.
 * - loadingSpinner: 단색(#3f30a0) SVG animate 스피너지만, 유일한 소비처인
 *   AiLoading.tsx(죽은 컴포넌트)가 `<img src>`로만 쓰고 색을 바꿔 쓸 일이 없어
 *   currentColor로 바꾸지 않았다(바꾸면 <img> 컨텍스트에서 currentColor가
 *   기본값(검정)으로 풀려 오히려 렌더가 깨진다). 고정 라스터처럼 취급.
 */
export { default as torchAiLogo } from "./torch-ai-logo.svg";
export { default as TorchAiLogoIcon } from "./torch-ai-logo.svg?react";
export { default as timetableEvaluateTorch } from "./timetable-evaluate-torch.svg";
export { default as TimetableEvaluateTorchIcon } from "./timetable-evaluate-torch.svg?react";
export { default as aiBanner } from "./ai-banner.webp";
export { default as chatBubbleButton } from "./chat-bubble-button.webp";
export { default as torchAiEnter1 } from "./torch-ai-enter-1.webp";
export { default as torchAiEnter2 } from "./torch-ai-enter-2.webp";
export { default as torchRandom1 } from "./torch-random-1.webp";
export { default as torchRandom2 } from "./torch-random-2.webp";
export { default as torchRandom3 } from "./torch-random-3.webp";
export { default as loadingSpinner } from "./loading-spinner.svg";
