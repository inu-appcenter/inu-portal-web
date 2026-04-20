import { useInfiniteQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  getDepartmentNoticeSchedules,
  getDepartmentNotices,
} from "@/apis/notices";
import { putMemberDepartment } from "@/apis/members";
import ActionButton from "@/components/common/ActionButton";
import Box from "@/components/common/Box";
import FloatingActionButton from "@/components/common/FloatingActionButton";
import ScheduleModal from "@/components/mobile/calendar/ScheduleModal";
import LoginRequiredModal from "@/components/mobile/common/LoginRequiredModal";
import DepartmentNoticeSelector from "@/components/mobile/notice/DepartmentNoticeSelector";
import PostItem from "@/components/mobile/notice/PostItem";
import { ROUTES } from "@/constants/routes";
import { MenuItemType, useHeader } from "@/context/HeaderContext";
import AI_LOGO from "@/resources/assets/calendar/챗불이요약.png";
import { navBarList } from "@/resources/strings/navBarList";
import useUserStore from "@/stores/useUserStore";
import {
  DESKTOP_CONTENT_MAX_WIDTH,
  DESKTOP_MEDIA,
  MOBILE_PAGE_GUTTER,
} from "@/styles/responsive";
import { DepartmentNotice } from "@/types/notices";
import { ScheduleEvent, toScheduleEvent } from "@/types/schedules";
import findTitleOrCode, {
  findDepartmentHomepageUrl,
} from "@/utils/findTitleOrCode";

const MobileDeptNoticePage = () => {
  const { userInfo, setUserInfo, tokenInfo } = useUserStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { ref, inView } = useInView();

  const deptParam = new URLSearchParams(location.search).get("dept");
  const currentDept = deptParam || userInfo.department;

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(
    !tokenInfo.accessToken,
  );
  const [isDeptSelectorOpen, setIsDeptSelectorOpen] = useState(false);
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

  const departmentHomepageUrl = useMemo(() => {
    return currentDept ? findDepartmentHomepageUrl(currentDept) : "";
  }, [currentDept]);

  const menuItems = useMemo<MenuItemType[] | undefined>(() => {
    const items: MenuItemType[] = [];

    if (departmentHomepageUrl) {
      items.push({
        label: "학과 홈페이지로 이동",
        onClick: () => {
          window.open(departmentHomepageUrl, "_blank", "noopener,noreferrer");
        },
      });
    }

    if (userInfo.department) {
      items.push({
        label: "학과 변경",
        onClick: () => setIsDeptSelectorOpen(true),
      });
    }

    return items.length > 0 ? items : undefined;
  }, [departmentHomepageUrl, userInfo.department]);

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
    queryKey: ["deptNotices", currentDept],
    queryFn: ({ pageParam = 1 }) => {
      const deptCode = currentDept ? findTitleOrCode(currentDept) : undefined;
      if (!deptCode) return Promise.reject("학과 정보가 없습니다.");
      return getDepartmentNotices(deptCode, "date", pageParam);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const totalPages = lastPage.data.pages;
      const currentPage = allPages.length;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: !!currentDept && !!tokenInfo.accessToken,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, inView, isFetchingNextPage]);

  const deptNotices = useMemo(() => {
    return data?.pages.flatMap((page) => page.data.contents) || [];
  }, [data]);

  const handleDepartmentClick = async (department: string) => {
    try {
      await putMemberDepartment(department);
      const deptKorean = findTitleOrCode(department);
      setUserInfo({ ...userInfo, department: deptKorean });
      setIsDeptSelectorOpen(false);
      navigate(ROUTES.BOARD.DEPT_NOTICE_DETAIL(deptKorean), { replace: true });
    } catch (error) {
      console.error(error);
      alert("학과 변경에 실패했습니다.");
    }
  };

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
            <Box key={`dept-init-skeleton-${i}`}>
              <PostItem isLoading />
            </Box>
          ))
        ) : isError ? (
          <LoadingText>데이터를 불러오는 중 오류가 발생했습니다.</LoadingText>
        ) : deptNotices.length === 0 ? (
          <LoadingText>게시물이 없습니다.</LoadingText>
        ) : (
          deptNotices.map((deptNotice: DepartmentNotice, index: number) => (
            <Box
              key={`${deptNotice.id || index}`}
              onClick={() => {
                if (deptNotice.url) window.open(deptNotice.url, "_blank");
              }}
            >
              <PostItem
                title={deptNotice.title}
                date={deptNotice.createDate}
                views={deptNotice.view}
                isEllipsis={false}
                showWriter={false}
              />
              {deptNotice.hasSchedules && (
                <CalendarActionButton
                  style={{ alignSelf: "end" }}
                  onClick={(e) => handleCalendarClick(e, deptNotice.id)}
                >
                  <img src={AI_LOGO} alt="횃불이AI" />
                  <span>
                    <strong>횃불이 AI</strong> 캘린더
                  </span>
                </CalendarActionButton>
              )}
            </Box>
          ))
        )}
      </TipsCardWrapper>

      <div ref={ref} style={{ height: "20px" }}>
        {isFetchingNextPage && (
          <TipsCardWrapper>
            <Box>
              <PostItem isLoading />
            </Box>
          </TipsCardWrapper>
        )}
      </div>

      {!hasNextPage && deptNotices.length > 0 && (
        <LoadingText>더이상 게시물이 없습니다.</LoadingText>
      )}

      {navBarList[1].child && (
        <DepartmentNoticeSelector
          departments={navBarList[1].child}
          isOpen={isDeptSelectorOpen}
          setIsOpen={setIsDeptSelectorOpen}
          handleClick={handleDepartmentClick}
        />
      )}

      {userInfo.department && (
        <FloatingActionButton
          text="공지 알리미 설정"
          icon={<Bell size={18} color="white" />}
          onClick={() => navigate(`${ROUTES.BOARD.DEPT_SETTING}?tab=dept`)}
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
  gap: 12px;
  margin: 0 ${MOBILE_PAGE_GUTTER};
  padding-top: 12px;
  padding-bottom: 20px;
  box-sizing: border-box;

  @media ${DESKTOP_MEDIA} {
    width: 100%;
    margin: 0;
    padding: 16px 0 32px;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }
`;

const LoadingText = styled.h4`
  text-align: center;
  padding: 20px 0;
  color: #888;
  font-size: 14px;
`;

const CalendarActionButton = styled(ActionButton)`
  align-self: flex-end;
  min-width: auto;
  padding: 6px 12px;
  gap: 2px;
  font-size: 12px;
  font-weight: 400;
  margin-top: 8px;
  line-height: normal;

  img {
    width: 20px;
    height: 20px;
    object-fit: contain;
  }
`;
