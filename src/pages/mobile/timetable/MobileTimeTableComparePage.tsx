import { useState, useMemo, useRef } from "react";
import styled from "styled-components";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useHeader } from "@/context/HeaderContext";
import { MOBILE_PAGE_GUTTER } from "@/styles/responsive";
import { ROUTES } from "@/constants/routes";
import { getFriends } from "@/apis/friends";
import { Drawer } from "vaul";

// 공용 컴포넌트 임포트
import TabUpper from "@/components/common/TabUpper";
import TabSub from "@/components/common/TabSub";
import DayChip from "@/components/common/DayChip";
import TimetableGrid, {
  ClassItem,
} from "@/components/mobile/timetable/TimetableGrid";

// 아이콘
import { Plus } from "lucide-react";

// ==========================================
// 1. 목업 데이터 정의
// ==========================================

const MY_CLASSES: ClassItem[] = [
  {
    id: 100,
    name: "Academic English",
    room: "12-402",
    day: 0, // 월
    startTime: 11,
    endTime: 13,
    color: "#FEF3C7", // 연한 노란색
  },
  {
    id: 101,
    name: "자기설계세미나",
    room: "06-102",
    day: 0,
    startTime: 14,
    endTime: 15,
    color: "#FEF3C7",
  },
  {
    id: 102,
    name: "프로그래밍입문",
    room: "07-407",
    day: 0,
    startTime: 15,
    endTime: 17,
    color: "#FEF3C7",
  },
  {
    id: 103,
    name: "소셜커뮤니케이션",
    room: "12-404",
    day: 1, // 화
    startTime: 10,
    endTime: 12,
    color: "#FEF3C7",
  },
  {
    id: 104,
    name: "대학수학 (1)",
    room: "07-407",
    day: 1,
    startTime: 15,
    endTime: 18,
    color: "#FEF3C7",
  },
  {
    id: 105,
    name: "프로그래밍입문",
    room: "07-408",
    day: 2, // 수
    startTime: 10,
    endTime: 12,
    color: "#FEF3C7",
  },
  {
    id: 106,
    name: "컴퓨터공학개론",
    room: "07-407",
    day: 2,
    startTime: 13,
    endTime: 15,
    color: "#FEF3C7",
  },
  {
    id: 107,
    name: "소셜커뮤니케이션",
    room: "12-404",
    day: 3, // 목
    startTime: 10,
    endTime: 12,
    color: "#FEF3C7",
  },
  {
    id: 108,
    name: "창의적사고와문제해결",
    room: "12-304",
    day: 4, // 금
    startTime: 13,
    endTime: 17,
    color: "#FEF3C7",
  },
];

const FRIEND_CLASSES: Record<string, ClassItem[]> = {
  김유니: [
    {
      id: 200,
      name: "모바일소프트웨어",
      room: "12-402",
      day: 0, // 월
      startTime: 12,
      endTime: 15,
      color: "#FFE5EE", // 연한 분홍색
    },
    {
      id: 201,
      name: "컴퓨터구조",
      room: "07-505",
      day: 0,
      startTime: 16,
      endTime: 18,
      color: "#FFE5EE",
    },
    {
      id: 202,
      name: "인공지능개론",
      room: "07-304",
      day: 1, // 화
      startTime: 16,
      endTime: 18,
      color: "#FFE5EE",
    },
    {
      id: 203,
      name: "UXUI디자인",
      room: "28-206",
      day: 2, // 수
      startTime: 10,
      endTime: 12,
      color: "#FFE5EE",
    },
    {
      id: 204,
      name: "컴퓨터구조",
      room: "07-505",
      day: 2,
      startTime: 15,
      endTime: 17,
      color: "#FFE5EE",
    },
    {
      id: 205,
      name: "멀티미디어프로그래밍",
      room: "28-203",
      day: 3, // 목
      startTime: 12,
      endTime: 15,
      color: "#FFE5EE",
    },
  ],
  "친구 2": [
    {
      id: 300,
      name: "자료구조",
      room: "07-302",
      day: 1, // 화
      startTime: 9,
      endTime: 12,
      color: "#FFE5EE",
    },
    {
      id: 301,
      name: "알고리즘",
      room: "07-302",
      day: 3, // 목
      startTime: 13,
      endTime: 16,
      color: "#FFE5EE",
    },
  ],
  "친구 3": [
    {
      id: 400,
      name: "컴퓨터네트워크",
      room: "07-201",
      day: 2, // 수
      startTime: 13,
      endTime: 15,
      color: "#FFE5EE",
    },
  ],
  "친구 4": [
    {
      id: 500,
      name: "데이터베이스",
      room: "07-105",
      day: 4, // 금
      startTime: 9,
      endTime: 12,
      color: "#FFE5EE",
    },
  ],
};

