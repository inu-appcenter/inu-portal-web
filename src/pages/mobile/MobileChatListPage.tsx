import styled from "styled-components";
import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperClass } from "swiper";
import "swiper/css";
import { useHeader } from "@/context/HeaderContext";
import useUserStore from "@/stores/useUserStore";
import { MOBILE_PAGE_GUTTER } from "@/styles/responsive";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import SwipeChevronGuides from "@/components/mobile/common/SwipeChevronGuides";
import Box from "@/components/common/Box";
import Divider from "@/components/common/Divider";
import CategorySelectorNew from "@/components/mobile/common/CategorySelectorNew";
import { ROUTES } from "@/constants/routes";
import { mixpanelTrack, trackPageView } from "@/utils/mixpanel";
import { getMyChatRooms, getOpenChatRooms } from "@/apis/chat";
import { getFriends } from "@/apis/friends";
import ChatRoomListItem from "@/components/mobile/chat/ChatRoomListItem";
import OpenChatRoomListItem from "@/components/mobile/chat/OpenChatRoomListItem";
import CreateChatModal from "@/components/mobile/chat/CreateChatModal";
import FriendManagementView from "@/components/mobile/chat/FriendManagementView";
import AddFriendModal from "@/components/mobile/chat/AddFriendModal";
import BlockedUsersModal from "@/components/mobile/chat/BlockedUsersModal";
import SentRequestsModal from "@/components/mobile/chat/SentRequestsModal";
import EmptyState from "@/components/common/EmptyState";
import TitleContentArea from "@/components/desktop/common/TitleContentArea";
import OpenChatPreviewModal from "@/components/mobile/chat/OpenChatPreviewModal";
import { OpenChatRoomResponseDto } from "@/types/chat";
import Skeleton from "@/components/common/Skeleton";

