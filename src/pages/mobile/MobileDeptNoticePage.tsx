import styled from "styled-components";
import { MenuItemType, useHeader } from "@/context/HeaderContext";
import InfiniteScroll from "react-infinite-scroll-component";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Notice } from "@/types/notices";
import { getDepartmentNotices } from "@/apis/notices";
import Box from "@/components/common/Box";
import PostItem from "@/components/mobile/notice/PostItem";
import { putMemberDepartment } from "@/apis/members";
import findTitleOrCode from "@/utils/findTitleOrCode";
import { useNavigate, useParams } from "react-router-dom";
import useUserStore from "@/stores/useUserStore";
import { navBarList } from "old/resource/string/navBarList";
import DepartmentNoticeSelector from "@/components/mobile/notice/DepartmentNoticeSelector";

const LIMIT = 8;

const MobileDeptNoticePage = () => {
  const { userInfo, setUserInfo } = useUserStore();
  const navigate = useNavigate();
  const { dept } = useParams<{ dept: string }>();

  const [deptNotices, setDeptNotices] = useState<Notice[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeptSelectorOpen, setIsDeptSelectorOpen] = useState(false);

  // 핵심: DOM 바인딩 타이밍 문제 해결을 위한 상태
  const [isReady, setIsReady] = useState(false);

  // 리다이렉트 로직
  useEffect(() => {
    if (userInfo.department && !dept) {
      navigate(`/home/deptnotice/${userInfo.department}`, { replace: true });
    }
  }, [userInfo.department, dept, navigate]);

  const menuItems = useMemo<MenuItemType[] | undefined>(() => {
    return userInfo.department
      ? [
          { label: "학과 변경", onClick: () => setIsDeptSelectorOpen(true) },
          {
            label: "푸시 알림 설정",
            onClick: () => navigate("/home/deptnotice/setting"),
          },
        ]
      : undefined;
  }, [userInfo.department, navigate]);

  useHeader({
    title: dept ? `${dept} 공지사항` : "학과 공지사항",
    hasback: true,
    menuItems,
  });

  const fetchData = useCallback(
    async (pageNum: number, isInitial: boolean = false) => {
      if (isLoading && !isInitial) return;

      setIsLoading(true);
      try {
        const deptCode = dept ? findTitleOrCode(dept) : undefined;
        if (!deptCode) return;

        const response = await getDepartmentNotices(deptCode, "date", pageNum);
        const newNotices: Notice[] = response.data.contents;

        if (newNotices && newNotices.length > 0) {
          setDeptNotices((prev) =>
            isInitial ? newNotices : [...prev, ...newNotices],
          );
          setPage(pageNum + 1);
          if (newNotices.length < LIMIT) {
            setHasMore(false);
          } else {
            setHasMore(true);
          }
        } else {
          if (isInitial) setDeptNotices([]);
          setHasMore(false);
        }
      } catch (error) {
        console.error("데이터 로드 실패", error);
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    },
    [dept],
  );

  useEffect(() => {
    if (dept) {
      // 1. 상태 초기화
      setDeptNotices([]);
      setPage(1);
      setHasMore(true);
      setIsReady(false); // InfiniteScroll 언마운트

      const scrollableDiv = document.getElementById("app-scroll-view");
      if (scrollableDiv) scrollableDiv.scrollTop = 0;

      // 2. 데이터 로드 시작
      fetchData(1, true);

      // 3. 약간의 지연 후 InfiniteScroll 마운트 (DOM 바인딩 보장)
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [dept, fetchData]);

  const handleDepartmentClick = async (department: string) => {
    try {
      await putMemberDepartment(department);
      const deptKorean = findTitleOrCode(department);
      setUserInfo({ ...userInfo, department: deptKorean });
      setIsDeptSelectorOpen(false);
      navigate(`/home/deptnotice/${deptKorean}`, { replace: true });
    } catch (error) {
      console.error(error);
      alert("학과 변경 실패");
    }
  };

  if (!dept) return null;

  return (
    <MobileDeptNoticePageWrapper>
      {/* isReady가 true일 때만 렌더링하여 DOM id='app-scroll-view'를 확실히 찾게 함 */}
      {isReady && (
        <InfiniteScroll
          key={dept} // key를 변경하여 컴포넌트 재생성 강제
          dataLength={deptNotices.length}
          next={() => fetchData(page)}
          hasMore={hasMore}
          scrollableTarget="app-scroll-view"
          loader={
            <TipsCardWrapper>
              <Box>
                <PostItem isLoading />
              </Box>
            </TipsCardWrapper>
          }
          endMessage={<LoadingText>더 이상 게시물이 없습니다.</LoadingText>}
        >
          <TipsCardWrapper>
            {deptNotices.length === 0 && isLoading
              ? Array.from({ length: LIMIT }).map((_, i) => (
                  <Box key={`dept-init-skeleton-${i}`}>
                    <PostItem isLoading />
                  </Box>
                ))
              : deptNotices.map((deptNotice, index) => (
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
                    />
                  </Box>
                ))}
          </TipsCardWrapper>
        </InfiniteScroll>
      )}

      {/* 로딩 중이거나 준비 전일 때 스켈레톤만 먼저 보여줘서 깜빡임 방지 */}
      {!isReady && (
        <TipsCardWrapper>
          {Array.from({ length: LIMIT }).map((_, i) => (
            <Box key={`skeleton-placeholder-${i}`}>
              <PostItem isLoading />
            </Box>
          ))}
        </TipsCardWrapper>
      )}

      {navBarList[1].child && (
        <DepartmentNoticeSelector
          departments={navBarList[1].child}
          isOpen={isDeptSelectorOpen}
          setIsOpen={setIsDeptSelectorOpen}
          handleClick={handleDepartmentClick}
        />
      )}
    </MobileDeptNoticePageWrapper>
  );
};

export default MobileDeptNoticePage;

const MobileDeptNoticePageWrapper = styled.div`
  width: 100%;
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
