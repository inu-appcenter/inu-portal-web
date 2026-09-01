import styled from "styled-components";
import Icon from "@/components/common/Icon";
import { OpenChatRoomResponseDto } from "@/types/chat";
import Ripple from "@/components/common/Ripple";

interface OpenChatRoomListItemProps {
  room: OpenChatRoomResponseDto;
  onClick: (roomId: number) => void;
}

export default function OpenChatRoomListItem({
  room,
  onClick,
}: OpenChatRoomListItemProps) {
  return (
    <ItemWrapper onClick={() => onClick(room.roomId)}>
      <Ripple />
      <InnerContent>
        <ThumbnailArea>
          {room.thumbnailUrl && (
            <Thumbnail
              src={`${import.meta.env.VITE_API_BASE_URL}${room.thumbnailUrl}`.replace(/(?<!:)\/\/+/g, '/')}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          )}
          <DefaultIcon className="fallback">
            <Icon name="users" size={24} color="#D6D1D5" />
          </DefaultIcon>
        </ThumbnailArea>
        <ContentArea>
          <TitleArea>
            <Title>{room.title}</Title>
            {room.official && <OfficialTag>공식</OfficialTag>}
          </TitleArea>
          {room.description && <Description>{room.description}</Description>}
          <ParticipantInfo>
            <Icon name="users" size={14} color="#8E8E93" />
            <span>
              {room.currentParticipants} / {room.maxCapacity}
            </span>
          </ParticipantInfo>
        </ContentArea>
        <JoinButton $joined={room.joined}>
          {room.joined ? "참여중" : "참여하기"}
        </JoinButton>
      </InnerContent>
    </ItemWrapper>
  );
}

const InnerContent = styled.div`
  display: flex;
  flex-direction: row;
  gap: 12px;
  align-items: center;
  width: 100%;
  transition: transform 0.12s ease-in-out;
`;

const ItemWrapper = styled.div`
  display: flex;
  box-sizing: border-box;
  padding: 12px 20px;
  cursor: pointer;
  width: 100%;
  position: relative;
  overflow: hidden;

  &.active-touch {
    ${InnerContent} {
      transform: scale(0.97);
    }
  }
`;

const ThumbnailArea = styled.div`
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  position: relative;
`;

const Thumbnail = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 16px;
  object-fit: cover;
  background-color: #f4f4f4;
  position: relative;
  z-index: 2;
  border: 1px solid #f2f2f7;
`;

const DefaultIcon = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 16px;
  background-color: #f4f4f4;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
`;

const ContentArea = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 4px;
  overflow: hidden;
`;

const TitleArea = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Title = styled.div`
  color: #000;
  font-size: 16px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const OfficialTag = styled.span`
  font-size: 10px;
  font-weight: 600;
  color: #ffffff;
  background: #1c1c1e;
  padding: 1px 4px;
  border-radius: 4px;
  flex-shrink: 0;
`;

const Description = styled.div`
  color: #666;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ParticipantInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #8e8e93;
  font-size: 13px;
  font-weight: 500;
`;

const JoinButton = styled.div<{ $joined?: boolean }>`
  padding: 6px 12px;
  background-color: ${(props) => (props.$joined ? "#ffffff" : "#f2f2f7")};
  color: ${(props) => (props.$joined ? "#1c1c1e" : "#5e92f0")};
  border: ${(props) => (props.$joined ? "1px solid #e0e0e0" : "none")};
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;

  &:active {
    background-color: ${(props) => (props.$joined ? "#f4f4f4" : "#e5e5ea")};
  }
`;