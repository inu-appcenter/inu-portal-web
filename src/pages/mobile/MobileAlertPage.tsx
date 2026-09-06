import styled from "styled-components";
import { MenuItemType, useHeader } from "@/context/HeaderContext";
import { useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";

import Box from "@/components/common/Box";
import MoreFeaturesBox from "@/components/desktop/common/MoreFeaturesBox";
import PostItem from "@/components/mobile/notice/PostItem";
import { getAlerts, readNotification } from "@/apis/members";
import { ROUTES } from "@/constants/routes";
import useUserStore from "@/stores/useUserStore";
import { Notification } from "@/types/members";
import { mixpanelTrack } from "@/utils/mixpanel";
import notificationCategory from "@/resources/strings/notificationCategory";
import { formatTimeAgo } from "@/utils/date";
import { resolveNotificationTarget } from "@/utils/notificationTarget";
import { UNREAD_NOTIFICATION_QUERY_KEY } from "@/hooks/useUnreadNotification";

function getStoredAccessToken() {
  const storedTokenInfo = localStorage.getItem("tokenInfo");

  if (!storedTokenInfo) {
    return "";
  }

  try {
    const parsedTokenInfo = JSON.parse(storedTokenInfo) as {
      accessToken?: string;
    };

    return parsedTokenInfo.accessToken ?? "";
  } catch (error) {
    console.error("Failed to parse stored tokenInfo", error);
    return "";
  }
}

const MobileAlertPage = () => {
  const { tokenInfo } = useUserStore();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { ref, inView } = useInView();
  const hasShownLoginConfirmRef = useRef(false);

  const isLoggedIn =
    Boolean(tokenInfo.accessToken) || Boolean(getStoredAccessToken());

  const handleAlertClick = async (alert: Notification) => {
    const notificationId = alert.fcmMessageId || alert.memberFcmMessageId;
    if (notificationId) {
      mixpanelTrack.notificationClicked({
        notification_id: String(notificationId),
        notification_type: alert.type,
        source: "inbox",
        target_screen: alert.path || alert.type,
        target_id: alert.targetId,
        clicked_at: new Date().toISOString(),
      });
    }

    if (alert.memberFcmMessageId && !alert.isRead) {
      try {
        await readNotification(alert.memberFcmMessageId);
        void queryClient.invalidateQueries({ queryKey: UNREAD_NOTIFICATION_QUERY_KEY });
        void queryClient.invalidateQueries({ queryKey: ["alerts"] });
      } catch (e) {
        console.error("Failed to mark notification as read", e);
      }
    }

    // 서버가 내려준 path가 곧 시스템 알림을 눌렀을 때 가는 곳이다. 두 경로가
    // 갈라지지 않도록 이 값을 먼저 쓰고, 값이 없는 알림만 type으로 폴백한다.
    const target = resolveNotificationTarget(alert.path);

    if (target?.kind === "internal") {
      navigate(target.path);
      return;
    }

    if (target?.kind === "external") {
      window.open(target.url, "_blank", "noopener,noreferrer");
      return;
    }

    if (alert.type === "DEPARTMENT") {
      navigate(ROUTES.BOARD.DEPT_NOTICE);
    } else if (alert.type === "SCHOOL_NOTICE") {
      navigate(ROUTES.BOARD.NOTICE);
    } else if (alert.type === "CHAT") {
      if (alert.targetId) {
        navigate(`${ROUTES.CHAT.ROOT}/${alert.targetId}`);
      } else {
        navigate(ROUTES.CHAT.LIST);
      }
    } else if (alert.type === "FRIEND") {
      navigate(ROUTES.FRIEND.LIST);
    } else if (alert.type === "DAILY_BRIEF_TIMETABLE") {
      navigate(ROUTES.TIMETABLE.ROOT);
    } else if (alert.type === "DAILY_BRIEF_SCHEDULE") {
      navigate(ROUTES.BOARD.CALENDAR);
    }
  };

  const menuItems = useMemo<MenuItemType[]>(
    () => [
      {
        label: "알림 설정",
        onClick: () => {
          mixpanelTrack.notificationSettingsOpened("Alert Page Menu");
          navigate(ROUTES.MYPAGE.NOTIFICATION);
        },
      },
    ],
    [navigate],
  );

  useHeader({
    title: "알림",
    hasback: true,
    menuItems,
  });

  useEffect(() => {
    if (isLoggedIn || hasShownLoginConfirmRef.current) {
      return;
    }

    hasShownLoginConfirmRef.current = true;

    const shouldMoveLoginPage = window.confirm(
      "로그인 후 알림을 볼 수 있어요. 로그인 페이지로 이동할까요?",
    );

    if (shouldMoveLoginPage) {
      const redirectPath = `${location.pathname}${location.search}${location.hash}`;

      navigate(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(redirectPath)}`, {
        replace: true,
      });
      return;
    }

    navigate(ROUTES.HOME, { replace: true });
  }, [isLoggedIn, location.hash, location.pathname, location.search, navigate]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["alerts"],
    queryFn: ({ pageParam = 1 }) => getAlerts(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const totalPages = lastPage.data.pages;
      const currentPage = allPages.length;

      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: isLoggedIn,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const alerts = useMemo(() => {
    return data?.pages.flatMap((page) => page.data.contents) || [];
  }, [data]);

  if (!isLoggedIn) {
    return null;
  }

  return (
    <MobileAlertPageWrapper>
      <TipsListContainerWrapper>
        {isLoading && alerts.length === 0 ? (
          <TipsCardWrapper>
            {Array.from({ length: 8 }).map((_, index) => (
              <Box key={`alert-init-skeleton-${index}`}>
                <PostItem isLoading />
              </Box>
            ))}
          </TipsCardWrapper>
        ) : isError ? (
          <LoadingText>데이터를 불러오는 중 오류가 발생했습니다.</LoadingText>
        ) : alerts.length === 0 ? (
          <LoadingText>알림이 없습니다.</LoadingText>
        ) : (
          <TipsCardWrapper>
            {alerts.map((alert: Notification, index: number) => (
              <AlertItemBox
                key={`${alert.memberFcmMessageId || alert.fcmMessageId || index}`}
                $isRead={Boolean(alert.isRead)}
                onClick={() => void handleAlertClick(alert)}
              >
                <Box>
                  <PostItem
                    category={notificationCategory[alert.type] || alert.type}
                    title={alert.title}
                    content={alert.body}
                    date={formatTimeAgo(alert.createDate)}
                    isEllipsis={false}
                  />
                </Box>
              </AlertItemBox>
            ))}
          </TipsCardWrapper>
        )}
      </TipsListContainerWrapper>

      <div ref={ref} style={{ height: "20px" }}>
        {isFetchingNextPage && (
          <TipsCardWrapper>
            <Box>
              <PostItem isLoading />
            </Box>
          </TipsCardWrapper>
        )}
      </div>

      {!hasNextPage && alerts.length > 0 && (
        <LoadingText>더 이상 알림이 없습니다.</LoadingText>
      )}

      <MoreFeaturesBox
        title="푸시 알림이 오지 않나요?"
        content="휴대폰 설정에서 INTIP 앱의 알림 권한이 허용되어 있는지 확인해 주세요!"
      />
    </MobileAlertPageWrapper>
  );
};

export default MobileAlertPage;

const MobileAlertPageWrapper = styled.div`
  width: 100%;
  padding: 0 16px;
`;

const TipsListContainerWrapper = styled.div`
  width: 100%;
  box-sizing: border-box;
`;

const TipsCardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 4px 0;
`;

const LoadingText = styled.h4`
  text-align: center;
  padding: 20px 0;
  color: #888;
  font-size: 14px;
`;

const AlertItemBox = styled.div<{ $isRead?: boolean }>`
  width: 100%;
  opacity: ${({ $isRead }) => ($isRead ? 0.55 : 1)};
  transition: opacity 0.2s ease;
`;
