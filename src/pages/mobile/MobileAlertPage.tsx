import styled from "styled-components";
import { MenuItemType, useHeader } from "@/context/HeaderContext";
import { useEffect, useMemo } from "react";
import Box from "@/components/common/Box";
import PostItem from "@/components/mobile/notice/PostItem";
import { getAlerts } from "@/apis/members";
import { useNavigate } from "react-router-dom";
import { Notification } from "@/types/members";
import MoreFeaturesBox from "@/components/desktop/common/MoreFeaturesBox";
import { ROUTES } from "@/constants/routes";
import { useInView } from "react-intersection-observer";
import { useInfiniteQuery } from "@tanstack/react-query";

const MobileAlertPage = () => {
  const navigate = useNavigate();
  const { ref, inView } = useInView();

  const menuItems = useMemo<MenuItemType[]>(
    () => [
      {
        label: "푸시 알림 설정",
        onClick: () => navigate(ROUTES.BOARD.DEPT_SETTING),
      },
    ],
    [navigate],
  );

  useHeader({
    title: "알림",
    hasback: true,
    menuItems,
  });

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
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const alerts = useMemo(() => {
    return data?.pages.flatMap((page) => page.data.contents) || [];
  }, [data]);

  return (
    <MobileAlertPageWrapper>
      <TipsListContainerWrapper>
        {isLoading && alerts.length === 0 ? (
          <TipsCardWrapper>
            {Array.from({ length: 8 }).map((_, i) => (
              <Box key={`alert-init-skeleton-${i}`}>
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
              <Box
                key={`${alert.fcmMessageId || index}`}
                onClick={() => {
                  if (alert.type === "DEPARTMENT") {
                    navigate(ROUTES.BOARD.DEPT_NOTICE);
                  }
                }}
              >
                <PostItem
                  title={alert.title}
                  content={alert.body}
                  date={alert.createDate}
                  isEllipsis={false}
                />
              </Box>
            ))}
          </TipsCardWrapper>
        )}
      </TipsListContainerWrapper>

      {/* 무한 스크롤 트리거 */}
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
        title={"푸시알림이 오지 않나요?"}
        content={
          "핸드폰 설정에서 INTIP 앱의 알림 권한이 허용으로 되어있는지 확인해주세요!"
        }
      />
    </MobileAlertPageWrapper>
  );
};

export default MobileAlertPage;

const MobileAlertPageWrapper = styled.div`
  width: 100%;
`;

const TipsListContainerWrapper = styled.div`
  width: 100%;
  box-sizing: border-box;
`;

const TipsCardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 4px 16px;
`;

const LoadingText = styled.h4`
  text-align: center;
  padding: 20px 0;
  color: #888;
  font-size: 14px;
`;
