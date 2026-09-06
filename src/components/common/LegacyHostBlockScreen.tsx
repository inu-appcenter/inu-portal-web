import styled, { keyframes } from "styled-components";
import { HiOutlineArrowPath, HiOutlineExclamationTriangle } from "react-icons/hi2";
import { NEW_SITE_URL } from "@/utils/legacyHost";

interface LegacyHostBlockScreenProps {
  /** "그래도 들어가기"를 눌렀을 때. 안내를 넘기고 이 주소 그대로 앱을 띄운다. */
  onContinue: () => void;
}

/**
 * 구 배포 도메인(intip-test.pages.dev)으로 들어온 사용자에게 보여주는 전체 화면 안내.
 *
 * 앱(WebView)은 예전 주소를 캐싱한 채 켜질 수 있는데, 이 주소로는 정상 동작을 보장하지
 * 않으므로 리다이렉트 대신 앱 재시작을 안내한다. 브라우저로 들어온 경우를 위해 새 주소
 * 링크를, 이 주소를 의도적으로 쓰는 경우를 위해 "그래도 들어가기"를 함께 둔다.
 */
export default function LegacyHostBlockScreen({ onContinue }: LegacyHostBlockScreenProps) {
  return (
    <ScreenWrapper>
      <AmbientOrb className="left" />
      <AmbientOrb className="right" />

      <Card>
        <IconWrap aria-hidden="true">
          <HiOutlineExclamationTriangle />
        </IconWrap>

        <Title>앱을 껐다가 다시 켜주세요</Title>
        <Description>
          INTIP 주소가 변경되었어요. 지금 접속한 주소는 더 이상 사용되지 않아요.
          <br />앱을 완전히 종료한 뒤 다시 실행하면 정상적으로 이용할 수 있어요.
        </Description>

        <Steps>
          <li>최근 앱 목록에서 INTIP을 완전히 종료해요.</li>
          <li>잠시 후 INTIP을 다시 실행해요.</li>
        </Steps>

        <NewSiteLink href={NEW_SITE_URL}>
          <HiOutlineArrowPath aria-hidden="true" />
          브라우저로 보고 있다면 새 주소로 이동하기
        </NewSiteLink>

        <ContinueButton type="button" onClick={onContinue}>
          그래도 들어가기
        </ContinueButton>

        <FooterText>{NEW_SITE_URL}</FooterText>
      </Card>
    </ScreenWrapper>
  );
}

const float = keyframes`
  0% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(0, -18px, 0) scale(1.03);
  }
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
`;

const ScreenWrapper = styled.main`
  position: fixed;
  inset: 0;
  z-index: 2147483647;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background:
    radial-gradient(circle at top, rgba(131, 185, 255, 0.28), transparent 40%),
    linear-gradient(180deg, #f8fbff 0%, #eef4fb 48%, #e6edf7 100%);
`;

const AmbientOrb = styled.div`
  position: absolute;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  filter: blur(18px);
  opacity: 0.75;
  animation: ${float} 7s ease-in-out infinite;

  &.left {
    top: 8%;
    left: -80px;
    background: radial-gradient(circle, rgba(79, 137, 221, 0.28) 0%, transparent 72%);
  }

  &.right {
    right: -60px;
    bottom: 8%;
    background: radial-gradient(circle, rgba(255, 157, 110, 0.24) 0%, transparent 70%);
    animation-delay: 1.5s;
  }
`;

const Card = styled.section`
  position: relative;
  z-index: 1;
  width: min(100%, 480px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 32px 24px;
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.72);
  background: rgba(255, 255, 255, 0.86);
  box-shadow:
    0 24px 60px rgba(28, 57, 105, 0.14),
    inset 0 1px 0 rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  text-align: center;
`;

const IconWrap = styled.div`
  width: 68px;
  height: 68px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 22px;
  background: linear-gradient(135deg, #1f5fbf 0%, #5f9cff 100%);
  color: #ffffff;
  box-shadow: 0 18px 32px rgba(58, 114, 201, 0.3);

  svg {
    font-size: 34px;
  }
`;

const Title = styled.h1`
  margin: 0;
  color: #16335b;
  font-size: clamp(24px, 5vw, 30px);
  font-weight: 900;
  line-height: 1.2;
  letter-spacing: -0.03em;
  word-break: keep-all;
`;

const Description = styled.p`
  margin: 0;
  color: #526b8f;
  font-size: 15px;
  line-height: 1.7;
  word-break: keep-all;
`;

const Steps = styled.ol`
  margin: 0;
  padding: 16px 18px 16px 34px;
  width: 100%;
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(244, 248, 255, 0.96) 0%, rgba(234, 241, 252, 0.98) 100%);
  border: 1px solid rgba(211, 223, 241, 0.95);
  list-style: decimal;
  text-align: left;
  color: #35547f;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.8;
  word-break: keep-all;
`;

const NewSiteLink = styled.a`
  width: 100%;
  min-height: 56px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 0 18px;
  border-radius: 18px;
  color: #ffffff;
  background: linear-gradient(135deg, #1f5fbf 0%, #4f87de 100%);
  box-shadow: 0 16px 30px rgba(31, 95, 191, 0.28);
  font-size: 15px;
  font-weight: 800;
  text-decoration: none;
  word-break: keep-all;

  svg {
    font-size: 18px;
    flex-shrink: 0;
  }

  &:active {
    transform: scale(0.985);
  }
`;

const ContinueButton = styled.button`
  width: 100%;
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 18px;
  border-radius: 16px;
  border: 1px solid rgba(151, 175, 208, 0.6);
  background: transparent;
  color: #52708f;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  word-break: keep-all;

  &:active {
    transform: scale(0.985);
    background: rgba(31, 95, 191, 0.06);
  }
`;

const FooterText = styled.p`
  margin: -4px 0 0;
  color: #8197b6;
  font-size: 12px;
  line-height: 1.6;
  word-break: break-all;
`;
