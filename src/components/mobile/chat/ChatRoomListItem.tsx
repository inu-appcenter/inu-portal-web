import { useMemo } from "react";
import styled from "styled-components";
import { BellOff } from "lucide-react";
import { MyChatRoomResponseDto } from "@/types/chat";
import {
  normalizeProfileImageId,
  DEFAULT_PROFILE_IMAGE_ID,
} from "@/utils/userInfo";
import { formatTimeAgo } from "@/utils/date";
import Ripple from "@/components/common/Ripple";

interface ChatRoomListItemProps {
  room: MyChatRoomResponseDto;
  onClick: (roomId: number) => void;
}

export default function ChatRoomListItem({
  room,
  onClick,
}: ChatRoomListItemProps) {
  const safeFireId = normalizeProfileImageId(
    room.senderProfileImageNumber,
    DEFAULT_PROFILE_IMAGE_ID,
  );

  const isGroupChat = room.type === "PERSONAL" && room.currentParticipants >= 3;
  const isThreeParticipants = isGroupChat && room.currentParticipants === 3;
  const defaultProfileUrl = `https://portal.inuappcenter.kr/images/profile/${DEFAULT_PROFILE_IMAGE_ID}`;
  const singleProfileUrl = room.thumbnailUrl
    ? room.thumbnailUrl
    : `https://portal.inuappcenter.kr/images/profile/${safeFireId}`;

  const participantImageUrls = useMemo(() => {
    if (!room.participantProfileImageNumbers || room.participantProfileImageNumbers.length === 0) {
      return [];
    }
    return room.participantProfileImageNumbers.map((num) => {
      const safeId = normalizeProfileImageId(num, DEFAULT_PROFILE_IMAGE_ID);
      return `https://portal.inuappcenter.kr/images/profile/${safeId}`;
    });
  }, [room.participantProfileImageNumbers]);

  return (
    <ItemWrapper onClick={() => onClick(room.roomId)}>
      <Ripple />
      <InnerContent>
        <ProfileContainer>
          {isGroupChat ? (
            <AvatarStackArea>
              {isThreeParticipants
                ? [0, 1, 2].map((idx) => {
                    const avatarUrl = participantImageUrls[idx] || (idx === 0 ? singleProfileUrl : defaultProfileUrl);
                    return (
                      <StackAvatarItem
                        key={idx}
                        $isThreeLayout={true}
                        className={`three-pos-${idx}`}
                      >
                        <img
                          src={avatarUrl}
                          alt=""
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            if (img.src !== defaultProfileUrl) {
                              img.src = defaultProfileUrl;
                            }
                          }}
                        />
                      </StackAvatarItem>
                    );
                  })
                : [0, 1, 2, 3].map((idx) => {
                    const avatarUrl = participantImageUrls[idx] || (idx === 0 ? singleProfileUrl : defaultProfileUrl);
                    return (
                      <StackAvatarItem
                        key={idx}
                        $isThreeLayout={false}
                        className={`grid-pos-${idx}`}
                      >
                        <img
                          src={avatarUrl}
                          alt=""
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            if (img.src !== defaultProfileUrl) {
                              img.src = defaultProfileUrl;
                            }
                          }}
                        />
                      </StackAvatarItem>
                    );
                  })}
            </AvatarStackArea>
          ) : (
            <SingleAvatarArea>
              <ProfileImage
                src={singleProfileUrl}
                alt="Profile"
                $visible={true}
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  if (img.src !== defaultProfileUrl) {
                    img.src = defaultProfileUrl;
                  }
                }}
              />
              <DefaultProfileIcon className="fallback">
                <img
                  src={defaultProfileUrl}
                  alt="Default Profile"
                  style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                />
              </DefaultProfileIcon>
            </SingleAvatarArea>
          )}
        </ProfileContainer>
        <ContentArea>
          <TopRow>
            <TitleArea>
              <div className="title">
                {room.friendAlias ? `${room.friendAlias} (${room.title})` : room.title}
              </div>
              {room.currentParticipants > 1 && (
                <ParticipantCountBadge>
                  <span className="count">{room.currentParticipants}</span>
                </ParticipantCountBadge>
              )}
              {!room.pushEnabled && (
                <BellOff size={14} color="#8E8E93" style={{ flexShrink: 0 }} />
              )}
              {room.official && <OfficialTag>공식</OfficialTag>}
            </TitleArea>
            <div className="time">{formatTimeAgo(room.lastMessageTime)}</div>
          </TopRow>
          <BottomRow>
            <div className="last-message">
              {room.lastMessage === ""
                ? "사진을 보냈습니다."
                : room.lastMessage || "메시지가 없습니다."}
            </div>
            {room.unreadCount > 0 && (
              <UnreadBadge>
                {room.unreadCount > 99 ? "99+" : room.unreadCount}
              </UnreadBadge>
            )}
          </BottomRow>
        </ContentArea>
      </InnerContent>
    </ItemWrapper>
  );
}

