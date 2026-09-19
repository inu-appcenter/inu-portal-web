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
            <FeatureIcon>⚡</FeatureIcon>
            <FeatureTextCol>
              <FeatureName>상황 맞춤 다이내믹 우선순위</FeatureName>
              <FeatureDesc>
                수업 전에는 <b>강의실과 시간표</b>, 식사 시간에는 <b>학식 메뉴</b>, 하교 시에는 <b>도착 버스</b>, 마감 임박 시에는 <b>과제 알림</b>이 가장 먼저 최상단에 자동 추천됩니다.
              </FeatureDesc>
            </FeatureTextCol>
          </FeatureItem>

          <FeatureItem>
            <FeatureIcon>🎛️</FeatureIcon>
            <FeatureTextCol>
              <FeatureName>카드 순서 & 노출 커스텀 설정</FeatureName>
              <FeatureDesc>
                우측 하단 설정 버튼을 통해 내가 자주 확인하는 카드의 순서를 직접 변경하거나, 필요하지 않은 카드를 숨길 수 있습니다.
              </FeatureDesc>
            </FeatureTextCol>
          </FeatureItem>

          <FeatureItem>
            <FeatureIcon>📍</FeatureIcon>
            <FeatureTextCol>
              <FeatureName>캠퍼스 실시간 정보 원스톱 확인</FeatureName>
              <FeatureDesc>
                열람실 잔여 좌석, 실시간 빠른 버스 도착 정보, 전체 및 학과 최신 공지, 송도 캠퍼스 날씨까지 앱 곳곳을 찾을 필요 없이 한 화면에서 모아보세요.
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