const DEFAULT_FRIENDS_LIST = [
  { friendId: 1001, nickname: "김유니", friendAlias: "김유니" },
  { friendId: 1002, nickname: "친구 2", friendAlias: "친구 2" },
  { friendId: 1003, nickname: "친구 3", friendAlias: "친구 3" },
  { friendId: 1004, nickname: "친구 4", friendAlias: "친구 4" },
];

const DAYS_KOREAN = ["월요일", "화요일", "수요일", "목요일", "금요일"];

const formatTime = (time: number) => {
  const h = Math.floor(time);
  const m = Math.round((time - h) * 60);
  const hStr = h < 10 ? `0${h}` : `${h}`;
  const mStr = m < 10 ? `0${m}` : `${m}`;
  return `${hStr}:${mStr}`;
};

const formatDuration = (hours: number) => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h > 0 && m > 0) return `${h}시간 ${m}분`;
  if (h > 0) return `${h}시간`;
  return `${m}분`;
};

export default function MobileTimeTableComparePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const friendIdsParam = searchParams.get("ids") || "";

  // 2. 친구 목록 로드
  const { data: friendsRes } = useQuery({
    queryKey: ["friends"],
    queryFn: getFriends,
  });

  const friendsMap = useMemo(() => {
    const list = friendsRes?.data || [];
    return list.length > 0 ? list : DEFAULT_FRIENDS_LIST;
  }, [friendsRes]);

  // 쿼리 파라미터 기반 선택된 친구들
  const selectedFriendIds = useMemo(() => {
    return friendIdsParam.split(",").map(Number).filter(Boolean);
  }, [friendIdsParam]);

  const activeFriends = useMemo(() => {
    // 쿼리로 들어온 ID에 매칭되는 친구 필터링
    const filtered = friendsMap.filter((f) =>
      selectedFriendIds.includes(f.friendId),
    );
    // 만약 매칭되는 친구가 없다면 기본 김유니와 더미친구리스트 제공
    return filtered.length > 0 ? filtered : friendsMap;
  }, [friendsMap, selectedFriendIds]);

  // 3. 페이지 탭 상태 정의
  const [activeTabUpper, setActiveTabUpper] = useState("compare"); // "compare" | "free"
  const [activeTabSub, setActiveTabSub] = useState("me"); // "me" | "friend" | "all"

  // subHeader 정의 (대분류 탭을 고정 헤더 영역으로 이동)
  const subHeader = useMemo(
    () => (
      <TabUpper
        tabs={[
          { id: "compare", label: "비교" },
          { id: "free", label: "공강" },
        ]}
        activeTabId={activeTabUpper}
        onChange={(id) => setActiveTabUpper(id)}
      />
    ),
    [activeTabUpper],
  );

  // 1. 헤더 설정
  useHeader({
    title: "친구와 시간표 비교",
    hasback: true,
    subHeader,
    floatingSubHeader: false,
  });

  // 선택된 활성 친구 칩 (단일 칩 선택 상태)
  const [activeFriendName, setActiveFriendName] = useState("김유니");

  // 공강 시간 선택 상태 (시간표에 하이라이트 표시용)
  const [highlightedSlot, setHighlightedSlot] = useState<{
    day: number;
    startTime: number;
    endTime: number;
  } | null>(null);

  const handleSlotClick = (slot: {
    day: number;
    startTime: number;
    endTime: number;
  }) => {
    setHighlightedSlot((prev) => {
      if (
        prev &&
        prev.day === slot.day &&
        prev.startTime === slot.startTime &&
        prev.endTime === slot.endTime
      ) {
        return null;
      }
      return slot;
    });
  };

  // 바텀시트 snap 높이 상태
  const [snap, setSnap] = useState<string | number | null>(0.45);

  const touchGestureRef = useRef({
    startY: 0,
    lastY: 0,
    startAtTop: false,
    startAtBottom: false,
    isEdgeSwipe: false,
  });

  const snapPoints = [0.12, 0.45, 0.85] as const;

  const getSnapIndex = () => {
    const currentSnap = typeof snap === "number" ? snap : 0.45;
    const currentIndex = snapPoints.findIndex((point) => point === currentSnap);
    return currentIndex === -1 ? 1 : currentIndex;
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const listElement = event.currentTarget;
    const touchY = event.touches[0]?.clientY ?? 0;
    const maxScrollTop = Math.max(
      listElement.scrollHeight - listElement.clientHeight,
      0,
    );

    touchGestureRef.current = {
      startY: touchY,
      lastY: touchY,
      startAtTop: listElement.scrollTop <= 1,
      startAtBottom: listElement.scrollTop >= maxScrollTop - 1,
      isEdgeSwipe: false,
    };
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    const touchY = event.touches[0]?.clientY ?? touchGestureRef.current.lastY;
    const deltaY = touchY - touchGestureRef.current.startY;

    touchGestureRef.current.lastY = touchY;

    const isDraggingDown = deltaY > 0;
    const canResizeDrawer =
      (isDraggingDown && touchGestureRef.current.startAtTop) ||
      (!isDraggingDown && touchGestureRef.current.startAtBottom);

    if (!canResizeDrawer || deltaY === 0) {
      touchGestureRef.current.isEdgeSwipe = false;
      return;
    }

    if (event.cancelable) {
      event.preventDefault();
    }
    touchGestureRef.current.isEdgeSwipe = true;
  };

  const handleTouchEnd = () => {
    const { isEdgeSwipe, startY, lastY } = touchGestureRef.current;

    if (!isEdgeSwipe) {
      return;
    }

    const deltaY = lastY - startY;

    if (Math.abs(deltaY) < 48) {
      return;
    }

    const currentIndex = getSnapIndex();
    const nextIndex =
      deltaY < 0
        ? Math.min(currentIndex + 1, snapPoints.length - 1)
        : Math.max(currentIndex - 1, 0);

    if (nextIndex !== currentIndex) {
      setSnap(snapPoints[nextIndex]);
    }
  };

  const currentFriendClasses = useMemo(() => {
    return FRIEND_CLASSES[activeFriendName] || FRIEND_CLASSES["김유니"];
  }, [activeFriendName]);

  // 겹치는 공강 목록 계산
  const freeSlotsList = useMemo(() => {
    const list: {
      day: number;
      startTime: number;
      endTime: number;
      duration: number;
    }[] = [];
    for (let day = 0; day < 5; day++) {
      let currentStart: number | null = null;
      for (let hour = 9; hour < 18; hour++) {
        const isMeBusy = MY_CLASSES.some(
          (c) => c.day === day && hour >= c.startTime && hour < c.endTime,
        );
        const isFriendBusy = currentFriendClasses.some(
          (c) => c.day === day && hour >= c.startTime && hour < c.endTime,
        );
        const isBothFree = !isMeBusy && !isFriendBusy;

        if (isBothFree) {
          if (currentStart === null) {
            currentStart = hour;
          }
        } else {
          if (currentStart !== null) {
            list.push({
              day,
              startTime: currentStart,
              endTime: hour,
              duration: hour - currentStart,
            });
            currentStart = null;
          }
        }
      }
      if (currentStart !== null) {
        list.push({
          day,
          startTime: currentStart,
          endTime: 18,
          duration: 18 - currentStart,
        });
      }
    }
    return list;
  }, [currentFriendClasses]);

  // 만나기 좋은 시간: 1시간 초과인 경우 (긴 시간 순으로 정렬)
  const goodMeetingTimes = useMemo(() => {
    return freeSlotsList
      .filter((s) => s.duration > 1.0)
      .sort((a, b) => b.duration - a.duration);
  }, [freeSlotsList]);

  // 짧은 공강: 1시간 이하인 경우 (30분 단위)
  const shortFreeTimes = useMemo(() => {
    return freeSlotsList.filter((s) => s.duration <= 1.0);
  }, [freeSlotsList]);

  // "모두" 보기 오버레이 시간표 생성 헬퍼
  const allViewClasses = useMemo(() => {
    const result: ClassItem[] = [];
    let idCounter = 10000;

    for (let day = 0; day < 5; day++) {
      let currentBlock: {
        type: "me" | "friend" | "overlap" | "free";
        startTime: number;
        endTime: number;
      } | null = null;

      for (let hour = 9; hour < 18; hour++) {
        const isMeBusy = MY_CLASSES.some(
          (c) => c.day === day && hour >= c.startTime && hour < c.endTime,
        );
        const isFriendBusy = currentFriendClasses.some(
          (c) => c.day === day && hour >= c.startTime && hour < c.endTime,
        );

        let type: "me" | "friend" | "overlap" | "free" = "free";
        if (isMeBusy && isFriendBusy) type = "overlap";
        else if (isMeBusy) type = "me";
        else if (isFriendBusy) type = "friend";

        if (currentBlock && currentBlock.type === type) {
          currentBlock.endTime = hour + 1;
        } else {
          if (currentBlock && currentBlock.type !== "free") {
            result.push({
              id: idCounter++,
              name: "",
              room: "",
              day,
              startTime: currentBlock.startTime,
              endTime: currentBlock.endTime,
              color:
                currentBlock.type === "me"
                  ? "#FEF3C7" // 노란색
                  : currentBlock.type === "friend"
                    ? "#FFE5EE" // 분홍색
                    : "#FFD5BF", // 주황색
            });
          }
          currentBlock = { type, startTime: hour, endTime: hour + 1 };
        }
      }

      if (currentBlock && currentBlock.type !== "free") {
        result.push({
          id: idCounter++,
          name: "",
          room: "",
          day,
          startTime: currentBlock.startTime,
          endTime: currentBlock.endTime,
          color:
            currentBlock.type === "me"
              ? "#FEF3C7"
              : currentBlock.type === "friend"
                ? "#FFE5EE"
                : "#FFD5BF",
        });
      }
    }
    return result;
  }, [currentFriendClasses]);

  // "공강" 보기 시간표 생성 헬퍼
  const freeViewClasses = useMemo(() => {
    const result: ClassItem[] = [];
    let idCounter = 20000;

    for (let day = 0; day < 5; day++) {
      let currentBlock: {
        startTime: number;
        endTime: number;
      } | null = null;

      for (let hour = 9; hour < 18; hour++) {
        const isMeBusy = MY_CLASSES.some(
          (c) => c.day === day && hour >= c.startTime && hour < c.endTime,
        );
        const isFriendBusy = currentFriendClasses.some(
          (c) => c.day === day && hour >= c.startTime && hour < c.endTime,
        );

        const isBothFree = !isMeBusy && !isFriendBusy;

        if (isBothFree) {
          if (currentBlock) {
            currentBlock.endTime = hour + 1;
          } else {
            currentBlock = { startTime: hour, endTime: hour + 1 };
          }
        } else {
          if (currentBlock) {
            result.push({
              id: idCounter++,
              name: "공강",
              room: "",
              day,
              startTime: currentBlock.startTime,
              endTime: currentBlock.endTime,
              color: "rgba(81, 207, 102, 0.25)",
            });
            currentBlock = null;
          }
        }
      }

      if (currentBlock) {
        result.push({
          id: idCounter++,
          name: "공강",
          room: "",
          day,
          startTime: currentBlock.startTime,
          endTime: currentBlock.endTime,
          color: "rgba(81, 207, 102, 0.25)",
        });
      }
    }
    return result;
  }, [currentFriendClasses]);

  // 현재 탭 선택에 맞는 시간표 이벤트 결정
  const activeEvents = useMemo(() => {
    if (activeTabUpper === "free") {
      return freeViewClasses;
    }
    // activeTabUpper === "compare"
    if (activeTabSub === "me") return MY_CLASSES;
    if (activeTabSub === "friend") return currentFriendClasses;
    return allViewClasses; // "all"
  }, [
    activeTabUpper,
    activeTabSub,
    currentFriendClasses,
    allViewClasses,
    freeViewClasses,
  ]);

  const isFreeTab = activeTabUpper === "free";

  return (
    <PageWrapper
      $isFreeTab={isFreeTab}
      $snapHeight={typeof snap === "number" ? snap : 0.45}
    >
      <ContentArea>
        {/* 2. 대분류 탭이 "비교"일 때만 소분류 서브탭 노출 */}
        {activeTabUpper === "compare" && (
          <TabSubWrapper>
            <TabSub
              tabs={[
                { id: "me", label: "나" },
                { id: "friend", label: "친구" },
                { id: "all", label: "모두" },
              ]}
              activeTabId={activeTabSub}
              onChange={(id) => setActiveTabSub(id)}
            />
          </TabSubWrapper>
        )}

        {/* 3. "비교-친구" 혹은 "공강" 탭일 때 친구 필터 칩 목록 노출 */}
        {((activeTabUpper === "compare" && activeTabSub === "friend") ||
          activeTabUpper === "free") && (
          <ChipSection>
            <ChipContainer>
              {activeFriends.map((friend) => {
                const name = friend.friendAlias || friend.nickname;
                return (
                  <DayChip
                    key={friend.friendId}
                    label={name}
                    isSelected={activeFriendName === name}
                    onClick={() => setActiveFriendName(name)}
                  />
                );
              })}
              <AddFriendButton
                onClick={() => navigate(ROUTES.TIMETABLE.COMPARE_SELECT)}
              >
                <Plus size={16} />
              </AddFriendButton>
            </ChipContainer>
          </ChipSection>
        )}

        {/* 4. 시간표 영역 */}
        <GridSection>
          <TimetableGrid
            events={activeEvents}
            highlightedSlot={highlightedSlot}
          />
        </GridSection>
      </ContentArea>

      {/* 5. 겹치는 공강 바텀시트 (대분류가 공강일 때만 상시 노출) */}
      <Drawer.Root
        open={isFreeTab}
        modal={false}
        dismissible={false}
        snapPoints={[0.12, 0.45, 0.85]}
        activeSnapPoint={snap}
        setActiveSnapPoint={setSnap}
      >
        <Drawer.Portal>
          <StyledContent>
            <SheetInner>
              <DragHeader>
                <HandleBar />
              </DragHeader>
              <ContentAreaBottomSheet>
                <SectionTitleBottomSheet>겹치는 공강</SectionTitleBottomSheet>
                <ScrollableBody
                  $snapHeight={typeof snap === "number" ? snap : 0.45}
                  data-vaul-no-drag=""
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onTouchCancel={handleTouchEnd}
                >
                  {goodMeetingTimes.length > 0 && (
                    <TimeGroup>
                      <GroupTitle className="good">
                        ★ 만나기 좋은 시간
                      </GroupTitle>
                      <SlotList>
                        {goodMeetingTimes.map((slot, index) => {
                          const isSelected =
                            highlightedSlot &&
                            highlightedSlot.day === slot.day &&
                            highlightedSlot.startTime === slot.startTime &&
                            highlightedSlot.endTime === slot.endTime;
                          return (
                            <SlotItem
                              key={`good-${index}`}
                              $isSelected={!!isSelected}
                              onClick={() => handleSlotClick(slot)}
                            >
                              <SlotLeft>
                                <DayText>{DAYS_KOREAN[slot.day]}</DayText>
                                <TimeText>{`${formatTime(slot.startTime)}~${formatTime(slot.endTime)}`}</TimeText>
                              </SlotLeft>
                              <Badge className="good">
                                {formatDuration(slot.duration)}
                              </Badge>
                            </SlotItem>
                          );
                        })}
                      </SlotList>
                    </TimeGroup>
                  )}

                  {shortFreeTimes.length > 0 && (
                    <TimeGroup>
                      <GroupTitle>짧은 공강</GroupTitle>
                      <SlotList>
                        {shortFreeTimes.map((slot, index) => {
                          const isSelected =
                            highlightedSlot &&
                            highlightedSlot.day === slot.day &&
                            highlightedSlot.startTime === slot.startTime &&
                            highlightedSlot.endTime === slot.endTime;
                          return (
                            <SlotItem
                              key={`short-${index}`}
                              $isSelected={!!isSelected}
                              onClick={() => handleSlotClick(slot)}
                            >
                              <SlotLeft>
                                <DayText>{DAYS_KOREAN[slot.day]}</DayText>
                                <TimeText>{`${formatTime(slot.startTime)}~${formatTime(slot.endTime)}`}</TimeText>
                              </SlotLeft>
                              <Badge>{formatDuration(slot.duration)}</Badge>
                            </SlotItem>
                          );
                        })}
                      </SlotList>
                    </TimeGroup>
                  )}

                  {freeSlotsList.length === 0 && (
                    <EmptyStateText>
                      겹치는 공강 시간이 없습니다.
                    </EmptyStateText>
                  )}
                </ScrollableBody>
              </ContentAreaBottomSheet>
            </SheetInner>
          </StyledContent>
        </Drawer.Portal>
      </Drawer.Root>
    </PageWrapper>
  );
}