const InnerContent = styled.div`
  display: flex;
  flex-direction: row;
  gap: 4px;
  align-items: center;
  width: 100%;
  transition: transform 0.12s ease-in-out;
`;

const ItemWrapper = styled.div`
  display: flex;
  box-sizing: border-box;
  padding: 0 12px 0 0;
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

const ProfileContainer = styled.div`
  width: 74px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const SingleAvatarArea = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 999px;
  background-color: var(--border-brand-subtle, #d3e5ff);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
`;

const ProfileImage = styled.img<{ $visible?: boolean }>`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  position: relative;
  z-index: 2;
  display: ${(props) => (props.$visible ? "block" : "none")};
`;

const DefaultProfileIcon = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: var(--border-brand-subtle, #d3e5ff);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
`;

const AvatarStackArea = styled.div`
  width: 56px;
  height: 56px;
  position: relative;
  flex-shrink: 0;
`;

const StackAvatarItem = styled.div<{ $isThreeLayout?: boolean }>`
  position: absolute;
  width: ${({ $isThreeLayout }) => ($isThreeLayout ? "28px" : "26px")};
  height: ${({ $isThreeLayout }) => ($isThreeLayout ? "28px" : "26px")};
  border-radius: 999px;
  border: 2px solid var(--bg-base, #ffffff);
  background-color: var(--border-brand-subtle, #d3e5ff);
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* 3명일 때: 피라미드 형태 (상단 중앙 1개, 하단 좌/우 2개) */
  &.three-pos-0 {
    top: 2px;
    left: 50%;
    transform: translateX(-50%);
  }
  &.three-pos-1 {
    bottom: 2px;
    left: 2px;
  }
  &.three-pos-2 {
    bottom: 2px;
    right: 2px;
  }

  /* 4명 이상일 때: 2x2 그리드 */
  &.grid-pos-0 {
    top: 3px;
    left: 3px;
  }
  &.grid-pos-1 {
    top: 3px;
    right: 3px;
  }
  &.grid-pos-2 {
    bottom: 4px;
    left: 3px;
  }
  &.grid-pos-3 {
    bottom: 4px;
    right: 3px;
  }
`;

const ContentArea = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 4px;
  min-width: 0;
  padding: 12px 0;
  justify-content: center;
`;

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  .time {
    font-family: Pretendard;
    color: var(--text-disabled, #b0b8c1);
    font-size: 12px;
    font-weight: 400;
    line-height: 16px;
    flex-shrink: 0;
    text-align: right;
  }
`;

const TitleArea = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  overflow: hidden;
  min-width: 0;
  flex: 1;

  .title {
    font-family: Pretendard;
    font-weight: 600;
    font-size: 16px;
    line-height: 1.4;
    color: var(--text-secondary, #333d4b);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const ParticipantCountBadge = styled.div`
  background-color: var(--bg-disabled, #e5e8eb);
  height: 16px;
  padding: 0 4px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  .count {
    font-family: Pretendard;
    font-weight: 500;
    font-size: 12px;
    line-height: 1.4;
    color: var(--text-tertiary, #8b95a1);
  }
`;

const OpenTag = styled.span`
  font-size: 10px;
  font-weight: 600;
  color: #5e92f0;
  background: #f0eeff;
  padding: 1px 4px;
  border-radius: 4px;
  flex-shrink: 0;
`;

const OfficialTag = styled(OpenTag)`
  color: #ffffff;
  background: #1c1c1e;
`;

const BottomRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;

  .last-message {
    font-family: Pretendard;
    font-size: 14px;
    font-weight: 400;
    line-height: 1.6;
    color: var(--text-tertiary, #8b95a1);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    min-width: 0;

    .sender {
      color: var(--text-tertiary, #8b95a1);
      font-weight: 500;
    }
  }
`;

const UnreadBadge = styled.div`
  background-color: var(--interactive-primary, #0061ff);
  color: var(--text-inverse, #ffffff);
  font-family: Pretendard;
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  padding: 2px 4px;
  border-radius: 999px;
  min-width: 20px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;
