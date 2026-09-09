import styled from "styled-components";
import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperClass } from "swiper";
import "swiper/css";
import { useHeader } from "@/context/HeaderContext";
import useUserStore from "@/stores/useUserStore";
import { MOBILE_PAGE_GUTTER } from "@/styles/responsive";
import React, { useEffect, useMemo, useState, useCallback, useRef, memo } from "react";
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
import AddFriendMenuCard from "@/components/mobile/social/AddFriendMenuCard";
import NearbyFriendInfoSheet from "@/components/mobile/social/NearbyFriendInfoSheet";
import { useHistoryBackedOverlay } from "@/hooks/useHistoryBackedOverlay";
import BlockedUsersModal from "@/components/mobile/chat/BlockedUsersModal";
import SentRequestsModal from "@/components/mobile/chat/SentRequestsModal";
import EmptyState from "@/components/common/EmptyState";
import FloatingSearchBar from "@/components/mobile/common/FloatingSearchBar";
import TitleContentArea from "@/components/desktop/common/TitleContentArea";
import OpenChatPreviewModal from "@/components/mobile/chat/OpenChatPreviewModal";
import { OpenChatRoomResponseDto } from "@/types/chat";
import Skeleton from "@/components/common/Skeleton";
import CapsuleButton from "@/components/common/CapsuleButton";

