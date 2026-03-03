import styled from "styled-components";
import { MenuItemType, useHeader } from "@/context/HeaderContext";
import { useState, useEffect, useMemo } from "react";
import { Notice } from "@/types/notices";
import { getDepartmentNotices } from "@/apis/notices";
import Box from "@/components/common/Box";
import PostItem from "@/components/mobile/notice/PostItem";
import { putMemberDepartment } from "@/apis/members";
import findTitleOrCode from "@/utils/findTitleOrCode";
import { useLocation, useNavigate } from "react-router-dom";
import useUserStore from "@/stores/useUserStore";
import { navBarList } from "old/resource/string/navBarList";
import DepartmentNoticeSelector from "@/components/mobile/notice/DepartmentNoticeSelector";
import LoginRequiredModal from "@/components/mobile/common/LoginRequiredModal";
import { ROUTES } from "@/constants/routes";
import { Bell } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { useInfiniteQuery } from "@tanstack/react-query";

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

  // 로그인 체크
  useEffect(() => {
    setIsLoginModalOpen(!tokenInfo.accessToken);
  }, [tokenInfo.accessToken]);

  const [isDeptSelectorOpen, setIsDeptSelectorOpen] = useState(false);

  const menuItems = useMemo<MenuItemType[] | undefined>(() => {
    return userInfo.department
      ? [{ label: "학과 변경", onClick: () => setIsDeptSelectorOpen(true) }]
      : undefined;
  }, [userInfo.department]);

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
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

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
      alert("학과 변경 실패");
    }
  };

  if (!tokenInfo.accessToken) {
    return (
      <MobileDeptNoticePageWrapper>
        <LoginRequiredModal isOpen={true} />
      </MobileDeptNoticePageWrapper>
    );
  }

  if (!currentDept) return null;

  return (
    <MobileDeptNoticePageWrapper>
      <LoginRequiredModal isOpen={isLoginModalOpen} />
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
          deptNotices.map((deptNotice: Notice, index: number) => (
            <Box
              key={`${deptNotice.id || index}`}
              onClick={() => {
                if (deptNotice.url) window.open(deptNotice.url, "_blank");
              }}
            >
              <PostItem
                title={deptNotice.title}
                category={deptNotice.category}
                writer={deptNotice.writer}
                date={deptNotice.createDate}
                views={deptNotice.view}
                isEllipsis={false}
              />
            </Box>
          ))
        )}
      </TipsCardWrapper>

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

      {!hasNextPage && deptNotices.length > 0 && (
        <LoadingText>더 이상 게시물이 없습니다.</LoadingText>
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
        <FixedButtonWrapper>
          <FloatingButton onClick={() => navigate("/home/deptnotice/setting")}>
            <Bell size={18} color="white" />
            학과 공지 알림 받기
          </FloatingButton>
        </FixedButtonWrapper>
      )}
    </MobileDeptNoticePageWrapper>
  );
};

export default MobileDeptNoticePage;

const MobileDeptNoticePageWrapper = styled.div`
  width: 100%;
  position: relative;
  min-height: 100%;
`;

const TipsCardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0 16px;
  padding-bottom: 20px;
`;

const LoadingText = styled.h4`
  text-align: center;
  padding: 20px 0;
  color: #888;
  font-size: 14px;
`;

const FixedButtonWrapper = styled.div`
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  width: 100%;
  display: flex;
  justify-content: center;
  pointer-events: none;
`;

const FloatingButton = styled.button`
  pointer-events: auto;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 25px;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  white-space: nowrap;

  &:active {
    background-color: #000;
    transform: scale(0.98);
  }
`;