export default function MobileChatListPage() {
  const navigate = useNavigate();
  const { userInfo } = useUserStore();
  const isLoggedIn = userInfo.id !== 0;
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const selectedCategory = params.get("category") || "개인";
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);
  const [isBlockedModalOpen, setIsBlockedModalOpen] = useState(false);
  const [isSentRequestsModalOpen, setIsSentRequestsModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedRoomForPreview, setSelectedRoomForPreview] =
    useState<OpenChatRoomResponseDto | null>(null);

  useEffect(() => {
    trackPageView("채팅 목록");
  }, []);

  // 카테고리가 변경될 때마다 localStorage에 저장 및 트래킹
  useEffect(() => {
    const category = params.get("category");
    if (category) {
      localStorage.setItem("lastChatCategory", category);
      mixpanelTrack.chatTabSwitched(category);
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

  const { data: openRoomsDiscoveryRes, isLoading: isOpenRoomsLoading } =
    useQuery({
      queryKey: ["openChatRoomsDiscovery"],
      queryFn: () => getOpenChatRooms(0),
      enabled: selectedCategory === "오픈채팅",
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
    const defaultMenu = [
      {
        label: "알림 설정",
        onClick: () => {
          mixpanelTrack.mypageMenuClicked("채팅헤더 - 알림설정");
          navigate(ROUTES.MYPAGE.NOTIFICATION);
        },
      },
    ];

    if (selectedCategory === "친구") {
      return [
        ...defaultMenu,
        {
          label: "보낸 친구 요청 목록",
          onClick: () => {
            mixpanelTrack.friendActionClicked("보낸 친구 요청 목록");
            setIsSentRequestsModalOpen(true);
          },
        },
        {
          label: "차단 친구 관리",
          onClick: () => {
            mixpanelTrack.friendActionClicked("차단 친구 관리");
            setIsBlockedModalOpen(true);
          },
        },
      ];
    }
    return defaultMenu;
  }, [selectedCategory, navigate]);

  useHeader({
    title: "채팅",
    subHeader: subHeader,
    floatingSubHeader: true,
    hasback: false,
    menuItems: menuItems,
  });

  const [swiperRef, setSwiperRef] = useState<SwiperClass | null>(null);

  const [hasSwiped, setHasSwiped] = useState(() => {
    return localStorage.getItem("has_swiped") === "true";
  });

  const handleCategoryChange = (nextCategory: string) => {
    const nextParams = new URLSearchParams(location.search);
    nextParams.set("category", nextCategory);
    navigate(`${location.pathname}?${nextParams.toString()}`, { replace: true });
  };

  const handleSlideChange = (s: SwiperClass) => {
    const categoryList = ["개인", "오픈채팅", "친구"];
    const nextCategory = categoryList[s.activeIndex];

    if (!hasSwiped) {
      setHasSwiped(true);
      localStorage.setItem("has_swiped", "true");
    }

    if (nextCategory && nextCategory !== selectedCategory) {
      handleCategoryChange(nextCategory);
    }
  };

  const isAnyModalOpen =
    isCreateModalOpen ||
    isAddFriendModalOpen ||
    isBlockedModalOpen ||
    isSentRequestsModalOpen ||
    isPreviewModalOpen;

  const handleRoomClick = (room: any) => {
    mixpanelTrack.chatRoomClicked(room.roomId, room.type);
    navigate(`${ROUTES.CHAT.ROOT}/${room.roomId}`);
  };

  const personalRooms = useMemo(() => {
    return chatRooms
      .filter((room) => room.type === "PERSONAL")
      .sort(
        (a, b) =>
          new Date(b.lastMessageTime).getTime() -
          new Date(a.lastMessageTime).getTime(),
      );
  }, [chatRooms]);

  const openRooms = useMemo(() => {
    return chatRooms
      .filter((room) => room.type === "OPEN")
      .sort(
        (a, b) =>
          new Date(b.lastMessageTime).getTime() -
          new Date(a.lastMessageTime).getTime(),
      );
  }, [chatRooms]);

  const categoryList = useMemo(() => ["개인", "오픈채팅", "친구"], []);
  const currentIndex = useMemo(() => {
    const idx = categoryList.indexOf(selectedCategory);
    return idx === -1 ? 0 : idx;
  }, [selectedCategory, categoryList]);

  useEffect(() => {
    if (swiperRef && swiperRef.activeIndex !== currentIndex) {
      swiperRef.slideTo(currentIndex);
    }
  }, [currentIndex, swiperRef]);

  return (
    <Viewport>
      <Swiper
        onSwiper={(swiper) => {
          // 초기화 직후 URL 지정 탭으로 애니메이션 없이 즉시 이동
          if (currentIndex !== 0) {
            swiper.slideTo(currentIndex, 0);
          }
          setSwiperRef(swiper);
        }}
        initialSlide={currentIndex}
        onSlideChange={handleSlideChange}
        allowTouchMove={!isAnyModalOpen}
        speed={320}
        style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", flex: 1 }}
      >
        {/* 슬라이드 0: 개인 */}
        <SwiperSlide style={{ height: "auto" }}>
          <Slide>
            <TitleContentArea
              description={
                "채팅 기능은 beta 버전이며, 불안정할 수 있습니다. 향후 친구 및 채팅 기능을 연계한 새로운 서비스가 제공될 예정입니다. 친구 탭에서 학번으로 친구를 미리 등록해보세요!"
              }
            />
            {isLoggedIn && !userInfo.chatPushEnabled && (
              <TitleContentArea
                description={
                  <NotificationWarningBanner>
                    현재 채팅 알림이 꺼져있어요.
                    <span className="link" onClick={() => navigate(ROUTES.MYPAGE.NOTIFICATION)}>
                      알림 설정으로 이동
                    </span>
                  </NotificationWarningBanner>
                }
              />
            )}
            <Box>
              <ListWrapper>
                {isLoading ? (
                  <ListWrapper>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        style={{
                          width: "100%",
                          padding: "12px 0",
                          display: "flex",
                          gap: "12px",
                          alignItems: "center",
                        }}
                      >
                        <Skeleton width="48px" height="48px" circle />
                        <div
                          style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                          }}
                        >
                          <Skeleton width="40%" height="18px" />
                          <Skeleton width="70%" height="14px" />
                        </div>
                      </div>
                    ))}
                  </ListWrapper>
                ) : personalRooms.length > 0 ? (
                  personalRooms.map((room, index) => (
                    <div key={room.roomId} style={{ width: "100%" }}>
                      <ChatRoomListItem
                        room={room}
                        onClick={() => handleRoomClick(room)}
                      />
                      {index < personalRooms.length - 1 && <Divider />}
                    </div>
                  ))
                ) : (
                  <EmptyState>채팅방이 없습니다.</EmptyState>
                )}
              </ListWrapper>
            </Box>
          </Slide>
        </SwiperSlide>

        {/* 슬라이드 1: 오픈채팅 */}
        <SwiperSlide style={{ height: "auto" }}>
          <Slide>
            <TitleContentArea
              description={
                "채팅 기능은 beta 버전이며, 불안정할 수 있습니다. 향후 친구 및 채팅 기능을 연계한 새로운 서비스가 제공될 예정입니다. 친구 탭에서 학번으로 친구를 미리 등록해보세요!"
              }
            />
            {isLoggedIn && !userInfo.chatPushEnabled && (
              <TitleContentArea
                description={
                  <NotificationWarningBanner>
                    현재 채팅 알림이 꺼져있어요.
                    <span className="link" onClick={() => navigate(ROUTES.MYPAGE.NOTIFICATION)}>
                      알림 설정으로 이동
                    </span>
                  </NotificationWarningBanner>
                }
              />
            )}
            <Box>
              <ListWrapper>
                {isLoading ? (
                  <ListWrapper>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        style={{
                          width: "100%",
                          padding: "12px 0",
                          display: "flex",
                          gap: "12px",
                          alignItems: "center",
                        }}
                      >
                        <Skeleton width="48px" height="48px" circle />
                        <div
                          style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                          }}
                        >
                          <Skeleton width="40%" height="18px" />
                          <Skeleton width="70%" height="14px" />
                        </div>
                      </div>
                    ))}
                  </ListWrapper>
                ) : openRooms.length > 0 ? (
                  openRooms.map((room, index) => (
                    <div key={room.roomId} style={{ width: "100%" }}>
                      <ChatRoomListItem
                        room={room}
                        onClick={() => handleRoomClick(room)}
                      />
                      {index < openRooms.length - 1 && <Divider />}
                    </div>
                  ))
                ) : (
                  <EmptyState>채팅방이 없습니다.</EmptyState>
                )}
              </ListWrapper>
            </Box>

            <TitleContentArea
              title="오픈채팅방 둘러보기"
              style={{ marginTop: "24px" }}
            >
              <Box>
                <ListWrapper>
                  {isOpenRoomsLoading ? (
                    <ListWrapper>
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          style={{
                            width: "100%",
                            padding: "12px 0",
                            display: "flex",
                            gap: "12px",
                            alignItems: "center",
                          }}
                        >
                          <Skeleton width="48px" height="48px" circle />
                          <div
                            style={{
                              flex: 1,
                              display: "flex",
                              flexDirection: "column",
                              gap: "8px",
                            }}
                          >
                            <Skeleton width="60%" height="18px" />
                            <Skeleton width="40%" height="14px" />
                          </div>
                        </div>
                      ))}
                    </ListWrapper>
                  ) : openRoomsDiscoveryRes?.data &&
                    openRoomsDiscoveryRes.data.content.length > 0 ? (
                    openRoomsDiscoveryRes.data.content.map((room, index) => (
                      <div key={room.roomId} style={{ width: "100%" }}>
                        <OpenChatRoomListItem
                          room={room}
                          onClick={() => {
                            setSelectedRoomForPreview(room);
                            setIsPreviewModalOpen(true);
                          }}
                        />
                        {index <
                          openRoomsDiscoveryRes.data.content.length - 1 && (
                            <Divider />
                          )}
                      </div>
                    ))
                  ) : (
                    <EmptyState>개설된 오픈채팅방이 없습니다.</EmptyState>
                  )}
                </ListWrapper>
              </Box>
            </TitleContentArea>
          </Slide>
        </SwiperSlide>

        {/* 슬라이드 2: 친구 */}
        <SwiperSlide style={{ height: "auto" }}>
          <Slide>
            <TitleContentArea
              description={
                <>
                  닉네임으로 친구를 찾아보세요.
                  <br />
                  아직 학번 닉네임을 사용중이라면, 마이페이지에서 새로운 닉네임을
                  설정해보세요.
                </>
              }
            />
            <FriendManagementView isActive={selectedCategory === "친구"} />
          </Slide>
        </SwiperSlide>
      </Swiper>

      {/* 공통 플로팅 액션 버튼 */}
      <FloatingActionButton
        onClick={() => {
          if (selectedCategory === "개인") {
            mixpanelTrack.chatRoomMenuClicked(
              "개인 채팅방 생성",
              "new_personal",
            );
            navigate(ROUTES.CHAT.CREATE_PERSONAL);
          } else {
            mixpanelTrack.chatRoomMenuClicked(
              "오픈 채팅방 생성",
              "new_open",
            );
            setIsCreateModalOpen(true);
          }
        }}
        $bottom={selectedCategory === "친구" ? "180px" : undefined}
      >
        <Plus size={28} color="white" />
      </FloatingActionButton>

      {/* 모달 창 계층 공통 관리 */}
      <CreateChatModal
        isOpen={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
      <OpenChatPreviewModal
        isOpen={isPreviewModalOpen}
        onOpenChange={setIsPreviewModalOpen}
        room={selectedRoomForPreview}
      />
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

      {/* 가로 스와이프 안내 시각 가이드 (스와이프 조작을 한 번도 안 한 최초 진입 시에만 노출) */}
      <SwipeChevronGuides
        hasSwiped={hasSwiped}
        currentIndex={currentIndex}
        totalSlides={3}
      />
    </Viewport>
  );
}

const Viewport = styled.div`
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 24px 0 120px 0;
`;

const Slide = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  box-sizing: border-box;
  padding: 0 ${MOBILE_PAGE_GUTTER};
`;

const NotificationWarningBanner = styled.div`

  .link {
    color: #0a84ff;
    text-decoration: underline;
    margin-left: 6px;
    font-weight: 500;
    cursor: pointer;

    &:active {
      opacity: 0.7;
    }
  }
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
  box-shadow: 0 4px 12px rgba(94, 146, 240, 0.35);
  cursor: pointer;
  z-index: 10;
  transition: transform 0.2s;

  &:active {
    transform: scale(0.9);
  }
`;


