import * as Dialog from "@radix-ui/react-dialog";
import styled, { keyframes } from "styled-components";
import Box from "@/components/common/Box";
import BottomButtonGroup from "@/components/common/BottomButtonGroup";
import { OpenChatRoomResponseDto } from "@/types/chat";
import { Users, Calendar, Crown, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

const contentShow = keyframes`
  from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

interface OpenChatPreviewModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  room: OpenChatRoomResponseDto | null;
}

export default function OpenChatPreviewModal({
  isOpen,
  onOpenChange,
  room,
}: OpenChatPreviewModalProps) {
  const navigate = useNavigate();

  if (!room) return null;

  const handleJoin = () => {
    onOpenChange(false);
    navigate(`${ROUTES.CHAT.ROOT}/${room.roomId}`);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <StyledOverlay />
        <StyledContent>
          <Box
            style={{
              width: "100%",
              padding: "0",
              display: "flex",
              flexDirection: "column",
              gap: "0",
              alignItems: "stretch",
              overflow: "hidden",
            }}
          >
            <Header>
              <ThumbnailWrapper>
                 <Thumbnail
                    src={room.thumbnailUrl || `https://portal.inuappcenter.kr/images/profile/0`}
                    alt="Room Thumbnail"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://portal.inuappcenter.kr/images/profile/0`;
                    }}
                 />
                 {room.official && <OfficialBadge>공식</OfficialBadge>}
              </ThumbnailWrapper>
              <TitleSection>
                <Title>{room.title}</Title>
              </TitleSection>
            </Header>

            <ContentArea>
              <InfoGrid>
                <InfoItem>
                  <Crown size={16} color="#8E8E93" />
                  <span className="label">방장</span>
                  <span className="value">{room.ownerNickname}</span>
                </InfoItem>
                <InfoItem>
                  <Users size={16} color="#8E8E93" />
                  <span className="label">참여 인원</span>
                  <span className="value">{room.currentParticipants} / {room.maxCapacity}</span>
                </InfoItem>
                 <InfoItem>
                  <Calendar size={16} color="#8E8E93" />
                  <span className="label">생성일</span>
                  <span className="value">
                    {room.createDate 
                      ? new Date(room.createDate).toLocaleDateString() 
                      : "-"}
                  </span>
                </InfoItem>
              </InfoGrid>

              {room.description && (
                 <DescriptionSection>
                    <div className="section-title">
                       <Info size={14} />
                       채팅방 소개
                    </div>
                    <DescriptionText>{room.description}</DescriptionText>
                 </DescriptionSection>
              )}
            </ContentArea>

            <BottomButtonGroup
              leftButton={{
                label: "닫기",
                onClick: () => onOpenChange(false),
                backgroundColor: "#F2F2F7",
                textColor: "#1C1C1E",
              }}
              rightButton={{
                label: room.joined ? "채팅방 입장" : "참여하기",
                onClick: handleJoin,
                backgroundColor: "#5E92F0",
                textColor: "#FFFFFF",
              }}
              padding="16px 24px 24px"
              height="88px"
              position="static"
            />
          </Box>
        </StyledContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

const StyledOverlay = styled(Dialog.Overlay)`
  position: fixed;
  inset: 0;
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  animation: ${fadeIn} 200ms ease-out;
`;

const StyledContent = styled(Dialog.Content)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90vw;
  max-width: 400px;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  outline: none;
  background: white;
  border-radius: 24px;
  animation: ${contentShow} 200ms cubic-bezier(0.16, 1, 0.3, 1);
`;

const Header = styled.div`
  padding: 32px 24px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
`;

const ThumbnailWrapper = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
`;

const Thumbnail = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 24px;
  object-fit: cover;
  border: 1px solid #f2f2f7;
`;

const OfficialBadge = styled.div`
  position: absolute;
  top: -6px;
  right: -6px;
  background: #1C1C1E;
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 6px;
  border: 2px solid white;
`;

const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #1C1C1E;
  margin: 0;
  line-height: 1.4;
`;

const ContentArea = styled.div`
  padding: 8px 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  background: #F8F9FA;
  padding: 16px;
  border-radius: 16px;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  
  .label {
    color: #8E8E93;
    font-weight: 500;
    min-width: 60px;
  }
  
  .value {
    color: #1C1C1E;
    font-weight: 600;
  }
`;

const DescriptionSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  .section-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 700;
    color: #8E8E93;
  }
`;

const DescriptionText = styled.div`
  font-size: 15px;
  color: #48484A;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
`;
