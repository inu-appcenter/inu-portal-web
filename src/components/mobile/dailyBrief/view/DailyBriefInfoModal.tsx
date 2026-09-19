import styled from "styled-components";
import Modal from "@/components/common/Modal";

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Daily Brief 안내"
      primaryButton={{
        text: "확인",
        onClick: onClose,
        variant: "brand",
      }}
    >
      <ModalBody>
        <FeatureList>
          <FeatureItem>
            <FeatureIcon>🎓</FeatureIcon>
            <FeatureTextCol>
              <FeatureName>캠퍼스 하루 맞춤 브리핑</FeatureName>
              <FeatureDesc>
                오늘의 강의 시간표부터 캠퍼스 날씨, 학식 메뉴, 실시간 버스, 열람실 좌석, LMS 과제 및 공지사항을 한눈에 확인하세요.
              </FeatureDesc>
            </FeatureTextCol>
          </FeatureItem>

          <FeatureItem>
            <FeatureIcon>🌤️</FeatureIcon>
            <FeatureTextCol>
              <FeatureName>시간대 & 날씨 맞춤 인터페이스</FeatureName>
              <FeatureDesc>
                아침, 오후, 저녁, 밤 시간대와 실시간 날씨에 맞춰 변화하는 배경 테마와 횃불이의 응원 멘트가 함께합니다.
              </FeatureDesc>
            </FeatureTextCol>
          </FeatureItem>

          <FeatureItem>
            <FeatureIcon>⚙️</FeatureIcon>
            <FeatureTextCol>
              <FeatureName>브리핑 순서 및 알림 설정</FeatureName>
              <FeatureDesc>
                우측 하단 설정 버튼을 통해 내가 자주 보는 카드의 순서를 조정하고 맞춤 브리핑 루틴을 설정할 수 있습니다.
              </FeatureDesc>
            </FeatureTextCol>
          </FeatureItem>
        </FeatureList>
      </ModalBody>
    </Modal>
  );
}

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  padding: 4px 0 8px 0;
`;

const FeatureList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  text-align: left;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background-color: #f8fafc;
  padding: 12px 14px;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
`;

const FeatureIcon = styled.span`
  font-size: 22px;
  line-height: 1.2;
  margin-top: 1px;
  flex-shrink: 0;
`;

const FeatureTextCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const FeatureName = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: -0.2px;
`;

const FeatureDesc = styled.span`
  font-size: 12.5px;
  font-weight: 500;
  color: #64748b;
  line-height: 1.45;
  letter-spacing: -0.2px;
`;
