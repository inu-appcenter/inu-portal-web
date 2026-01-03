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

// 페이지당 데이터 개수 상수
const LIMIT = 8;

const MobileDeptNoticePage = () => {
  const { userInfo, setUserInfo } = useUserStore();
  const navigate = useNavigate();
  const { dept } = useParams<{ dept: string }>();

  // 데이터 관련 상태
  const [deptNotices, setDeptNotices] = useState<Notice[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [isDeptSelectorOpen, setIsDeptSelectorOpen] = useState(false);

  // 헤더 메뉴 설정
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

  // 공통 데이터 페칭 함수
  const fetchData = useCallback(
    async (targetPage: number, isInitial: boolean = false) => {
      // 로딩 중 중복 방지
      if (isLoading) return;

      setIsLoading(true);
      try {
        const deptCode = dept ? findTitleOrCode(dept) : undefined;
        if (!deptCode) return;

        const response = await getDepartmentNotices(
          deptCode,
          "date",
          targetPage,
        );
        const newNotices: Notice[] = response.data.contents;

        if (newNotices && newNotices.length > 0) {
          setDeptNotices((prev) =>
            isInitial ? newNotices : [...prev, ...newNotices],
          );
          setPage(targetPage + 1);
          // 획득 데이터 수 기반 추가 로드 가능 여부 판단
          setHasMore(newNotices.length >= LIMIT);
        } else {
          if (isInitial) setDeptNotices([]);
          setHasMore(false);
        }
      } catch (error) {
        console.error("데이터 로딩 실패", error);
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    },
    [dept, isLoading],
  );

  // 학과 변경 감지 및 초기화
  useEffect(() => {
    if (dept) {
      setPage(1);
      setHasMore(true);
      // 스크롤 최상단 초기화
      const scrollableDiv = document.getElementById("app-scroll-view");
      if (scrollableDiv) scrollableDiv.scrollTop = 0;

      fetchData(1, true);
    }
  }, [dept]);

  // 다음 페이지 로드 핸들러
  const handleNext = () => {
    if (!isLoading && hasMore) {
      fetchData(page);
    }
  };

  // 학과 리다이렉트 처리
  useEffect(() => {
    if (userInfo.department && !dept) {
      navigate(`/home/deptnotice/${userInfo.department}`, { replace: true });
    }
  }, [userInfo.department, dept, navigate]);

  // 학과 변경 선택 처리
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

  return (
    <MobileDeptNoticePageWrapper>
      <TipsListContainerWrapper>
        {/* 초기 로딩 스켈레톤 UI */}
        {deptNotices.length === 0 && isLoading ? (
          <TipsCardWrapper>
            {Array.from({ length: LIMIT }).map((_, i) => (
              <Box key={`dept-init-skeleton-${i}`}>
                <PostItem isLoading />
              </Box>
            ))}
          </TipsCardWrapper>
        ) : (
          <InfiniteScroll
            dataLength={deptNotices.length}
            next={handleNext}
            hasMore={hasMore}
            scrollableTarget="app-scroll-view" // 레이아웃 스크롤 영역 참조
            loader={
              <div style={{ marginTop: "12px" }}>
                <Box>
                  <PostItem isLoading />
                </Box>
              </div>
            }
            endMessage={
              <LoadingText>모든 공지사항을 확인했습니다.</LoadingText>
            }
          >
            <TipsCardWrapper>
              {deptNotices.map((deptNotice, index) => (
                <Box
                  key={`${deptNotice.title}-${index}`}
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
      </TipsListContainerWrapper>

      {/* 학과 선택 모달 */}
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

/* 스타일 정의 */
const MobileDeptNoticePageWrapper = styled.div`
  width: 100%;
`;

const TipsListContainerWrapper = styled.div`
  width: 100%;
  padding: 0 16px;
  box-sizing: border-box;
`;

const TipsCardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 20px;
`;

const LoadingText = styled.h4`
  text-align: center;
  padding: 20px 0;
  color: #888;
  font-size: 14px;
`;
