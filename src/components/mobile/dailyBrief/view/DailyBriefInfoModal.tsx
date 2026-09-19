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
      title="Daily Brief에 대해 알아보세요"
      primaryButton={{
        text: "확인",
        onClick: onClose,
        variant: "brand",
      }}
    >
      <ModalBody>
        <FeatureList>
          <FeatureItem>
            <FeatureIcon>✨</FeatureIcon>
            <FeatureTextCol>
              <FeatureName>지금 필요한 카드를 먼저 보여줘요</FeatureName>
              <FeatureDesc>
                수업 전에는 <b>강의실과 시간표</b>, 밥 먹을 땐 <b>학식 메뉴</b>,
                집 갈 땐 <b>도착 버스</b>처럼 그때그때 가장 필요한 정보를 맨
                위에 알아서 띄워드려요.
              </FeatureDesc>
            </FeatureTextCol>
          </FeatureItem>

          <FeatureItem>
            <FeatureIcon>⚙️</FeatureIcon>
            <FeatureTextCol>
              <FeatureName>카드 순서를 내 마음대로 바꿔요</FeatureName>
              <FeatureDesc>
                자주 보는 카드를 위로 올리거나 필요 없는 카드는 숨길 수 있어요.
                오른쪽 아래 설정 버튼에서 언제든지 바꿀 수 있어요.
              </FeatureDesc>
            </FeatureTextCol>
          </FeatureItem>

          <FeatureItem>
            <FeatureIcon>📍</FeatureIcon>
            <FeatureTextCol>
              <FeatureName>캠퍼스 소식을 한눈에 챙겨드려요</FeatureName>
              <FeatureDesc>
                열람실 빈자리부터 빠른 버스, 학교와 학과 공지, 캠퍼스 날씨까지
                여기저기 찾아다닐 필요 없이 한곳에서 편하게 확인해요.
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
