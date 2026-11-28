import styled, { keyframes } from "styled-components";
import {
  onboardingPortalMagnifier,
  onboardingPortalWindow,
} from "@/resources/assets/illustrations/onboarding";

/**
 * Figma lookingup (6304:22848): 창 + 돋보기. 돋보기는 시안처럼 살짝 움직인다.
 * 온보딩 포털 계정 등록과 학점계산기 포털 성적 가져오기에서 같이 쓴다.
 */
export default function PortalLookupIllustration() {
  return (
    <Wrapper aria-hidden>
      <img className="window" src={onboardingPortalWindow} alt="" />
      <img className="magnifier" src={onboardingPortalMagnifier} alt="" />
    </Wrapper>
  );
}

const float = keyframes`
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  50% { transform: translate(6px, 4px) rotate(-6deg); }
`;

const Wrapper = styled.div`
  position: relative;
  width: 240px;
  height: 240px;
  flex-shrink: 0;

  .window {
    position: absolute;
    top: 20.76%;
    right: 20.23%;
    bottom: 20.89%;
    left: 20.24%;
    width: 59.53%;
    height: 58.35%;
  }

  .magnifier {
    position: absolute;
    top: 22.12%;
    left: 16.26%;
    width: 26.07%;
    height: 26.07%;
    animation: ${float} 2.4s ease-in-out infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    .magnifier {
      animation: none;
    }
  }
`;