const MobileChatListPage = memo(function MobileChatListPage() {
  const navigate = useNavigate();
  const { userInfo } = useUserStore();
  const isLoggedIn = userInfo.id !== 0;
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const selectedCategory = params.get("category") || "개인";
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const isSelectionModeRef = useRef(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);
  const {
    isOpen: isAddMenuOpen,
    close: closeAddMenu,
    toggle: toggleAddMenu,
  } = useHistoryBackedOverlay();
  const [isNearbyInfoOpen, setIsNearbyInfoOpen] = useState(false);
  const [isBlockedModalOpen, setIsBlockedModalOpen] = useState(false);
  const [isSentRequestsModalOpen, setIsSentRequestsModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedRoomForPreview, setSelectedRoomForPreview] =
    useState<OpenChatRoomResponseDto | null>(null);

  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchActiveChange = useCallback(
    (active: boolean) => {
      setIsSearchActive(active);
      if (!active) {
        setSearchTerm("");
      } else {
        closeAddMenu();
      }
    },
    [closeAddMenu],
  );

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
    enabled: isLoggedIn,
  });

  const { data: friendsRes } = useQuery({
    queryKey: ["friends"],
    queryFn: getFriends,
    enabled: isLoggedIn,
  });

  const { data: openRoomsDiscoveryRes, isLoading: isOpenRoomsLoading } =
    useQuery({
      queryKey: ["openChatRoomsDiscovery"],
      queryFn: () => getOpenChatRooms(0),
      enabled: selectedCategory === "오픈채팅" && isLoggedIn,
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

  const allFriendIds = useMemo(
    () => friendsRes?.data?.map((f) => f.friendId) || [],
    [friendsRes],
  );

  // Clear selectedIds when exiting selection mode
  useEffect(() => {
    if (!isSelectionMode) {
      setSelectedIds([]);
    }
  }, [isSelectionMode]);

  // When switching away from "친구", exit selection mode
  useEffect(() => {
    if (selectedCategory !== "친구" && isSelectionMode) {
      setIsSelectionMode(false);
      setSelectedIds([]);
    }
  }, [selectedCategory, isSelectionMode]);

  useEffect(() => {
    isSelectionModeRef.current = isSelectionMode;
  }, [isSelectionMode]);

  useEffect(() => {
    const handlePopStateForSelection = () => {
      if (isSelectionModeRef.current) {
        setIsSelectionMode(false);
      }
    };
    window.addEventListener("popstate", handlePopStateForSelection);
    return () =>
      window.removeEventListener("popstate", handlePopStateForSelection);
  }, []);

  const handleToggleSelect = useCallback((friendId: number) => {
    setSelectedIds((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId],
    );
  }, []);

  const handleLongPress = useCallback((friendId: number) => {
    if (!isSelectionModeRef.current) {
      setIsSelectionMode(true);
      setSelectedIds([friendId]);
      window.history.pushState({ modal: "selection" }, "");
    }
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedIds.length === allFriendIds.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allFriendIds);
    }
  }, [selectedIds.length, allFriendIds]);

  const handleEnterSelectionMode = useCallback(() => {
    setIsSelectionMode(true);
    setSelectedIds(allFriendIds);
    window.history.pushState({ modal: "selection" }, "");
  }, [allFriendIds]);

  const handleExitSelectionMode = useCallback(() => {
    setIsSelectionMode(false);
    if (window.history.state?.modal === "selection") {
      window.history.back();
    }
  }, []);

  const menuItems = useMemo(() => {
    if (isSelectionMode) return undefined;

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
  }, [selectedCategory, navigate, isSelectionMode]);

  // Category 전환 시 add-friend 메뉴 닫기
  useEffect(() => {
    if (selectedCategory !== "친구" && isAddMenuOpen) {
      closeAddMenu();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  const headerRight = useMemo(() => {
    if (isSearchActive) return null;

    if (selectedCategory === "친구") {
      if (isSelectionMode) {
        return (
          <HeaderActionsContainer>
            <HeaderActionButton onClick={handleSelectAll}>
              {selectedIds.length === allFriendIds.length
                ? "전체 해제"
                : "전체 선택"}
            </HeaderActionButton>
            <HeaderActionButton
              onClick={handleExitSelectionMode}
              className="cancel"
            >
              취소
            </HeaderActionButton>
          </HeaderActionsContainer>
        );
      }

      return (
        <HeaderRightArea>
          <HeaderActionButton onClick={handleEnterSelectionMode}>
            시간표 비교
          </HeaderActionButton>
        </HeaderRightArea>
      );
    }
    return null;
  }, [
    selectedCategory,
    isSelectionMode,
    selectedIds.length,
    allFriendIds.length,
    handleSelectAll,
    handleExitSelectionMode,
    handleEnterSelectionMode,
  ]);

  const headerTitle = useMemo(() => {
    if (isSelectionMode) {
      return selectedIds.length > 0
        ? `${selectedIds.length}명 선택됨`
        : "시간표 비교";
    }
    return "채팅";
  }, [isSelectionMode, selectedIds.length]);

  useHeader({
    title: headerTitle,
    subHeader: isSelectionMode ? null : subHeader,
    floatingSubHeader: true,
    hasback: isSelectionMode,
    onBack: isSelectionMode ? handleExitSelectionMode : undefined,
    menuItems: menuItems,
    rightArea: headerRight,
    rightAreaNotCircle: true,
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
    isNearbyInfoOpen ||
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

    if (isSearchActive || isAnyModalOpen || isSelectionMode) {
      swiperRef.allowTouchMove = false;
    } else {
      swiperRef.allowTouchMove = true;
    }
  }, [swiperRef, isSearchActive, isAnyModalOpen, isSelectionMode]);

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

  const handleFriendContentHeightChange = useCallback(() => {
    window.requestAnimationFrame(() => {
      swiperRef?.update();
      swiperRef?.updateAutoHeight();
    });
  }, [swiperRef]);

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
        allowTouchMove={!isAnyModalOpen && !isSearchActive && !isSelectionMode}
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
                <NotificationWarningBanner>
                  친구 탭에서 친구를 등록해보세요!
                  <span
                    className="link"
                    onClick={() =>
                      navigate(`${ROUTES.CHAT.LIST}?category=친구`, {
                        replace: true,
                      })
                    }
                  >
                    친구 탭으로 이동
                  </span>
                </NotificationWarningBanner>
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
            {!isLoggedIn && (
              <TitleContentArea
                description={
                  <NotificationWarningBanner>
                    채팅 기능을 이용하려면 로그인이 필요해요.
                    <span
                      className="link"
                      onClick={() => navigate(ROUTES.LOGIN)}
                    >
                      로그인하러 가기
                    </span>
                  </NotificationWarningBanner>
                }
              />
            )}
            <Box>
              <ListWrapper>
                {isLoading ? (
                  <ListWrapper>
                    {[1, 2, 3, 4, 5].map((i, idx) => (
                      <React.Fragment key={i}>
                        <div
                          style={{
                            width: "100%",
                            padding: "12px 20px",
                            display: "flex",
                            gap: "12px",
                            alignItems: "center",
                            boxSizing: "border-box",
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
                        {idx < 4 && <Divider margin="0" />}
                      </React.Fragment>
                    ))}
                  </ListWrapper>
                ) : personalRooms.length > 0 ? (
                  personalRooms.map((room, index) => (
                    <div key={room.roomId} style={{ width: "100%" }}>
                      <ChatRoomListItem
                        room={room}
                        onClick={() => handleRoomClick(room)}
                      />
                      {index < personalRooms.length - 1 && (
                        <Divider margin="0" />
                      )}
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
            <TitleContentArea title="내 오픈채팅 목록" />
            <Box>
              <ListWrapper>
                {isLoading ? (
                  <ListWrapper>
                    {[1, 2, 3, 4, 5].map((i, idx) => (
                      <React.Fragment key={i}>
                        <div
                          style={{
                            width: "100%",
                            padding: "12px 20px",
                            display: "flex",
                            gap: "12px",
                            alignItems: "center",
                            boxSizing: "border-box",
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
                        {idx < 4 && <Divider margin="0" />}
                      </React.Fragment>
                    ))}
                  </ListWrapper>
                ) : openRooms.length > 0 ? (
                  openRooms.map((room, index) => (
                    <div key={room.roomId} style={{ width: "100%" }}>
                      <ChatRoomListItem
                        room={room}
                        onClick={() => handleRoomClick(room)}
                      />
                      {index < openRooms.length - 1 && <Divider margin="0" />}
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
                      {[1, 2, 3].map((i, idx) => (
                        <React.Fragment key={i}>
                          <div
                            style={{
                              width: "100%",
                              padding: "12px 20px",
                              display: "flex",
                              gap: "12px",
                              alignItems: "center",
                              boxSizing: "border-box",
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
                          {idx < 2 && <Divider margin="0" />}
                        </React.Fragment>
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
                          <Divider margin="0" />
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
                  닉네임 검색, 주변 친구 찾기, 초대 링크로 친구를 찾아보세요!
                  <br />
                  아직 학번 닉네임을 사용 중이라면, 마이페이지에서 새로운
                  닉네임을 설정해보세요.
                </>
              }
            />
            {!isLoggedIn && (
              <TitleContentArea
                description={
                  <NotificationWarningBanner>
                    친구 기능을 이용하려면 로그인이 필요해요.
                    <span
                      className="link"
                      onClick={() => navigate(ROUTES.LOGIN)}
                    >
                      로그인하러 가기
                    </span>
                  </NotificationWarningBanner>
                }
              />
            )}
            <FriendManagementView
              searchTerm={searchTerm}
              isSelectionMode={isSelectionMode}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onLongPress={handleLongPress}
              onContentHeightChange={handleFriendContentHeightChange}
            />
          </Slide>
        </SwiperSlide>
      </Swiper>

      {/* Floating Area (always rendered for animation) */}
      <FloatingActionsOuter $isMenuOpen={isAddMenuOpen}>
        <FloatingActionsWrapper>
          {/* Plus button - scale out when selection mode or search active */}
          <PlusButtonWrapper
            $visible={!isSelectionMode && !isSearchActive && isLoggedIn}
            $isMenuOpen={isAddMenuOpen}
          >
            {selectedCategory === "친구" && (
              <AddFriendMenuCard
                open={isAddMenuOpen}
                onScrimClick={() => closeAddMenu()}
                onSearchClick={() => {
                  closeAddMenu(() => {
                    mixpanelTrack.friendActionClicked("친구 추가");
                    setIsAddFriendModalOpen(true);
                  });
                }}
                onNearbyClick={() => {
                  closeAddMenu(() => setIsNearbyInfoOpen(true));
                }}
                onInviteClick={() => {
                  closeAddMenu(() => navigate(ROUTES.FRIEND.QR));
                }}
              />
            )}
            <FloatingActionButton
              onClick={() => {
                if (selectedCategory === "개인") {
                  mixpanelTrack.chatRoomMenuClicked(
                    "개인 채팅방 생성",
                    "new_personal",
                  );
                  navigate(ROUTES.CHAT.CREATE_PERSONAL);
                } else if (selectedCategory === "친구") {
                  toggleAddMenu();
                } else {
                  mixpanelTrack.chatRoomMenuClicked(
                    "오픈 채팅방 생성",
                    "new_open",
                  );
                  setIsCreateModalOpen(true);
                }
              }}
              $isTop={isTop}
            >
              <Plus
                size={20}
                color="white"
                style={{
                  transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                  transform:
                    selectedCategory === "친구" && isAddMenuOpen
                      ? "rotate(45deg)"
                      : "rotate(0deg)",
                }}
              />
              <ButtonLabel $isTop={isTop}>{fabLabel}</ButtonLabel>
            </FloatingActionButton>
          </PlusButtonWrapper>

          {/* Search bar (rendered only on 친구 tab) */}
          {selectedCategory === "친구" && !isSelectionMode && (
            <SearchBarContainer $isSearchActive={isSearchActive}>
              <FloatingSearchBar
                placeholder="친구 이름 또는 학번 검색"
                onSearch={setSearchTerm}
                onActiveChange={handleSearchActiveChange}
                searchParamKey="q"
                size={56}
              />
            </SearchBarContainer>
          )}

          {/* Compare button - slides up from bottom */}
          <CompareButtonArea
            $visible={isSelectionMode && selectedCategory === "친구"}
          >
            <CompareButton
              variant="primary"
              fullWidth
              onClick={() => {
                if (selectedIds.length === 0) return;
                navigate(
                  `${ROUTES.TIMETABLE.COMPARE}?ids=${selectedIds.join(",")}`,
                );
              }}
              disabled={selectedIds.length === 0}
            >
              {selectedIds.length > 0
                ? `선택한 ${selectedIds.length}명과 시간표 비교`
                : "비교할 친구를 선택해주세요"}
            </CompareButton>
          </CompareButtonArea>
        </FloatingActionsWrapper>
      </FloatingActionsOuter>

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
      <NearbyFriendInfoSheet
        open={isNearbyInfoOpen}
        onOpenChange={setIsNearbyInfoOpen}
      />
      <BlockedUsersModal
        isOpen={isBlockedModalOpen}
        onOpenChange={setIsBlockedModalOpen}
      />
      <SentRequestsModal
        isOpen={isSentRequestsModalOpen}
        onOpenChange={setIsSentRequestsModalOpen}
      />

      {!isSearchActive && (
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
  padding: calc(var(--header-height, 56px) + 24px) 0 calc(var(--nav-height, 100px) + 60px) 0;

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
  /* Keep the entire visible content area responsive to horizontal swipes,
     including when a tab has only a few rows. */
  min-height: calc(
    100dvh - var(--header-height, 56px) - 24px - var(--nav-height, 100px) - 60px
  );
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

const FloatingActionsOuter = styled.div<{ $isMenuOpen?: boolean }>`
  position: fixed;
  bottom: calc(var(--nav-height, 100px) + 0px);
  right: 0;
  left: 0;
  width: 100%;
  z-index: ${({ $isMenuOpen }) => ($isMenuOpen ? 1001 : 99)};
  pointer-events: none;
  background: linear-gradient(
    180deg,
    rgba(248, 249, 251, 0) 0%,
    rgba(248, 249, 251, 0.45) 45%,
    rgba(248, 249, 251, 0.85) 100%
  );
`;

const FloatingActionsWrapper = styled.div`
  max-width: 768px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  pointer-events: none;
  box-sizing: border-box;
  padding: 32px 24px calc(24px + env(safe-area-inset-bottom, 0px));

  & > * {
    pointer-events: auto;
  }
`;

const PlusButtonWrapper = styled.div<{ $visible: boolean; $isMenuOpen?: boolean }>`
  position: relative;
  display: flex;
  justify-content: flex-end;
  margin-bottom: ${({ $visible }) => ($visible ? "12px" : "0px")};
  pointer-events: ${({ $visible }) => ($visible ? "auto" : "none")};
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transform: ${({ $visible }) => ($visible ? "scale(1)" : "scale(0)")};
  z-index: ${({ $isMenuOpen }) => ($isMenuOpen ? 1002 : 1)};
  transition:
    transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 0.25s ease,
    margin-bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

const FloatingActionButton = styled.button<{ $isTop: boolean }>`
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

const HeaderActionsContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  white-space: nowrap;
  flex-shrink: 0;
`;

const HeaderActionButton = styled.button`
  border: none;
  background: none;
  font-family: Pretendard;
  font-weight: 500;
  font-size: 15px;
  line-height: 24px;
  color: var(--text-brand, #0061ff);
  cursor: pointer;
  outline: none;
  padding: 0;
  white-space: nowrap;
  flex-shrink: 0;

  &.cancel {
    color: var(--text-secondary, #333d4b);
  }

  &:active {
    opacity: 0.7;
  }
`;

const CompareButtonArea = styled.div<{ $visible: boolean }>`
  width: 100%;
  overflow: hidden;
  max-height: ${({ $visible }) => ($visible ? "80px" : "0px")};
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transform: ${({ $visible }) =>
    $visible ? "translateY(0)" : "translateY(12px)"};
  margin-top: ${({ $visible }) => ($visible ? "12px" : "0px")};
  pointer-events: ${({ $visible }) => ($visible ? "auto" : "none")};
  transition:
    max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    margin-top 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
`;

const SearchBarContainer = styled.div<{ $isSearchActive: boolean }>`
  width: ${({ $isSearchActive }) => ($isSearchActive ? "100%" : "56px")};
  height: 56px;
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

const CompareButton = styled(CapsuleButton)`
  color: #fff;
  text-align: center;

  /* title-3 */
  font-family: Pretendard;
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: 24px; /* 150% */
  letter-spacing: -0.2px;
  border-radius: 999px;
  background: var(--interactive-primary, #0061ff);
  height: 48px;
  padding: 12px 24px;
  max-width: 500px;

  &:disabled {
    border-color: var(--border-default, #e5e8eb);
    background: var(--bg-disabled, #e5e8eb);
    color: var(--text-disabled, #8b95a1);
    cursor: not-allowed;
    box-shadow: none;
  }
`;
