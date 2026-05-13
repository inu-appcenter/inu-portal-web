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
import TitleContentArea from "@/components/desktop/common/TitleContentArea";

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

    // 초기 로드 시 URL에 카테고리가 없으면 마지막으로 선택했던 카테고리로 이동
    const savedCategory = localStorage.getItem("lastChatCategory");
    if (!params.get("category") && savedCategory) {
      navigate(`?category=${savedCategory}`, { replace: true });
    }
  }, []);

  // 카테고리가 변경될 때마다 localStorage에 저장
  useEffect(() => {
    if (params.get("category")) {
      localStorage.setItem("lastChatCategory", params.get("category")!);
    }
  }, [location.search]);

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

  const personalUnreadCount = useMemo(
    () =>
      chatRooms
        .filter((r) => r.type === "PERSONAL")
        .reduce((acc, r) => acc + (r.unreadCount || 0), 0),
    [chatRooms],
  );

  const openUnreadCount = useMemo(
    () =>
      chatRooms
        .filter((r) => r.type === "OPEN")
        .reduce((acc, r) => acc + (r.unreadCount || 0), 0),
    [chatRooms],
  );

  const friendCount = friendsRes?.data?.length || 0;

  const categories = useMemo(
    () => [
      {
        label: "개인",
        value: "개인",
        count: personalUnreadCount > 0 ? personalUnreadCount : undefined,
      },
      {
        label: "오픈채팅",
        value: "오픈채팅",
        count: openUnreadCount > 0 ? openUnreadCount : undefined,
      },
      {
        label: "친구",
        value: "친구",
        count: friendCount,
      },
    ],
    [personalUnreadCount, openUnreadCount, friendCount],
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
          <TitleContentArea
            description={
              <>
                친구의 학번으로 친구를 맺어보세요.
                <br />
                아직 학번 닉네임을 사용중이라면, 마이페이지에서 닉네임을
                변경해보세요.
              </>
            }
          />
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
          <TitleContentArea
            description={
              "채팅 기능은 beta 버전이며, 불안정한 부분이 있을 수 있습니다. 향후 친구 및 채팅 기능을 연계한 새로운 서비스가 제공될 예정입니다. 친구 탭에서 학번으로 친구를 미리 등록해보세요!"
            }
          />
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
  background-color: #5e92f0;
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
