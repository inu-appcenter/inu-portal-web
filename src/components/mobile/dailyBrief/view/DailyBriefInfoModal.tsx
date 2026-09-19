import styled from "styled-components";
import Modal from "@/components/common/Modal";
import Icon from "@/components/common/Icon";

interface DailyBriefInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DailyBriefInfoModal({
  isOpen,
  onClose,
}: DailyBriefInfoModalProps) {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Daily Brief 안내">
      <ModalContentWrapper>
        <IconCircle>
          <Icon name="info" size={24} color="#3B82F6" />
        </IconCircle>

        <ModalTitle>Daily Brief 안내</ModalTitle>
        <ModalSubtitle>
          나의 하루를 지능적으로 요약해 주는 맞춤형 브리핑 허브
        </ModalSubtitle>

        <FeatureList>
          <FeatureItem>
            <FeatureIcon>☀️</FeatureIcon>
            <FeatureTextCol>
              <FeatureName>상황 맞춤형 인텔리전스</FeatureName>
              <FeatureDesc>
                시간대와 학사 일정, 날씨 정보를 종합하여 지금 필요한 정보를
                한눈에 요약해 드립니다.
              </FeatureDesc>
            </FeatureTextCol>
          </FeatureItem>

          <FeatureItem>
            <FeatureIcon>🔊</FeatureIcon>
            <FeatureTextCol>
              <FeatureName>음성 브리핑 (Voice TTS)</FeatureName>
              <FeatureDesc>
                우측 상단의 오디오 버튼을 누르면 바쁜 등교 준비 중에도 음성으로
                브리핑을 들으실 수 있습니다.
              </FeatureDesc>
            </FeatureTextCol>
          </FeatureItem>

          <FeatureItem>
            <FeatureIcon>⚙️</FeatureIcon>
            <FeatureTextCol>
              <FeatureName>나만의 맞춤 설정</FeatureName>
              <FeatureDesc>
                우측 하단 설정 버튼을 통해 시간표 알림 시간, 학사일정 수신 범위
                등을 자유롭게 설정할 수 있습니다.
              </FeatureDesc>
            </FeatureTextCol>
          </FeatureItem>
        </FeatureList>

        <CloseButton onClick={onClose}>확인</CloseButton>
      </ModalContentWrapper>
    </Modal>
  );
}

const ModalContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 10px 4px;
`;

const IconCircle = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 26px;
  background-color: #eff6ff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.5px;
  margin: 0 0 6px 0;
`;

const ModalSubtitle = styled.p`
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  margin: 0 0 24px 0;
  letter-spacing: -0.3px;
`;

const FeatureList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  text-align: left;
  margin-bottom: 24px;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background-color: #f8fafc;
  padding: 14px 16px;
  border-radius: 18px;
`;

const FeatureIcon = styled.span`
  font-size: 22px;
  line-height: 1;
  margin-top: 2px;
`;

const FeatureTextCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const FeatureName = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: -0.2px;
`;

const FeatureDesc = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  line-height: 1.4;
`;

const CloseButton = styled.button`
  width: 100%;
  height: 48px;
  border-radius: 24px;
  background: #2563eb;
  border: none;
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
  cursor: pointer;
  transition: background-color 0.15s ease;

  &:active {
    background: #1d4ed8;
  }
`;
