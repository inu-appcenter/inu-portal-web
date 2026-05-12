import styled from "styled-components";
import { User } from "lucide-react";
import { MyChatRoomResponseDto } from "@/types/chat";
import {
  normalizeProfileImageId,
  DEFAULT_PROFILE_IMAGE_ID,
} from "@/utils/userInfo";

interface ChatRoomListItemProps {
  room: MyChatRoomResponseDto;
  onClick: (roomId: number) => void;
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const oneDay = 24 * 60 * 60 * 1000;

  if (diff < oneDay && now.getDate() === date.getDate()) {
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } else if (diff < oneDay * 2) {
    return "어제";
  } else {
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  }
};

export default function ChatRoomListItem({
  room,
  onClick,
}: ChatRoomListItemProps) {
  const safeFireId = normalizeProfileImageId(
    room.senderProfileImageNumber,
    DEFAULT_PROFILE_IMAGE_ID,
  );

  return (
    <ItemWrapper onClick={() => onClick(room.roomId)}>
      <ProfileImageArea>
        <ProfileImage
          src={`https://portal.inuappcenter.kr/images/profile/${safeFireId}`}
          alt="Profile"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <DefaultProfileIcon className="fallback">
          <User size={24} color="#D6D1D5" />
        </DefaultProfileIcon>
      </ProfileImageArea>
      <ContentArea>
        <TopRow>
          <TitleArea>
            <div className="title">{room.title}</div>
            {room.currentParticipants > 1 && (
              <ParticipantCount>{room.currentParticipants}</ParticipantCount>
            )}
            {room.isOfficial && <OfficialTag>공식</OfficialTag>}
          </TitleArea>
          <div className="time">{formatTime(room.lastMessageTime)}</div>
        </TopRow>
        <BottomRow>
          <div className="last-message">
            {room.senderName && (
              <span className="sender">{room.senderName}: </span>
            )}
            {room.lastMessage === "" ? "사진을 보냈습니다." : (room.lastMessage || "메시지가 없습니다.")}
          </div>
          {room.unreadCount > 0 && (
            <UnreadBadge>
              {room.unreadCount > 99 ? "99+" : room.unreadCount}
            </UnreadBadge>
          )}
        </BottomRow>
      </ContentArea>
    </ItemWrapper>
  );
}

const ItemWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 12px;
  // padding: 12px 0;
  align-items: center;
  cursor: pointer;
  width: 100%;
`;

const ProfileImageArea = styled.div`
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  position: relative;
`;

const ProfileImage = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  background-color: #f4f4f4;
  position: relative;
  z-index: 2;
`;

const DefaultProfileIcon = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
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

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  .time {
    color: #969696;
    font-size: 12px;
    font-weight: 500;
    flex-shrink: 0;
  }
`;

const TitleArea = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  overflow: hidden;
  margin-right: 8px;

  .title {
    color: #000;
    font-size: 16px;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const OpenTag = styled.span`
  font-size: 10px;
  font-weight: 600;
  color: #5844e4;
  background: #f0eeff;
  padding: 1px 4px;
  border-radius: 4px;
  flex-shrink: 0;
`;

const OfficialTag = styled(OpenTag)`
  color: #ffffff;
  background: #1c1c1e;
`;

const ParticipantCount = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #8e8e93;
  margin-left: -2px;
  flex-shrink: 0;
`;

const BottomRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  .last-message {
    color: #969696;
    font-size: 14px;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-right: 8px;

    .sender {
      color: #707070;
      font-weight: 600;
    }
  }
`;

const UnreadBadge = styled.div`
  background-color: #ff3b30;
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;
