import styled from "styled-components";
import { isAndroidOfficial } from "@/utils/appBridgeAdapter";

interface AppUpdateModalProps {
  onUpdate?: () => void;
}

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=inu.appcenter.intip_android";
const APP_STORE_URL = "https://apps.apple.com/app/id6503956321"; // iOS 앱 스토어 ID가 결정되면 수정 가능하도록 설정

export default function AppUpdateModal({ onUpdate }: AppUpdateModalProps) {
  const handleUpdate = () => {
    if (onUpdate) {
      onUpdate();
      return;
    }

    if (isAndroidOfficial()) {
      window.location.href = PLAY_STORE_URL;
    } else {
      window.location.href = APP_STORE_URL;
    }
  };

  return (
    <ModalOverlay>
      <ModalContainer>
        <IconContainer>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
        </IconContainer>
        <Title>업데이트 안내</Title>
        <Description>
          인팁(INTIP) 서비스의 기능 개선 및 더욱 안전하고 원활한 앱 환경을 위해 최신 버전으로 업데이트가 필요합니다.
        </Description>
        <UpdateButton onClick={handleUpdate}>
          최신 버전으로 업데이트
        </UpdateButton>
      </ModalContainer>
    </ModalOverlay>
  );
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #f8f9fa;
  z-index: 99999;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
  box-sizing: border-box;
`;

const ModalContainer = styled.div`
  background-color: #ffffff;
  border-radius: 24px;
  width: 100%;
  max-width: 380px;
  padding: 40px 24px;
  box-sizing: border-box;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const IconContainer = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background-color: #f1f3f5;
  color: #495057;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h2`
  font-size: 22px;
  font-weight: 700;
  color: #212529;
  margin: 0 0 16px 0;
`;

const Description = styled.p`
  font-size: 14px;
  line-height: 1.6;
  color: #868e96;
  margin: 0 0 32px 0;
  word-break: keep-all;
`;

const UpdateButton = styled.button`
  width: 100%;
  height: 52px;
  background-color: #002d62; /* 인팁 메인 네이비 색상 계열 */
  color: #ffffff;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  outline: none;
  transition: transform 0.1s ease, background-color 0.2s ease;

  &:active {
    transform: scale(0.96); /* 토스식 눌림 피드백 적용 */
    background-color: #001f44;
  }
`;
