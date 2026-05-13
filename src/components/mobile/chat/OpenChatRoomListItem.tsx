import styled from "styled-components";
import { Users } from "lucide-react";
import { OpenChatRoomResponseDto } from "@/types/chat";

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
      <ThumbnailArea>
        <Thumbnail
          src={
            room.thumbnailUrl
              ? room.thumbnailUrl
              : `https://portal.inuappcenter.kr/images/profile/0`
          }
          alt="Thumbnail"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <DefaultIcon className="fallback">
          <Users size={24} color="#D6D1D5" />
        </DefaultIcon>
      </ThumbnailArea>
      <ContentArea>
        <Title>{room.title}</Title>
        <ParticipantInfo>
          <Users size={14} color="#8E8E93" />
          <span>
            {room.currentParticipants} / {room.maxCapacity}
          </span>
        </ParticipantInfo>
      </ContentArea>
      <JoinButton>참여하기</JoinButton>
    </ItemWrapper>
  );
}

const ItemWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 12px;
  align-items: center;
  cursor: pointer;
  width: 100%;
  padding: 8px 0;
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

const Title = styled.div`
  color: #000;
  font-size: 16px;
  font-weight: 600;
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

const JoinButton = styled.div`
  padding: 6px 12px;
  background-color: #f2f2f7;
  color: #5e92f0;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
  
  &:active {
    background-color: #e5e5ea;
  }
`;
