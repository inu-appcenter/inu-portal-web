import styled from "styled-components";
import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperClass } from "swiper";
import "swiper/css";
import { useHeader } from "@/context/HeaderContext";
import useUserStore from "@/stores/useUserStore";
import { MOBILE_PAGE_GUTTER } from "@/styles/responsive";
import { useEffect, useMemo, useState, useCallback, memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
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
import MobilePillSearchBar from "@/components/mobile/common/MobilePillSearchBar";

import TitleContentArea from "@/components/desktop/common/TitleContentArea";
import OpenChatPreviewModal from "@/components/mobile/chat/OpenChatPreviewModal";
import { OpenChatRoomResponseDto } from "@/types/chat";
import Skeleton from "@/components/common/Skeleton";

const MobileChatListPage = memo(function MobileChatListPage() {
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

  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [isTop, setIsTop] = useState(true);

  useEffect(() => {
    trackPageView("채팅 목록");
  }, []);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsTop(window.scrollY === 0);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

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
    if (isSearching) return undefined;

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
  }, [selectedCategory, navigate, isSearching]);

  const handleSearchClick = useCallback(() => {
    setIsSearching(true);
    window.history.pushState({ modal: "search" }, "");
    mixpanelTrack.featureClicked("Search Icon", "ChatListHeader");
  }, []);

  const handleCloseSearch = useCallback(() => {
    setIsSearching(false);
    setSearchTerm("");
    if (window.history.state?.modal === "search") {
      window.history.back();
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      if (isSearching) {
        setIsSearching(false);
        setSearchTerm("");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isSearching]);

  const headerRight = useMemo(() => {
    if (!isSearching && selectedCategory === "친구") {
      return (
        <HeaderRightArea>
          <IconButton onClick={handleSearchClick}>
            <Search size={24} color="#1C1C1E" />
          </IconButton>
        </HeaderRightArea>
      );
    }
    return null;
  }, [selectedCategory, isSearching, handleSearchClick]);

  const headerTitle = useMemo(() => {
    if (isSearching) {
      return "친구 검색";
    }
    return "채팅";
  }, [isSearching]);

  useHeader({
    title: headerTitle,
    subHeader: isSearching ? null : subHeader,
    floatingSubHeader: true,
    hasback: isSearching,
    onBack: isSearching ? handleCloseSearch : undefined,
    menuItems: menuItems,
    rightArea: headerRight,
  });

  const [swiperRef, setSwiperRef] = useState<SwiperClass | null>(null);

  const [hasSwiped, setHasSwiped] = useState(() => {
    return localStorage.getItem("has_swiped") === "true";
  });

  const handleCategoryChange = (nextCategory: string) => {
    const nextParams = new URLSearchParams(location.search);
    nextParams.set("category", nextCategory);
    navigate(`${location.pathname}?${nextParams.toString()}`, {
      replace: true,
    });
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

  // 탭 전환 시 스크롤을 최상단으로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedCategory]);

  // 검색 중이거나 모달이 열려있을 때 터치 스와이프 제스처를 명시적으로 비활성화
  useEffect(() => {
    if (!swiperRef) return;

    if (isSearching || isAnyModalOpen) {
      swiperRef.allowTouchMove = false;
    } else {
      swiperRef.allowTouchMove = true;
    }
  }, [swiperRef, isSearching, isAnyModalOpen]);

  // 데이터 로딩 완료 및 카테고리 전환 시점을 대비한 스위퍼 리사이징 수동 업데이트 트리거
  useEffect(() => {
    if (swiperRef) {
      setTimeout(() => {
        swiperRef.update();
        swiperRef.updateAutoHeight();
      }, 100);
      setTimeout(() => {
        swiperRef.update();
        swiperRef.updateAutoHeight();
      }, 350);
    }
  }, [selectedCategory, isLoading, isOpenRoomsLoading, swiperRef]);

  const fabLabel = useMemo(() => {
    if (selectedCategory === "개인") return "새로운 채팅";
    if (selectedCategory === "친구") return "친구 추가";
    return "오픈채팅 만들기";
  }, [selectedCategory]);

  return (
    <Viewport>
      <Swiper
        onSwiper={(swiper) => {
          if (currentIndex !== 0) {
            swiper.slideTo(currentIndex, 0);
          }
          setSwiperRef(swiper);
        }}
        initialSlide={currentIndex}
        onSlideChange={handleSlideChange}
        allowTouchMove={!isAnyModalOpen && !isSearching}
        speed={320}
        autoHeight={true}
        observer={true}
        observeParents={true}
        style={{
          width: "100%",
          height: "auto",
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
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
                    <span
                      className="link"
                      onClick={() => navigate(ROUTES.MYPAGE.NOTIFICATION)}
                    >
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
                    <span
                      className="link"
                      onClick={() => navigate(ROUTES.MYPAGE.NOTIFICATION)}
                    >
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
            {!isSearching && (
              <TitleContentArea
                description={
                  <>
                    닉네임으로 친구를 찾아보세요.
                    <br />
                    아직 학번 닉네임을 사용중이라면, 마이페이지에서 새로운
                    닉네임을 설정해보세요.
                  </>
                }
              />
            )}
            <FriendManagementView searchTerm={searchTerm} />
          </Slide>
        </SwiperSlide>
      </Swiper>

      {!isSearching && (
        <FloatingActionButton
          onClick={() => {
            if (selectedCategory === "개인") {
              mixpanelTrack.chatRoomMenuClicked(
                "개인 채팅방 생성",
                "new_personal",
              );
              navigate(ROUTES.CHAT.CREATE_PERSONAL);
            } else if (selectedCategory === "친구") {
              mixpanelTrack.friendActionClicked("친구 추가");
              setIsAddFriendModalOpen(true);
            } else {
              mixpanelTrack.chatRoomMenuClicked("오픈 채팅방 생성", "new_open");
              setIsCreateModalOpen(true);
            }
          }}
          $isTop={isTop}
        >
          <Plus size={20} color="white" />
          <ButtonLabel $isTop={isTop}>{fabLabel}</ButtonLabel>
        </FloatingActionButton>
      )}

      {isSearching && (
        <FloatingSearchContainer>
          <MobilePillSearchBar
            placeholder="닉네임을 입력하세요."
            value={searchTerm}
            onChange={setSearchTerm}
            onSubmit={() => {}}
            autoFocus
          />
        </FloatingSearchContainer>
      )}

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

      {!isSearching && (
        <SwipeChevronGuides
          hasSwiped={hasSwiped}
          currentIndex={currentIndex}
          totalSlides={3}
        />
      )}
    </Viewport>
  );
});

export default MobileChatListPage;

const Viewport = styled.div`
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 24px 0 60px 0;

  .swiper-autoheight {
    transition: height 0ms !important;
  }
`;

const Slide = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  box-sizing: border-box;
  padding: 0 ${MOBILE_PAGE_GUTTER};
  min-height: 60vh;
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

const FloatingActionButton = styled.button<{ $isTop: boolean }>`
  position: fixed;
  bottom: 100px;
  right: 24px;

  height: 48px;
  border-radius: 24px;
  background-color: #5e92f0;
  border: none;
  box-shadow: 0 4px 12px rgba(94, 146, 240, 0.35);
  cursor: pointer;
  z-index: 10;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  display: grid;
  grid-template-columns: auto ${({ $isTop }) => ($isTop ? "1fr" : "0fr")};

  padding: ${({ $isTop }) => ($isTop ? "0 16px 0 14px" : "0 14px")};

  transition:
    grid-template-columns 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    padding 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.2s;

  &:active {
    transform: scale(0.95);
  }
`;

const ButtonLabel = styled.span<{ $isTop: boolean }>`
  font-size: 14px;
  font-weight: 600;
  color: white;
  white-space: nowrap;
  overflow: hidden;

  margin-left: ${({ $isTop }) => ($isTop ? "5px" : "0px")};

  opacity: ${({ $isTop }) => ($isTop ? 1 : 0)};

  transition:
    margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    opacity ${({ $isTop }) => ($isTop ? "0.2s" : "0.12s")}
      cubic-bezier(0.4, 0, 0.2, 1);
`;

const HeaderRightArea = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: 4px;
`;

const FloatingSearchContainer = styled.div`
  position: fixed;
  bottom: 100px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  padding: 0 20px;
  z-index: 100;

  & > * {
    max-width: 400px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
`;
