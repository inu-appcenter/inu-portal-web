import { useState, useMemo, useRef, useEffect, useLayoutEffect } from "react";
import styled from "styled-components";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueries } from "@tanstack/react-query";
import { useHeader } from "@/context/HeaderContext";
import { MOBILE_PAGE_GUTTER } from "@/styles/responsive";
import { ROUTES } from "@/constants/routes";
import { getFriends } from "@/apis/friends";
import { getFriendPrimaryTimeTableDetail } from "@/apis/timetables";
import { createPersonalChatRoom } from "@/apis/chat";
import BottomSheet from "@/components/common/BottomSheet";
import Modal from "@/components/common/Modal";
import { TimetableShareExtraData } from "@/types/chat";
import { useTimetableStore } from "@/stores/useTimetableStore";
import { useTimeTableDetail, useTimeTables } from "@/hooks/useTimeTables";
import { mapDetailItemsToClassItems } from "@/utils/timetable";
import { mixpanelTrack } from "@/utils/mixpanel";
import type { TimeTableDetail, Term } from "@/types/timetables";
import { useSemesters } from "@/hooks/useSemesters";
import { formatSemester } from "@/utils/semester";
import useUserStore from "@/stores/useUserStore";

// 공용 컴포넌트 임포트
import TabUpper from "@/components/common/TabUpper";
import DayChip from "@/components/common/DayChip";
import TimetableGrid, {
  ClassItem,
} from "@/components/mobile/timetable/TimetableGrid";

// 아이콘
import { Plus, Send, CalendarPlus } from "lucide-react";

const DAYS_KOREAN = ["월요일", "화요일", "수요일", "목요일", "금요일"];

type FriendTimetableState =
  | "LOADING"
  | "PUBLIC"
  | "PROTECTED"
  | "PRIVATE"
  | "NOT_FOUND"
  | "ERROR";

const isProtectedTimetable = (detail: TimeTableDetail) =>
  detail.items.some((item) => {
    const source = item.course ?? item.customSchedule;
    return item.id == null || source?.title == null;
  });

// 응답 유효성 방어 로직(#267). 서버의 "대표 시간표 자동 승격"이 아직 미완성이라
// (server #328), /friends/{id}/primary가 요청한 학기와 다른 학기의 시간표를
// 잘못 대표로 내려줄 가능성을 프론트에서 감지한다. 그대로 표시하면 "이 사람이
// 신청한 이번 학기 시간표"처럼 보이지만 실제로는 다른 학기 데이터라 완전히
// 틀린 정보를 신뢰도 있게 보여주는 셈이 된다 - 차라리 에러로 처리해 숨긴다.
const isSemesterMismatch = (
  detail: TimeTableDetail,
  requested: { year?: number; term?: Term } | null | undefined,
) =>
  requested?.year != null &&
  requested?.term != null &&
  (detail.year !== requested.year || detail.term !== requested.term);

