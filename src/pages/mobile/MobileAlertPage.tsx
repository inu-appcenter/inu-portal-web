import styled from "styled-components";
import { MenuItemType, useHeader } from "@/context/HeaderContext";
import InfiniteScroll from "react-infinite-scroll-component";
import { useState, useEffect, useCallback, useMemo } from "react";
import Box from "@/components/common/Box";
import PostItem from "@/components/mobile/notice/PostItem";
import { getAlerts } from "@/apis/members";
import { useNavigate, useParams } from "react-router-dom";
import useUserStore from "@/stores/useUserStore";
import { Notification } from "@/types/members";
import MoreFeaturesBox from "@/components/desktop/common/MoreFeaturesBox";

interface FetchState {
  lastPostId: number | undefined;
  page: number;
}

const MobileAlertPage = () => {
  const { userInfo } = useUserStore();
  const navigate = useNavigate();
  const { dept } = useParams<{ dept: string }>();

  const [alerts, setAlerts] = useState<Notification[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchState, setFetchState] = useState<FetchState>({
    lastPostId: undefined,
    page: 1,
  });

  const menuItems = useMemo<MenuItemType[]>(
    () => [
      {
        label: "푸시 알림 설정",
        onClick: () => navigate("/home/deptnotice/setting"),
      },
    ],
    [navigate], // navigate 함수 의존성 추가
  );

  useHeader({
    title: "알림",
    hasback: true,
    menuItems,
  });

  // 데이터 요청 함수
  const fetchData = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await getAlerts(fetchState.page);
      const newNotifications: Notification[] = response.data.contents;
      console.log(fetchState.page);
      console.log(response);

      if (newNotifications && newNotifications.length > 0) {
        setAlerts((prev) => [...prev, ...newNotifications]);
        // 페이지 수 업데이트
        setFetchState((prev) => ({
          ...prev,
          page: prev.page + 1,
        }));
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("데이터 로딩 실패", error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [dept, isLoading]);

  const handleNext = () => {
    if (hasMore && !isLoading) {
      fetchData();
    }
  };

  useEffect(() => {
    if (userInfo.department && !dept) {
      navigate(`/home/deptnotice/${userInfo.department}`, {
        replace: true,
      });
    }
  }, [userInfo.department, dept, navigate]);

  return (
    <MobileDeptNoticePageWrapper>
      <TipsListContainerWrapper>
        {/* 초기 로딩 상태 처리 */}
        {alerts.length === 0 && isLoading ? (
          <TipsCardWrapper>
            {Array.from({ length: 8 }).map((_, i) => (
              <Box key={`dept-init-skeleton-${i}`}>
                <PostItem isLoading />
              </Box>
            ))}
          </TipsCardWrapper>
        ) : (
          <InfiniteScroll
            dataLength={alerts.length}
            next={handleNext}
            hasMore={hasMore}
            scrollableTarget="app-scroll-view"
            // 추가 데이터 로딩 시 하단 로더
            loader={
              <TipsCardWrapper>
                <Box>
                  <PostItem isLoading />
                </Box>
              </TipsCardWrapper>
            }
            endMessage={<LoadingText>더 이상 알림이 없습니다.</LoadingText>}
          >
            <TipsCardWrapper>
              {alerts.map((alert, index) => (
                <Box key={`${alert.title}-${index}`}>
                  <PostItem category={alert.title} title={alert.body} />
                </Box>
              ))}
            </TipsCardWrapper>
          </InfiniteScroll>
        )}
      </TipsListContainerWrapper>

      <MoreFeaturesBox
        title={"푸시알림이 오지 않나요?"}
        content={
          "핸드폰 설정에서 INTIP 앱의 알림 권한이 허용으로 되어있는지 확인해주세요!"
        }
      />
    </MobileDeptNoticePageWrapper>
  );
};

export default MobileAlertPage;

const MobileDeptNoticePageWrapper = styled.div`
  width: 100%;
`;

const TipsListContainerWrapper = styled.div`
  width: 100%;
  //padding: 0 16px;
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
