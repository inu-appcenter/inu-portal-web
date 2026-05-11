import styled from "styled-components";
import { useHeader } from "@/context/HeaderContext";
import { MOBILE_PAGE_GUTTER } from "@/styles/responsive";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import Box from "@/components/common/Box";
import Divider from "@/components/common/Divider";
import CategorySelectorNew from "@/components/mobile/common/CategorySelectorNew";
import { ROUTES } from "@/constants/routes";
import { trackPageView } from "@/utils/mixpanel";
import { getMyChatRooms } from "@/apis/chat";
import ChatRoomListItem from "@/components/mobile/chat/ChatRoomListItem";
import CreateChatModal from "@/components/mobile/chat/CreateChatModal";
import FriendManagementView from "@/components/mobile/chat/FriendManagementView";

const CATEGORIES = ["개인", "오픈채팅", "친구"];

export default function MobileChatListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const selectedCategory = params.get("category") || "개인";
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    trackPageView("채팅 목록");
  }, []);

  const { data: response, isLoading } = useQuery({
    queryKey: ["myChatRooms"],
    queryFn: getMyChatRooms,
    refetchOnWindowFocus: true,
    enabled: selectedCategory !== "친구",
  });

  const chatRooms = response?.data || [];

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
  });

  const handleRoomClick = (roomId: number) => {
    navigate(`${ROUTES.CHAT.ROOT}/${roomId}`);
  };

  const filteredRooms = useMemo(() => {
    if (selectedCategory === "친구") return [];
    const typeFilter = selectedCategory === "개인" ? "PERSONAL" : "OPEN";
    return chatRooms
      .filter((room) => room.type === typeFilter)
      .sort(
        (a, b) =>
          new Date(b.lastMessageTime).getTime() -
          new Date(a.lastMessageTime).getTime(),
      );
  }, [chatRooms, selectedCategory]);

  return (
    <Container>
      {selectedCategory === "친구" ? (
        <FriendManagementView />
      ) : (
        <>
          <Box>
            <ListWrapper>
              {isLoading ? (
                <EmptyState>채팅방을 불러오는 중입니다...</EmptyState>
              ) : filteredRooms.length > 0 ? (
                filteredRooms.map((room, index) => (
                  <div key={room.roomId} style={{ width: "100%" }}>
                    <ChatRoomListItem 
                      room={room} 
                      onClick={handleRoomClick} 
                    />
                    {index < filteredRooms.length - 1 && <Divider />}
                  </div>
                ))
              ) : (
                <EmptyState>채팅방이 없습니다.</EmptyState>
              )}
            </ListWrapper>
          </Box>

          <FloatingActionButton onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={28} color="white" />
          </FloatingActionButton>

          <CreateChatModal 
            isOpen={isCreateModalOpen} 
            onOpenChange={setIsCreateModalOpen} 
          />
        </>
      )}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 24px ${MOBILE_PAGE_GUTTER};
  gap: 24px;
  min-height: calc(100vh - 150px);
  position: relative;
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

const FloatingActionButton = styled.button`
  position: fixed;
  bottom: 120px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background-color: #5844e4;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  box-shadow: 0 4px 12px rgba(88, 68, 228, 0.4);
  cursor: pointer;
  z-index: 10;
  transition: transform 0.2s;

  &:active {
    transform: scale(0.9);
  }
`;