const getErrorStatus = (error: unknown) =>
  (error as { response?: { status?: number } })?.response?.status;

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
  const [searchParams, setSearchParams] = useSearchParams();
  const friendIdsParam = searchParams.get("ids") || "";
  const memberIdsParam = searchParams.get("memberIds") || "";
  // 채팅방 내부의 "공강 맞추기" 버튼(#264)에서 진입한 경우에만 채워진다. 있으면
  // "공유"가 새 채팅방을 만드는 대신 이 방으로 바로 공유한다.
  const originRoomId = searchParams.get("roomId") || "";
  const { userInfo } = useUserStore();
  const { activeTimetableId, timetables, setActiveTimetable } =
    useTimetableStore();

  const chipScrollRef = useRef<HTMLDivElement | null>(null);
  const [hasHorizontalOverflow, setHasHorizontalOverflow] = useState(false);

  useTimeTables();
  const { semesters } = useSemesters();
  const openSemester = useMemo(
    () => semesters.find((semester) => semester.status === "OPEN") ?? null,
    [semesters],
  );

  // 2. 친구 목록 로드
  const { data: friendsRes } = useQuery({
    queryKey: ["friends"],
    queryFn: getFriends,
  });

  const friendsMap = useMemo(() => {
    const list = friendsRes?.data || [];
    return list;
  }, [friendsRes]);

  const selectedFriendIds = useMemo(() => {
    if (memberIdsParam) {
      const memberIds = memberIdsParam.split(",").map(Number).filter(Boolean);
      return friendsMap
        .filter((friend) => memberIds.includes(friend.friendMemberId))
        .map((friend) => friend.friendId);
    }
    return friendIdsParam.split(",").map(Number).filter(Boolean);
  }, [friendIdsParam, memberIdsParam, friendsMap]);

  const activeTimetable = useMemo(() => {
    if (!openSemester) return null;
    const openSemesterLabel = formatSemester(
      openSemester.year,
      openSemester.term,
    );
    const list = timetables.filter((t) => t.semester === openSemesterLabel);
    if (list.length === 0) return null;
    return (
      list.find((t) => t.id === activeTimetableId) ||
      list.find((t) => t.isRepresentative) ||
      list[0]
    );
  }, [timetables, activeTimetableId, openSemester]);

  useTimeTableDetail(activeTimetable?.id);

  // "내 일정 추가"(#265). 이 화면에 표시 중인 시간표(activeTimetable)가 전역
  // activeTimetableId와 다를 수 있어(학기가 다르면 대표 시간표나 목록의 첫 항목으로
  // 대체됨, 위 useMemo 참고) 기존 "일정 추가" 화면(MobileCourseAddPage)으로 그냥
  // 이동하면 전역 activeTimetableId 기준으로 저장돼 여기서 보고 있던 시간표가
  // 아닌 다른 시간표에 저장될 수 있다. 이동 전 전역 상태를 이 화면 기준으로
  // 맞춰준다 - setActiveTimetable은 서버에 반영되는 "대표 시간표" 지정과는 무관한
  // 로컬 UI 선택값이라 부작용이 적다.
  const handleAddMySchedule = () => {
    if (!activeTimetable) {
      alert("먼저 이 학기의 시간표를 만들어 주세요.");
      return;
    }
    if (activeTimetable.id !== activeTimetableId) {
      setActiveTimetable(activeTimetable.id);
    }
    mixpanelTrack.timetableFeatureClicked("내 일정 추가", "시간표 비교");
    navigate(ROUTES.TIMETABLE.ADD);
  };

  const myClasses = useMemo(
    () =>
      (activeTimetable?.events ?? []).map((item) => ({
        ...item,
        color: item.color ?? "#FEF3C7",
      })),
    [activeTimetable?.events],
  );

  const queriedFriends = useMemo(() => {
    if (!friendIdsParam && !memberIdsParam) return friendsMap;
    return friendsMap.filter((friend) =>
      selectedFriendIds.includes(friend.friendId),
    );
  }, [friendsMap, friendIdsParam, memberIdsParam, selectedFriendIds]);

  const friendTimetableQueries = useQueries({
    queries: queriedFriends.map((friend) => {
      const friendMemberId = friend.friendMemberId ?? friend.friendId;
      return {
        queryKey: [
          "timetables",
          "friend-primary",
          friendMemberId,
          openSemester?.year,
          openSemester?.term,
        ],
        queryFn: () =>
          getFriendPrimaryTimeTableDetail(
            friendMemberId,
            openSemester!.year,
            openSemester!.term,
          ),
        enabled:
          Boolean(friendMemberId) &&
          openSemester?.year != null &&
          openSemester?.term != null,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
        retry: false,
      };
    }),
  });

  const friendTimetablesByFriendId = useMemo(() => {
    const entries = queriedFriends.map((friend, index) => {
      const detail = friendTimetableQueries[index]?.data;
      // 학기가 어긋난 응답은 그리드에도 올리지 않는다 - 상태만 ERROR로 감춰도
      // 이 맵에서 걸러지지 않으면 블록은 그대로 그려진다.
      const classes =
        detail && !isSemesterMismatch(detail, openSemester)
          ? mapDetailItemsToClassItems(detail.items)
          : [];
      return [friend.friendId, classes] as const;
    });

    return new Map(entries);
  }, [queriedFriends, friendTimetableQueries, openSemester]);

  const friendTimetableStatesByFriendId = useMemo(() => {
    const entries = queriedFriends.map((friend, index) => {
      const query = friendTimetableQueries[index];
      const detail = query?.data;
      let state: FriendTimetableState;

      if (query?.isPending) {
        state = "LOADING";
      } else if (detail && isSemesterMismatch(detail, openSemester)) {
        console.warn(
          "친구 대표 시간표 응답이 요청한 학기와 다릅니다(server #328 관련 방어 로직, #267):",
          {
            friendId: friend.friendId,
            requested: openSemester,
            received: { year: detail.year, term: detail.term },
          },
        );
        state = "ERROR";
      } else if (detail) {
        state = isProtectedTimetable(detail) ? "PROTECTED" : "PUBLIC";
      } else {
        const status = getErrorStatus(query?.error);
        state =
          status === 403 ? "PRIVATE" : status === 404 ? "NOT_FOUND" : "ERROR";
      }

      return [friend.friendId, state] as const;
    });

    return new Map(entries);
  }, [queriedFriends, friendTimetableQueries, openSemester]);

  const activeFriends = useMemo(() => {
    // 쿼리로 들어온 ID에 매칭되는 친구 필터링
    const filtered = friendsMap.filter((f) =>
      selectedFriendIds.includes(f.friendId),
    );
    const hasSelectionParam = Boolean(friendIdsParam || memberIdsParam);
    const baseList = hasSelectionParam ? filtered : friendsMap;
    // 맨 앞에 "나" 객체 추가
    return [
      { friendId: 99999, nickname: "나", friendAlias: "나" },
      ...baseList,
    ];
  }, [friendsMap, selectedFriendIds, friendIdsParam, memberIdsParam]);

  useLayoutEffect(() => {
    const element = chipScrollRef.current;
    if (!element) return;

    const updateOverflow = () => {
      const { scrollWidth, clientWidth } = element;
      const isOverflowing = scrollWidth > clientWidth + 1;
      setHasHorizontalOverflow(isOverflowing);
    };

    const handle = requestAnimationFrame(updateOverflow);

    const observer = new ResizeObserver(() => {
      updateOverflow();
    });

    observer.observe(element);
    window.addEventListener("resize", updateOverflow);

    return () => {
      cancelAnimationFrame(handle);
      observer.disconnect();
      window.removeEventListener("resize", updateOverflow);
    };
  }, [activeFriends]);

  // 3. 페이지 탭 상태 정의 (URL 쿼리 파라미터 연동)
  const activeTabUpper =
    (searchParams.get("tab") as "compare" | "free") || "compare";

  const isSingleFriendMode = useMemo(() => {
    return selectedFriendIds.length === 1;
  }, [selectedFriendIds]);

  // subHeader 정의 (대분류 탭을 고정 헤더 영역으로 이동)
  const subHeader = useMemo(
    () => (
      <TabUpper
        tabs={[
          { id: "compare", label: "겹쳐보기" },
          { id: "free", label: "공강" },
        ]}
        activeTabId={activeTabUpper}
        onChange={(id) => {
          mixpanelTrack.timetableCompareAction("탭 전환", {
            to_tab: id,
            friend_count: selectedFriendIds.length,
          });
          const newParams = new URLSearchParams(searchParams);
          newParams.set("tab", id);
          setSearchParams(newParams, { replace: true });

          if (id === "free") {
            setSelectedFriendIdsState([99999, ...selectedFriendIds]);
          } else if (id === "compare") {
            if (selectedFriendIds.length === 1) {
              setSelectedFriendIdsState([selectedFriendIds[0]]);
            } else {
              setSelectedFriendIdsState([99999]);
            }
          }
        }}
      />
    ),
    [activeTabUpper, selectedFriendIds, searchParams, setSearchParams],
  );

  // 1. 헤더 설정
  useHeader({
    title: isSingleFriendMode ? "친구 시간표" : "친구와 시간표 비교",
    hasback: true,
    subHeader,
    floatingSubHeader: false,
  });

  // 다중 선택된 친구 ID 목록 상태 (초기값으로 비교 탭은 "나"만 지정, 공강 탭이면 전체 지정)
  const [selectedFriendIdsState, setSelectedFriendIdsState] = useState<
    number[]
  >(() => {
    const currentTab = searchParams.get("tab") || "compare";
    if (currentTab === "free") {
      return [99999, ...selectedFriendIds];
    }
    if (isSingleFriendMode) {
      return [selectedFriendIds[0]];
    }
    return [99999];
  });

  // URL 쿼리 파라미터(ids)가 변경되면 상태를 동기화
  useEffect(() => {
    if (activeTabUpper === "free") {
      setSelectedFriendIdsState([99999, ...selectedFriendIds]);
    } else {
      if (selectedFriendIds.length === 1) {
        setSelectedFriendIdsState([selectedFriendIds[0]]);
      } else {
        setSelectedFriendIdsState([99999]); // 비교 탭에서는 "나"만 선택된 상태로 리셋
      }
    }
  }, [selectedFriendIds, activeTabUpper, isSingleFriendMode]);

  const handleFriendChipClick = (friendId: number) => {
    mixpanelTrack.timetableCompareAction("친구 선택", {
      selection_type:
        friendId === -1 ? "전체" : friendId === 99999 ? "나" : "친구",
      tab_name: activeTabUpper,
    });
    if (friendId === -1) {
      // 모두 버튼 클릭
      const isAllSelected =
        selectedFriendIdsState.length === activeFriends.length;
      if (isAllSelected) {
        if (isSingleFriendMode) {
          setSelectedFriendIdsState([selectedFriendIds[0]]);
        } else {
          setSelectedFriendIdsState([99999]); // 나만 선택
        }
      } else {
        setSelectedFriendIdsState(activeFriends.map((f) => f.friendId)); // 모두 선택
      }
      return;
    }

    if (
      !isSingleFriendMode &&
      activeTabUpper === "compare" &&
      friendId === 99999
    )
      return; // 비교 탭에서만 "나" 고정 (선택 해제 불가)
    setSelectedFriendIdsState((prev) => {
      if (prev.includes(friendId)) {
        return prev.filter((id) => id !== friendId);
      }
      return [...prev, friendId];
    });
  };

  // 친구의 시간표를 조회/할당하는 헬퍼 함수
  const getFriendTimetable = useMemo(() => {
    return (friend: {
      friendId: number;
      nickname: string;
      friendAlias?: string;
    }): ClassItem[] => {
      return friendTimetablesByFriendId.get(friend.friendId) ?? [];
    };
  }, [friendTimetablesByFriendId]);

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
    mixpanelTrack.timetableCompareAction("공강 선택", {
      day: slot.day,
      duration: slot.endTime - slot.startTime,
      selected_friend_count: selectedFriendIdsState.filter((id) => id !== 99999)
        .length,
    });
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

  // 선택된 시간(공강)이 바텀시트에 의해 가려지는 경우 스크롤 처리
  useEffect(() => {
    if (!highlightedSlot) return;

    const timer = setTimeout(() => {
      const element = document.getElementById("timetable-highlighted-block");
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const headerHeight = 130; // 헤더 및 탭 영역 높이 추정치
      const bottomSheetHeight =
        typeof snap === "number"
          ? snap * viewportHeight
          : 0.45 * viewportHeight;
      const visibleAreaHeight =
        viewportHeight - headerHeight - bottomSheetHeight;

      const elementTop = rect.top + window.scrollY;
      const elementHeight = rect.height;

      const elementBottomInViewport = rect.bottom;
      const elementTopInViewport = rect.top;
      const bottomSheetTopInViewport = viewportHeight - bottomSheetHeight;

      const isCoveredByBottomSheet =
        elementBottomInViewport > bottomSheetTopInViewport;
      const isCoveredByHeader = elementTopInViewport < headerHeight;

      if (isCoveredByBottomSheet || isCoveredByHeader) {
        let targetScrollY = window.scrollY;

        if (elementHeight <= visibleAreaHeight) {
          // 화면에 충분히 노출 가능한 높이인 경우 중앙 정렬
          targetScrollY =
            elementTop +
            elementHeight / 2 -
            (headerHeight + visibleAreaHeight / 2);
        } else {
          // 너무 길어 안 들어가는 경우 위쪽 기준 정렬 (여백 16px)
          targetScrollY = elementTop - headerHeight - 16;
        }

        const maxScrollY =
          document.documentElement.scrollHeight - window.innerHeight;
        targetScrollY = Math.max(0, Math.min(targetScrollY, maxScrollY));

        window.scrollTo({ top: targetScrollY, behavior: "smooth" });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [highlightedSlot, snap]);

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

  // 공동 공강 목록 계산 (나 + 선택된 모든 친구들)
  const freeSlotsList = useMemo(() => {
    if (selectedFriendIdsState.length === 0) {
      return [];
    }
    const list: {
      day: number;
      startTime: number;
      endTime: number;
      duration: number;
    }[] = [];

    // 선택된 친구들의 시간표들을 미리 구해둠
    const selectedFriendsTimetables = selectedFriendIdsState
      .filter((id) => id !== 99999)
      .map((friendId) => {
        const friend = friendsMap.find((f) => f.friendId === friendId);
        return friend ? getFriendTimetable(friend) : [];
      });

    for (let day = 0; day < 5; day++) {
      let currentStart: number | null = null;
      for (let hour = 9; hour < 18; hour++) {
        const isMeSelected = selectedFriendIdsState.includes(99999);
        const isMeBusy =
          isMeSelected &&
          myClasses.some(
            (c) => c.day === day && hour >= c.startTime && hour < c.endTime,
          );
        const isAnyFriendBusy = selectedFriendsTimetables.some((classes) => {
          return classes.some(
            (c) => c.day === day && hour >= c.startTime && hour < c.endTime,
          );
        });
        const isBothFree = !isMeBusy && !isAnyFriendBusy;

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
  }, [selectedFriendIdsState, friendsMap, getFriendTimetable, myClasses]);

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

  // "공강" 보기 시간표 생성 헬퍼
  const freeViewClasses = useMemo(() => {
    if (selectedFriendIdsState.length === 0) {
      return [];
    }
    const result: ClassItem[] = [];
    let idCounter = 20000;

    // 선택된 친구들의 시간표들을 미리 구해둠
    const selectedFriendsTimetables = selectedFriendIdsState
      .filter((id) => id !== 99999)
      .map((friendId) => {
        const friend = friendsMap.find((f) => f.friendId === friendId);
        return friend ? getFriendTimetable(friend) : [];
      });

    for (let day = 0; day < 5; day++) {
      let currentBlock: {
        startTime: number;
        endTime: number;
      } | null = null;

      for (let hour = 9; hour < 18; hour++) {
        const isMeSelected = selectedFriendIdsState.includes(99999);
        const isMeBusy =
          isMeSelected &&
          myClasses.some(
            (c) => c.day === day && hour >= c.startTime && hour < c.endTime,
          );
        const isAnyFriendBusy = selectedFriendsTimetables.some((classes) => {
          return classes.some(
            (c) => c.day === day && hour >= c.startTime && hour < c.endTime,
          );
        });

        const isBothFree = !isMeBusy && !isAnyFriendBusy;

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
              name: "",
              room: "",
              day,
              startTime: currentBlock.startTime,
              endTime: currentBlock.endTime,
              color:
                "var(--timeTable-color-available-time, rgba(59, 130, 246, 0.20))",
            });
            currentBlock = null;
          }
        }
      }

      if (currentBlock) {
        result.push({
          id: idCounter++,
          name: "",
          room: "",
          day,
          startTime: currentBlock.startTime,
          endTime: currentBlock.endTime,
          color:
            "var(--timeTable-color-available-time, rgba(59, 130, 246, 0.20))",
        });
      }
    }
    return result;
  }, [selectedFriendIdsState, friendsMap, getFriendTimetable, myClasses]);

  // 현재 탭 선택에 맞는 시간표 이벤트 결정
  const activeEvents = useMemo(() => {
    if (activeTabUpper === "free") {
      return freeViewClasses;
    }
    // activeTabUpper === "compare" 일 때: 내 시간표 + 선택된 친구들의 시간표를 겹쳐서 노출
    const result: ClassItem[] = [];
    if (selectedFriendIdsState.includes(99999)) {
      result.push(
        ...myClasses.map((c) => ({
          ...c,
          ownerName: "내 시간표",
        })),
      );
    }
    selectedFriendIdsState.forEach((friendId) => {
      const friend = friendsMap.find((f) => f.friendId === friendId);
      if (friend) {
        const classes = getFriendTimetable(friend);
        result.push(
          ...classes.map((c) => ({
            ...c,
            ownerName: (friend.friendAlias || friend.nickname) + "의 시간표",
            isFriendOwned: true,
          })),
        );
      }
    });
    return result;
  }, [
    activeTabUpper,
    selectedFriendIdsState,
    friendsMap,
    getFriendTimetable,
    freeViewClasses,
    myClasses,
  ]);

  const isFreeTab = activeTabUpper === "free";
  const selectedFriendStates = useMemo(
    () =>
      selectedFriendIdsState
        .filter((id) => id !== 99999)
        .map((id) => ({
          id,
          name:
            friendsMap.find((friend) => friend.friendId === id)?.friendAlias ||
            friendsMap.find((friend) => friend.friendId === id)?.nickname ||
            "친구",
          state: friendTimetableStatesByFriendId.get(id) ?? "LOADING",
        })),
    [selectedFriendIdsState, friendsMap, friendTimetableStatesByFriendId],
  );

  const timetableNotice = useMemo(() => {
    if (selectedFriendStates.length === 0) return null;

    if (selectedFriendStates.some(({ state }) => state === "LOADING")) {
      return { kind: "loading", text: "친구 시간표를 불러오고 있어요." };
    }

    const privateNames = selectedFriendStates
      .filter(({ state }) => state === "PRIVATE")
      .map(({ name }) => name);
    if (privateNames.length > 0) {
      return {
        kind: "blocked",
        text: `${privateNames.join(", ")}님의 시간표는 비공개예요.`,
      };
    }

    const missingNames = selectedFriendStates
      .filter(({ state }) => state === "NOT_FOUND")
      .map(({ name }) => name);
    if (missingNames.length > 0) {
      return {
        kind: "empty",
        text: `${missingNames.join(", ")}님의 해당 학기 대표 시간표가 없어요.`,
      };
    }

    if (selectedFriendStates.some(({ state }) => state === "ERROR")) {
      return { kind: "error", text: "친구 시간표를 불러오지 못했어요." };
    }

    if (selectedFriendStates.some(({ state }) => state === "PROTECTED")) {
      if (isFreeTab) return null;
      return {
        kind: "protected",
        text: "상대방이 강의 시간만 공개하여 강의 정보는 볼 수 없어요.",
      };
    }

    return null;
  }, [selectedFriendStates, isFreeTab]);

  const shouldHideGrid =
    isSingleFriendMode &&
    selectedFriendStates.some(({ state }) =>
      ["LOADING", "PRIVATE", "NOT_FOUND", "ERROR"].includes(state),
    );
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const confirmModalDescription = useMemo(() => {
    let targetIds = selectedFriendIdsState.filter((id) => id !== 99999);
    if (targetIds.length === 0) {
      const idsParam = searchParams.get("ids");
      if (idsParam) {
        targetIds = idsParam
          .split(",")
          .map(Number)
          .filter((id) => Boolean(id) && id !== 99999);
      }
    }

    const names = targetIds
      .map((id) => {
        const friend = friendsMap.find((f: any) => f.friendId === id);
        return friend ? friend.friendAlias || friend.nickname : "";
      })
      .filter(Boolean);

    if (names.length === 0) {
      return "선택한 인원의 단체톡방에 공유할까요?";
    }
    if (names.length === 1) {
      return `선택한 ${names[0]} 님과의 채팅방에 공유할까요?`;
    }
    if (names.length <= 3) {
      return `선택한 ${names.join(", ")} 님 단체톡방에 공유할까요?`;
    }
    const topNames = names.slice(0, 3).join(", ");
    const extraCount = names.length - 3;
    return `선택한 ${topNames} 님 외 ${extraCount}명 단체톡방에 공유할까요?`;
  }, [selectedFriendIdsState, searchParams, friendsMap]);

  const buildTimetableSharePayload = (
    targetFriendIds: number[],
  ): TimetableShareExtraData => ({
    title: "시간표 겹쳐보기 & 공강 공유",
    friendIds: targetFriendIds,
    memberIds: [
      userInfo.id,
      ...targetFriendIds
        .map(
          (friendId) =>
            friendsMap.find((friend) => friend.friendId === friendId)
              ?.friendMemberId,
        )
        .filter((memberId): memberId is number => memberId != null),
    ].filter(
      (memberId, index, ids) =>
        memberId > 0 && ids.indexOf(memberId) === index,
    ),
    topFreeTimes: goodMeetingTimes.slice(0, 3).map((slot) => ({
      day: slot.day,
      startTime: slot.startTime,
      endTime: slot.endTime,
      duration: slot.duration,
    })),
  });

  const shareMutation = useMutation({
    mutationFn: async (targetFriendIds: number[]) =>
      createPersonalChatRoom(targetFriendIds),
    onSuccess: (res: any, variables: number[]) => {
      setIsConfirmModalOpen(false);
      mixpanelTrack.timetableCompareAction("공유", {
        friend_count: variables.length,
        free_slot_count: goodMeetingTimes.length,
      });
      const roomData = res.data || res;
      const roomId = roomData.id || roomData.roomId;
      if (roomId) {
        const payload = buildTimetableSharePayload(variables);
        const payloadStr = encodeURIComponent(JSON.stringify(payload));
        navigate(`${ROUTES.CHAT.ROOT}/${roomId}?sharePayload=${payloadStr}`);
      }
    },
    onError: (error: any) => {
      alert(error.response?.data?.msg || "채팅방 생성/이동에 실패했습니다.");
    },
  });

  const handleShareButtonClick = () => {
    let targetIds = selectedFriendIdsState.filter((id) => id !== 99999);
    if (targetIds.length === 0) {
      const idsParam = searchParams.get("ids");
      if (idsParam) {
        targetIds = idsParam
          .split(",")
          .map(Number)
          .filter((id) => Boolean(id) && id !== 99999);
      }
    }

    if (targetIds.length === 0) {
      alert("공유할 친구가 선택되지 않았습니다.");
      return;
    }

    setIsConfirmModalOpen(true);
  };

  const handleExecuteShare = () => {
    let targetIds = selectedFriendIdsState.filter((id) => id !== 99999);
    if (targetIds.length === 0) {
      const idsParam = searchParams.get("ids");
      if (idsParam) {
        targetIds = idsParam
          .split(",")
          .map(Number)
          .filter((id) => Boolean(id) && id !== 99999);
      }
    }

    // 채팅방 "공강 맞추기" 버튼으로 들어온 경우, 새 채팅방을 만들지 않고 원래
    // 있던 그 방으로 바로 공유한다(#264 목표 상태의 마지막 항목).
    if (originRoomId) {
      setIsConfirmModalOpen(false);
      mixpanelTrack.timetableCompareAction("공유", {
        friend_count: targetIds.length,
        free_slot_count: goodMeetingTimes.length,
      });
      const payload = buildTimetableSharePayload(targetIds);
      const payloadStr = encodeURIComponent(JSON.stringify(payload));
      navigate(`${ROUTES.CHAT.ROOT}/${originRoomId}?sharePayload=${payloadStr}`);
      return;
    }

    shareMutation.mutate(targetIds);
  };

  return (
    <PageWrapper
      $isFreeTab={isFreeTab}
      $snapHeight={typeof snap === "number" ? snap : 0.45}
    >
      <ContentArea>
        {/* 2. 친구 필터 칩 목록 노출 */}
        {(activeTabUpper === "compare" || activeTabUpper === "free") && (
          <ChipSection data-vaul-no-drag="">
            <ChipScrollArea
              ref={chipScrollRef}
              $hasHorizontalOverflow={hasHorizontalOverflow}
              data-vaul-no-drag=""
            >
              <DayChip
                key="all"
                label="모두"
                isSelected={
                  selectedFriendIdsState.length === activeFriends.length
                }
                onClick={() => handleFriendChipClick(-1)}
              />
              {activeFriends.map((friend) => {
                const name = friend.friendAlias || friend.nickname;
                const isSelected =
                  !isSingleFriendMode &&
                  activeTabUpper === "compare" &&
                  friend.friendId === 99999
                    ? true
                    : selectedFriendIdsState.includes(friend.friendId);
                return (
                  <DayChip
                    key={friend.friendId}
                    label={name}
                    isSelected={isSelected}
                    onClick={() => handleFriendChipClick(friend.friendId)}
                  />
                );
              })}
            </ChipScrollArea>
            <RightActionGroup data-vaul-no-drag="">
              <AddFriendButton
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAddMySchedule();
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAddMySchedule();
                }}
                aria-label="내 일정 추가"
              >
                <CalendarPlus size={18} strokeWidth={2} />
              </AddFriendButton>
              <AddFriendButton
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const allFriendIds = searchParams.get("ids") || "";
                  navigate(
                    allFriendIds
                      ? `${ROUTES.FRIEND.LIST}?ids=${allFriendIds}`
                      : ROUTES.FRIEND.LIST,
                  );
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const allFriendIds = searchParams.get("ids") || "";
                  navigate(
                    allFriendIds
                      ? `${ROUTES.FRIEND.LIST}?ids=${allFriendIds}`
                      : ROUTES.FRIEND.LIST,
                  );
                }}
                aria-label="친구 추가/선택"
              >
                <Plus size={18} strokeWidth={2} />
              </AddFriendButton>
            </RightActionGroup>
          </ChipSection>
        )}

        {/* 4. 시간표 영역 */}
        {!shouldHideGrid && (
          <GridSection>
            <TimetableGrid
              events={activeEvents}
              highlightedSlot={highlightedSlot}
              isCompareMode={activeTabUpper === "compare"}
              isFreeMode={activeTabUpper === "free"}
            />
          </GridSection>
        )}

        {timetableNotice && (
          <TimetableNotice $kind={timetableNotice.kind}>
            {timetableNotice.text}
          </TimetableNotice>
        )}
      </ContentArea>

      {/* 5. 겹치는 공강 바텀시트 (대분류가 공강일 때만 상시 노출) */}
      <BottomSheet
        open={isFreeTab}
        modal={false}
        dismissible={false}
        snapPoints={[0.12, 0.45, 0.85]}
        activeSnapPoint={snap}
        setActiveSnapPoint={setSnap}
        disablePreventScroll={true}
        height="100%"
        zIndex={200}
      >
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
                <span className="star">★ </span>만나기 좋은 시간
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
                      className="good"
                    >
                      <SlotLeft>
                        <DayText className="good">
                          {DAYS_KOREAN[slot.day]}
                        </DayText>
                        <TimeText className="good">{`${formatTime(slot.startTime)}~${formatTime(slot.endTime)}`}</TimeText>
                      </SlotLeft>
                      <Badge className="good" $isSelected={!!isSelected}>
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
                      <Badge $isSelected={!!isSelected}>
                        {formatDuration(slot.duration)}
                      </Badge>
                    </SlotItem>
                  );
                })}
              </SlotList>
            </TimeGroup>
          )}

          {selectedFriendIdsState.length === 0 ? (
            <EmptyStateText>
              공강을 비교할 대상을 상단 칩에서 선택해 주세요.
            </EmptyStateText>
          ) : (
            freeSlotsList.length === 0 && (
              <EmptyStateText>겹치는 공강 시간이 없습니다.</EmptyStateText>
            )
          )}
        </ScrollableBody>
      </BottomSheet>

      {/* 6. 결과 공유 플로팅 버튼 */}
      <FloatingShareButton
        aria-label="결과 공유"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleShareButtonClick();
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleShareButtonClick();
        }}
        data-vaul-no-drag=""
      >
        <Send size={24} color="#ffffff" />
      </FloatingShareButton>

      {/* 7. 공유 확인 모달 */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="공강 정보 공유"
        description={confirmModalDescription}
        primaryButton={{
          text: "공유하기",
          onClick: handleExecuteShare,
          loading: shareMutation.isPending,
        }}
        secondaryButton={{
          text: "취소",
          onClick: () => setIsConfirmModalOpen(false),
        }}
      />
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

const ChipSection = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  width: 100%;
  position: relative;
  z-index: 10;
`;

const ChipScrollArea = styled.div<{ $hasHorizontalOverflow: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  flex: 1;
  position: relative;
  z-index: 11;
  -webkit-overflow-scrolling: touch;

  overflow-x: ${({ $hasHorizontalOverflow }) =>
    $hasHorizontalOverflow ? "auto" : "hidden"};

  padding-right: ${({ $hasHorizontalOverflow }) =>
    $hasHorizontalOverflow ? "24px" : "0px"};

  mask-image: ${({ $hasHorizontalOverflow }) =>
    $hasHorizontalOverflow
      ? `linear-gradient(to right, #000 92%, transparent 100%)`
      : "none"};
  -webkit-mask-image: ${({ $hasHorizontalOverflow }) =>
    $hasHorizontalOverflow
      ? `linear-gradient(to right, #000 92%, transparent 100%)`
      : "none"};

  /* 스크롤바 숨기기 */
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;

  & > * {
    flex-shrink: 0;
    min-width: 52px;
    justify-content: center;
  }
`;

const RightActionGroup = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  z-index: 12;
`;

const AddFriendButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--border-default, #e5e8eb);
  background-color: var(--bg-subtle, #f8f9fb);
  color: var(--text-secondary, #333d4b);
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s ease-in-out;

  position: relative;
  z-index: 12;
  pointer-events: auto !important;

  &:active {
    transform: scale(0.92);
  }

  svg {
    pointer-events: none;
  }
`;

const GridSection = styled.div`
  width: 100%;
  //margin-top: 8px;
`;

const TimetableNotice = styled.div<{ $kind: string }>`
  padding: 16px;
  border-radius: 12px;
  background: ${({ $kind }) =>
    $kind === "protected"
      ? "var(--bg-warn, #fff8e1)"
      : "var(--bg-muted, #f1f3f5)"};
  color: var(--text-secondary, #333d4b);
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  text-align: center;
`;

const TimeGroup = styled.div`
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const GroupTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: #6b7280;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 4px;

  &.good {
    color: var(--text-warn, #7a5400);
    .star {
      color: var(--border-warn, #ffc72c);
    }
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
  padding: 4px 16px;
  border: 1px solid
    ${({ $isSelected }) =>
      $isSelected ? "var(--border-brand, #0061FF)" : "transparent"};
  background: ${({ $isSelected }) =>
    $isSelected
      ? "var(--timeTable-color-available-time, rgba(59, 130, 246, 0.20))"
      : "transparent"};

  border-radius: 12px;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition: all 0.2s ease-in-out;

  &:active {
    transform: scale(0.98);
  }

  &.good {
    background: ${({ $isSelected }) =>
      $isSelected
        ? "var(--timeTable-color-available-time, rgba(59, 130, 246, 0.20))"
        : "var(--bg-warn, #FFFAEB)"};
  }
`;

const SlotLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
`;

const DayText = styled.span`
  color: var(--text-secondary, #333d4b);

  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: 24px;
  letter-spacing: -0.2px;
`;

const TimeText = styled.span`
  color: var(--text-tertiary, #8b95a1);

  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
  &.good {
    color: var(--text-secondary, #333d4b);
  }
`;

const Badge = styled.div<{ $isSelected?: boolean }>`
  display: flex;
  min-width: 52px;
  padding: 4px 8px;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  background: ${({ $isSelected }) =>
    $isSelected
      ? "var(--timeTable-color-available-time-selected, rgba(59, 130, 246, 0.50))"
      : "var(--bg-disabled, #e5e8eb)"};

  color: ${({ $isSelected }) =>
    $isSelected
      ? "var(--text-secondary, #333D4B)"
      : "var(--text-tertiary, #8b95a1)"};
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 16px;

  &.good {
    background: ${({ $isSelected }) =>
      $isSelected
        ? "var(--timeTable-color-available-time-selected, rgba(59, 130, 246, 0.50))"
        : "var(--timeTable-color-yellow, #FFE589)"};
    color: var(--text-secondary, #333d4b);
    font-size: 12px;
    font-style: normal;
    font-weight: 500;
    line-height: 16px;
  }
`;

const EmptyStateText = styled.div`
  padding: 32px 0;
  text-align: center;
  color: var(--text-tertiary, #8b95a1);
  font-size: 14px;
  font-weight: 500;
`;

const SectionTitleBottomSheet = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: var(--gray-900, #191f28);
  margin: 0 0 32px 0;
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
  padding-bottom: calc(88px + env(safe-area-inset-bottom, 0px));

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

const FloatingShareButton = styled.button`
  position: fixed;
  right: 20px;
  bottom: calc(24px + env(safe-area-inset-bottom, 0px));
  z-index: 10001;
  pointer-events: auto !important;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: var(--interactive-primary, #3b82f6);
  color: #ffffff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease-in-out;
  user-select: none;
  -webkit-tap-highlight-color: transparent;

  &:active {
    transform: scale(0.92);
  }
`;
