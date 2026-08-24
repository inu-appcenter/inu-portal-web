import { useInfiniteQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  getDepartmentNoticeSchedules,
  getSchoolDepartmentNotices,
} from "@/apis/notices";
import FloatingActionButton from "@/components/common/FloatingActionButton";
import ScheduleModal from "@/components/mobile/calendar/ScheduleModal";
import LoginRequiredModal from "@/components/mobile/common/LoginRequiredModal";
import DeptNoticeItem from "@/components/mobile/notice/DeptNoticeItem";
import { ROUTES } from "@/constants/routes";
import { MenuItemType, useHeader } from "@/context/HeaderContext";
import useUserStore from "@/stores/useUserStore";
import {
  DESKTOP_CONTENT_MAX_WIDTH,
  DESKTOP_MEDIA,
} from "@/styles/responsive";
import { DepartmentNotice } from "@/types/notices";
import { ScheduleEvent, toScheduleEvent } from "@/types/schedules";
import { mixpanelTrack } from "@/utils/mixpanel";

const MobileDeptNoticePage = () => {
  const { userInfo, tokenInfo } = useUserStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { ref, inView } = useInView();

  const deptParam = new URLSearchParams(location.search).get("dept");
  const currentDept = deptParam || userInfo.department;

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(
    !tokenInfo.accessToken,
  );
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedDepartmentNoticeId, setSelectedDepartmentNoticeId] = useState<
    number | null
  >(null);
  const [selectedSchedules, setSelectedSchedules] = useState<ScheduleEvent[]>(
    [],
  );
  const [isScheduleLoading, setIsScheduleLoading] = useState(false);

  const handleCalendarClick = (
    e: React.MouseEvent,
    departmentNoticeId: number,
  ) => {
    e.stopPropagation();
    setSelectedDepartmentNoticeId(departmentNoticeId);
    setIsScheduleModalOpen(true);
    // 믹스패널 트래킹: 학과 공지에서 일정 모달 열림
    mixpanelTrack.scheduleModalViewed("Dept Notice", 1);
  };

  const handleScheduleModalOpenChange = (open: boolean) => {
    setIsScheduleModalOpen(open);

    if (!open) {
      setSelectedDepartmentNoticeId(null);
      setSelectedSchedules([]);
      setIsScheduleLoading(false);
    }
  };

  useEffect(() => {
    setIsLoginModalOpen(!tokenInfo.accessToken);
  }, [tokenInfo.accessToken]);

  useEffect(() => {
    if (
      tokenInfo.accessToken &&
      userInfo.id !== 0 &&
      !userInfo.department &&
      !deptParam
    ) {
      alert("학과 정보가 없습니다. 프로필 설정에서 학과 정보를 입력해 주세요.");
      navigate(ROUTES.MYPAGE.ROOT);
    }
  }, [
    deptParam,
    navigate,
    tokenInfo.accessToken,
    userInfo.department,
    userInfo.id,
  ]);

  useEffect(() => {
    if (!isScheduleModalOpen || selectedDepartmentNoticeId == null) {
      return;
    }

    let isIgnored = false;

    const fetchSchedules = async () => {
      setIsScheduleLoading(true);

      try {
        const response = await getDepartmentNoticeSchedules(
          selectedDepartmentNoticeId,
        );

        if (!isIgnored) {
          setSelectedSchedules(
            response.data.map((schedule) => toScheduleEvent(schedule, "dept")),
          );
        }
      } catch (error) {
        console.error("학과 공지 연결 일정을 불러오지 못했습니다.", error);

        if (!isIgnored) {
          setSelectedSchedules([]);
        }
      } finally {
        if (!isIgnored) {
          setIsScheduleLoading(false);
        }
      }
    };

    fetchSchedules();

    return () => {
      isIgnored = true;
    };
  }, [isScheduleModalOpen, selectedDepartmentNoticeId]);

  const menuItems = useMemo<MenuItemType[] | undefined>(() => {
    return undefined;
  }, []);

  useHeader({
    title: currentDept ? `${currentDept} 공지사항` : "학과 공지사항",
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
    queryKey: ["deptNotices", userInfo.departmentCode],
    queryFn: ({ pageParam = 1 }) => {
      if (!userInfo.departmentCode) return Promise.reject("학과 정보가 없습니다.");
      return getSchoolDepartmentNotices(userInfo.departmentCode, "date", pageParam);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const totalPages = lastPage.data.pages;
      const currentPage = allPages.length;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: !!userInfo.departmentCode && !!tokenInfo.accessToken,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, inView, isFetchingNextPage]);

  const deptNotices = useMemo(() => {
    return data?.pages.flatMap((page) => page.data.contents) || [];
  }, [data]);

  if (!tokenInfo.accessToken) {
    return (
      <MobileDeptNoticePageWrapper>
        <LoginRequiredModal isOpen />
      </MobileDeptNoticePageWrapper>
    );
  }

  if (!currentDept) return null;

  return (
    <MobileDeptNoticePageWrapper>
      <LoginRequiredModal isOpen={isLoginModalOpen} />
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onOpenChange={handleScheduleModalOpenChange}
        events={selectedSchedules}
        isLoading={isScheduleLoading}
      />

      <TipsCardWrapper>
        {isLoading && deptNotices.length === 0 ? (
          Array.from({ length: 8 }).map((_, i) => (
            <DeptNoticeItem key={`dept-init-skeleton-${i}`} isLoading />
          ))
        ) : isError ? (
          <LoadingText>데이터를 불러오는 중 오류가 발생했습니다.</LoadingText>
        ) : deptNotices.length === 0 ? (
          <LoadingText>게시물이 없습니다.</LoadingText>
        ) : (
          deptNotices.map((deptNotice: DepartmentNotice, index: number) => (
            <DeptNoticeItem
              key={`${deptNotice.id || index}`}
              title={deptNotice.title}
              date={deptNotice.createDate}
              views={deptNotice.view}
              hasSchedules={deptNotice.hasSchedules}
              onCalendarClick={(e) => {
                mixpanelTrack.featureClicked(
                  "Dept AI Calendar",
                  "Dept Notice List",
                );
                handleCalendarClick(e, deptNotice.id);
              }}
              onClick={() => {
                mixpanelTrack.deptNoticeViewed(currentDept, deptNotice.title);
                if (deptNotice.url) window.open(deptNotice.url, "_blank");
              }}
            />
          ))
        )}
      </TipsCardWrapper>

      <div ref={ref} style={{ height: "20px" }}>
        {isFetchingNextPage && (
          <TipsCardWrapper>
            <DeptNoticeItem isLoading />
          </TipsCardWrapper>
        )}
      </div>

      {!hasNextPage && deptNotices.length > 0 && (
        <LoadingText>더이상 게시물이 없습니다.</LoadingText>
      )}

      {userInfo.department && (
        <FloatingActionButton
          text="공지 알리미 설정"
          icon={<Bell size={20} color="var(--text-secondary, #333d4b)" />}
          onClick={() => {
            mixpanelTrack.notificationSettingsOpened(
              "Department Notice Page",
              "dept",
            );
            navigate(`${ROUTES.BOARD.DEPT_SETTING}?tab=dept`);
          }}
          bottom="40px"
        />
      )}
    </MobileDeptNoticePageWrapper>
  );
};

export default MobileDeptNoticePage;

const MobileDeptNoticePageWrapper = styled.div`
  width: 100%;
  position: relative;
  min-height: 100%;

  @media ${DESKTOP_MEDIA} {
    width: min(100%, ${DESKTOP_CONTENT_MAX_WIDTH});
    margin: 0 auto;
  }
`;

const TipsCardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 0;
  padding: 0 0 20px 0;
  box-sizing: border-box;

  @media ${DESKTOP_MEDIA} {
    width: 100%;
    margin: 0;
    padding: 0 0 32px;
  }
`;

const LoadingText = styled.h4`
  text-align: center;
  padding: 20px 0;
  color: #888;
  font-size: 14px;
`;
