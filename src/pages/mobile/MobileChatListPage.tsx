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
import { getFriends } from "@/apis/friends";
import ChatRoomListItem from "@/components/mobile/chat/ChatRoomListItem";
import CreateChatModal from "@/components/mobile/chat/CreateChatModal";
import FriendManagementView from "@/components/mobile/chat/FriendManagementView";
import AddFriendModal from "@/components/mobile/chat/AddFriendModal";
import BlockedUsersModal from "@/components/mobile/chat/BlockedUsersModal";
import SentRequestsModal from "@/components/mobile/chat/SentRequestsModal";
import EmptyState from "@/components/common/EmptyState";

export default function MobileChatListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const selectedCategory = params.get("category") || "개인";
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);
  const [isBlockedModalOpen, setIsBlockedModalOpen] = useState(false);
  const [isSentRequestsModalOpen, setIsSentRequestsModalOpen] = useState(false);

  useEffect(() => {
    trackPageView("채팅 목록");
  }, []);

  const { data: response, isLoading } = useQuery({
    queryKey: ["myChatRooms"],
    queryFn: getMyChatRooms,
    refetchOnWindowFocus: true,
  });

  const { data: friendsRes } = useQuery({
    queryKey: ["friends"],
    queryFn: getFriends,
  });

  const chatRooms = response?.data || [];
  const friends = friendsRes?.data || [];

  const personalCount = useMemo(
    () => chatRooms.filter((r) => r.type === "PERSONAL").length,
    [chatRooms],
  );
  const openCount = useMemo(
    () => chatRooms.filter((r) => r.type === "OPEN").length,
    [chatRooms],
  );
  const friendCount = friends.length;

  const categories = useMemo(
    () => [
      { label: "개인", value: "개인", count: personalCount },
      { label: "오픈채팅", value: "오픈채팅", count: openCount },
      { label: "친구", value: "친구", count: friendCount },
    ],
    [personalCount, openCount, friendCount],
  );

  const subHeader = useMemo(
    () => (
      <CategorySelectorNew
        categories={categories}
        selectedCategory={selectedCategory}
      />
    ),
    [categories, selectedCategory],
  );

  const menuItems = useMemo(() => {
    if (selectedCategory === "친구") {
      return [
        {
          label: "보낸 친구 요청 목록",
          onClick: () => setIsSentRequestsModalOpen(true),
        },
        {
          label: "차단 친구 관리",
          onClick: () => setIsBlockedModalOpen(true),
        },
      ];
    }
    return undefined;
  }, [selectedCategory]);

  useHeader({
    title: "채팅",
    subHeader: subHeader,
    floatingSubHeader: true,
    hasback: false,
    menuItems: menuItems,
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
        <>
          <FriendManagementView />

          <FloatingActionButton
            onClick={() => setIsAddFriendModalOpen(true)}
            $bottom="180px"
          >
            <Plus size={28} color="white" />
          </FloatingActionButton>

          <AddFriendModal
            isOpen={isAddFriendModalOpen}
            onOpenChange={setIsAddFriendModalOpen}
          />

          <BlockedUsersModal
            isOpen={isBlockedModalOpen}
            onOpenChange={setIsBlockedModalOpen}
          />

          <SentRequestsModal
            isOpen={isSentRequestsModalOpen}
            onOpenChange={setIsSentRequestsModalOpen}
          />
        </>
      ) : (
        <>
          <Box>
            <ListWrapper>
              {isLoading ? (
                <EmptyState>채팅방을 불러오는 중입니다...</EmptyState>
              ) : filteredRooms.length > 0 ? (
                filteredRooms.map((room, index) => (
                  <div key={room.roomId} style={{ width: "100%" }}>
                    <ChatRoomListItem room={room} onClick={handleRoomClick} />
                    {index < filteredRooms.length - 1 && <Divider />}
                  </div>
                ))
              ) : (
                <EmptyState>채팅방이 없습니다.</EmptyState>
              )}
            </ListWrapper>
          </Box>

          <FloatingActionButton
            onClick={() => {
              if (selectedCategory === "개인") {
                navigate(ROUTES.CHAT.CREATE_PERSONAL);
              } else {
                setIsCreateModalOpen(true);
              }
            }}
          >
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
  padding-bottom: 120px;
  gap: 24px;
  //min-height: calc(100vh - 150px);
  position: relative;
`;

const ListWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const FloatingActionButton = styled.button<{ $bottom?: string }>`
  position: fixed;
  bottom: ${({ $bottom }) => $bottom || "120px"};
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background-color: #5E92F0;
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
