import { css, keyframes } from "styled-components";

/**
 * Apple Fluid Interfaces & Toss Simplicity 모션 표준 토큰
 * 
 * - 과도한 오버슈트 바운스나 긴 지연시간(AI Slop)을 배제하고,
 * - 사람의 반응 속도에 맞춘 0.12s ~ 0.4s 이내의 고속·자연스러운 감속 곡선을 제공합니다.
 */
export const motionTokens = {
  /** Apple 및 Toss 표준 감속 곡선 (기계적인 느낌 없이 부드럽게 감속) */
  easeOut: "cubic-bezier(0.16, 1, 0.3, 1)",
  /** 부드러운 가속 곡선 */
  easeIn: "cubic-bezier(0.4, 0, 1, 1)",
  /** 유연한 가감속 곡선 */
  easeInOut: "cubic-bezier(0.65, 0, 0.35, 1)",

  /** 물리 스프링 파라미터 (framer-motion 전용) */
  spring: {
    stiff: { type: "spring", stiffness: 450, damping: 32 },
    gentle: { type: "spring", stiffness: 320, damping: 28 },
    snappy: { type: "spring", stiffness: 500, damping: 36, mass: 0.8 },
  },

  /** 표준 지속 시간 */
  duration: {
    instant: "0.12s",
    fast: "0.2s",
    normal: "0.32s",
    gentle: "0.45s",
  },
} as const;

/**
 * iOS Widget / App Icon 스타일의 햅틱 스퀴시(Squish) 터치 피드백
 * 
 * - 터치/클릭하는 순간 카드가 97.5%로 미세하게 가라앉고 그림자가 압축되며,
 * - 손을 떼는 순간 스프링처럼 쫀득하게 튕겨 올라옵니다.
 * - 모션 줄이기(prefers-reduced-motion) 환경에서는 즉각 반응합니다.
 */
export const squishActive = css`
  transition: transform ${motionTokens.duration.instant} ${motionTokens.easeOut},
              box-shadow ${motionTokens.duration.instant} ${motionTokens.easeOut},
              opacity ${motionTokens.duration.instant} ease;
  -webkit-tap-highlight-color: transparent;

  &:active {
    transform: scale(0.975);
    opacity: 0.94;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none !important;
    &:active {
      transform: none !important;
      opacity: 1 !important;
    }
  }
`;

/**
 * 미세 페이드 인 키프레임 (0.2s 단발성)
 */
export const subtleFadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

/**
 * 실시간 상태 표시용 잔잔한 펄스 링 (Dynamic Island / AirTag 스타일)
 */
export const livePulseRing = keyframes`
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(240, 68, 82, 0.55);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 4px rgba(240, 68, 82, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(240, 68, 82, 0);
  }
`;
