import styled from "styled-components";
import { useHeader } from "@/context/HeaderContext";
import { MOBILE_PAGE_GUTTER } from "@/styles/responsive";
import { useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Box from "@/components/common/Box";
import Divider from "@/components/common/Divider";
import CategorySelectorNew from "@/components/mobile/common/CategorySelectorNew";
import { ROUTES } from "@/constants/routes";
import { trackPageView } from "@/utils/mixpanel";

const CATEGORIES = ["개인", "오픈채팅"];

const MOCK_CHAT_ROOMS = [
  {
    id: "1",
    title: "PAINT THE UNION 오픈채팅방",
    lastMessage: "축제 재미있네요!",
    lastMessageTime: "오후 2:30",
    unreadCount: 5,
    type: "오픈채팅",
    participantCount: 156,
  },
  {
    id: "2",
    title: "인천대 대신 전해드립니다",
    lastMessage: "누가 에어팟 잃어버리셨나요?",
    lastMessageTime: "오전 11:15",
    unreadCount: 0,
    type: "오픈채팅",
    participantCount: 89,
  },
  {
    id: "3",
    title: "컴퓨터공학부 단톡방",
    lastMessage: "과제 제출 기한이 언제인가요?",
    lastMessageTime: "어제",
    unreadCount: 12,
    type: "오픈채팅",
    participantCount: 45,
  },
  {
    id: "4",
    title: "홍길동",
    lastMessage: "안녕하세요!",
    lastMessageTime: "오전 10:00",
    unreadCount: 1,
    type: "개인",
    participantCount: 2,
  },
];

const ChatRoomItem = ({
  title,
  lastMessage,
  lastMessageTime,
  unreadCount,
  participantCount,
  onClick,
}: {
  title: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  participantCount: number;
  onClick: () => void;
}) => {
  return (
    <ChatRoomItemWrapper onClick={onClick}>
      <ContentArea>
        <TopRow>
          <TitleArea>
            <div className="title">{title}</div>
            <div className="participant-count">{participantCount}</div>
          </TitleArea>
          <div className="time">{lastMessageTime}</div>
        </TopRow>
        <BottomRow>
          <div className="last-message">{lastMessage}</div>
          {unreadCount > 0 && (
            <UnreadDot>{unreadCount > 99 ? "99+" : unreadCount}</UnreadDot>
          )}
        </BottomRow>
      </ContentArea>
    </ChatRoomItemWrapper>
  );
};

export default function MobileChatListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const selectedCategory = params.get("category") || "개인";

  useEffect(() => {
    trackPageView("채팅 목록");
  }, []);

  const subHeader = useMemo(
    () => (
      <CategorySelectorNew
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
      />
    ),
    [selectedCategory],
  );

  useHeader({
    title: "채팅",
    subHeader: subHeader,
    floatingSubHeader: true,
    hasback: false,
  });

  const handleRoomClick = (roomId: string) => {
    navigate(`${ROUTES.CHAT.ROOT}/${roomId}`);
  };

  const filteredRooms = MOCK_CHAT_ROOMS.filter(
    (room) => room.type === selectedCategory,
  );

  return (
    <Container>
      <Box>
        <ListWrapper>
          {filteredRooms.length > 0 ? (
            filteredRooms.map((room, index) => (
              <div key={room.id} style={{ width: "100%" }}>
                <ChatRoomItem
                  title={room.title}
                  lastMessage={room.lastMessage}
                  lastMessageTime={room.lastMessageTime}
                  unreadCount={room.unreadCount}
                  participantCount={room.participantCount}
                  onClick={() => handleRoomClick(room.id)}
                />
                {index < filteredRooms.length - 1 && <Divider />}
              </div>
            ))
          ) : (
            <EmptyState>채팅방이 없습니다.</EmptyState>
          )}
        </ListWrapper>
      </Box>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 24px ${MOBILE_PAGE_GUTTER};
  gap: 24px;
`;

const ListWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const EmptyState = styled.div`
  padding: 40px 0;
  text-align: center;
  color: #969696;
  font-size: 14px;
`;

const ChatRoomItemWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 12px;
  align-items: center;
  justify-content: start;
  box-sizing: border-box;
  text-align: start;
  cursor: pointer;
  width: 100%;
`;

const ContentArea = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 4px;
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

  .title {
    color: #000;
    font-size: 16px;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .participant-count {
    color: #969696;
    font-size: 14px;
    font-weight: 500;
    flex-shrink: 0;
  }
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
  }
`;

const UnreadDot = styled.div`
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