// ==========================================
// 스타일 정의
// ==========================================

const PageWrapper = styled.div<{ $isFreeTab?: boolean; $snapHeight?: number }>`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  padding: 0 0
    ${({ $isFreeTab, $snapHeight }) =>
      $isFreeTab && typeof $snapHeight === "number"
        ? `calc(${$snapHeight * 100}dvh + 24px)`
        : "calc(var(--nav-height, 0px) + 24px)"};
`;

const ContentArea = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 ${MOBILE_PAGE_GUTTER};
  margin-top: 12px;
  gap: 12px;
`;

const TabSubWrapper = styled.div`
  //margin-bottom: 16px;
`;

const ChipSection = styled.div`
  //margin-bottom: 16px;
  width: 100%;
`;

const ChipContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
  //padding: 4px 0;
  width: 100%;

  /* 스크롤바 숨기기 */
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const AddFriendButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--border-default, #e5e8eb);
  background-color: var(--bg-subtle, #f8f9fb);
  color: var(--text-secondary, #333d4b);
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s ease-in-out;

  &:active {
    transform: scale(0.92);
  }
`;

const GridSection = styled.div`
  width: 100%;
  //margin-top: 8px;
`;

const TimeGroup = styled.div`
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const GroupTitle = styled.h3`
  font-size: 15px;
  font-weight: 600;
  color: var(--text-secondary, #333d4b);
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 4px;

  &.good {
    color: var(--orange-500, #f59e0b);
  }
`;

const SlotList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`;

const SlotItem = styled.div<{ $isSelected?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background-color: ${({ $isSelected }) =>
    $isSelected ? "var(--bg-muted, #f1f3f5)" : "var(--bg-subtle, #f8f9fb)"};
  border: 1px solid
    ${({ $isSelected }) =>
      $isSelected
        ? "var(--text-brand, #0061FF)"
        : "var(--border-default, #e5e8eb)"};
  border-radius: 12px;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition: all 0.2s ease-in-out;

  &:active {
    transform: scale(0.98);
  }
`;

const SlotLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const DayText = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: var(--gray-800, #333d4b);
  min-width: 48px;
`;

const TimeText = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary, #333d4b);
`;

const Badge = styled.div`
  padding: 6px 12px;
  border-radius: 50px;
  font-size: 13px;
  font-weight: 600;
  background-color: var(--bg-muted, #f1f3f5);
  color: var(--text-tertiary, #8b95a1);

  &.good {
    background-color: var(--bg-warn, #fef3c7);
    color: var(--yellow-600, #b58000);
  }
`;

const EmptyStateText = styled.div`
  padding: 32px 0;
  text-align: center;
  color: var(--text-tertiary, #8b95a1);
  font-size: 14px;
  font-weight: 500;
`;

const StyledContent = styled(Drawer.Content)`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  outline: none;

  height: 100%;
  max-height: 96%;
  display: flex;
  flex-direction: column;

  max-width: 768px;
  margin: 0 auto;
`;

const SheetInner = styled.div`
  background: var(--bg-base, #ffffff);
  width: 100%;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  border-top: 1px solid var(--border-default, #e5e8eb);
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));

  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
`;

const DragHeader = styled.div`
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const HandleBar = styled.div`
  width: 36px;
  height: 5px;
  border-radius: 999px;
  background: var(--border-default, #e5e8eb);
`;

const ContentAreaBottomSheet = styled.div`
  padding: 8px 20px 0;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;

const SectionTitleBottomSheet = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: var(--gray-900, #191f28);
  margin: 0 0 16px 0;
`;

const ScrollableBody = styled.div<{ $snapHeight?: number }>`
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
  padding-bottom: 24px;

  /* 스크롤 영역의 높이를 snap 높이에 따라 동적으로 묶어줌 */
  max-height: ${({ $snapHeight }) =>
    typeof $snapHeight === "number"
      ? `calc(${$snapHeight * 100}dvh - 120px)`
      : "none"};

  /* 스크롤바 숨김 */
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;
