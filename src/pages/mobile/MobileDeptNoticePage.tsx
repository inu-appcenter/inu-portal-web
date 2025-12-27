import styled from "styled-components";
import { MenuItemType, useHeader } from "@/context/HeaderContext";
import InfiniteScroll from "react-infinite-scroll-component";
import { useState, useEffect, useCallback } from "react";
import { Notice } from "@/types/notices";
import { getDepartmentNotices } from "@/apis/notices";
import Box from "@/components/common/Box";
import MobileHeader from "@/containers/mobile/common/MobileHeader";
import PostItem from "@/components/mobile/notice/PostItem";
import { putMemberDepartment } from "@/apis/members";
import findTitleOrCode from "@/utils/findTitleOrCode";
import { useNavigate, useParams } from "react-router-dom";
import useUserStore from "@/stores/useUserStore";
import { navBarList } from "old/resource/string/navBarList";
import DepartmentNoticeSelector from "@/components/mobile/notice/DepartmentNoticeSelector";

interface FetchState {
  lastPostId: number | undefined;
  page: number;
}

const MobileDeptNoticePage = () => {
  const { userInfo, setUserInfo } = useUserStore();
  const navigate = useNavigate();
  const { dept } = useParams<{ dept: string }>();

  const [deptNotices, setDeptNotices] = useState<Notice[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchState, setFetchState] = useState<FetchState>({
    lastPostId: undefined,
    page: 1,
  });
  const [isDeptSelectorOpen, setIsDeptSelectorOpen] = useState(false);

  const menuItems: MenuItemType[] | undefined = userInfo.department
    ? [
        { label: "학과 변경", onClick: () => setIsDeptSelectorOpen(true) },
        {
          label: "푸시 알림 설정",
          onClick: () => navigate("/home/deptnotice/setting"),
        },
      ]
    : undefined;

  useHeader({
    title: dept ? `${dept} 공지사항` : "학과 공지사항",
    hasback: true,
    menuItems,
  });

  // 데이터 요청 함수
  const fetchData = useCallback(
    async (page: number, isInitial: boolean = false) => {
      if (isLoading) return;

      setIsLoading(true);
      try {
        const deptCode = dept ? findTitleOrCode(dept) : undefined;
        if (!deptCode) {
          alert("학과 정보가 없어요");
          return;
        }

        const response = await getDepartmentNotices(deptCode, "date", page);
        const newNotices: Notice[] = response.data.contents;

        if (newNotices && newNotices.length > 0) {
          setDeptNotices((prev) =>
            isInitial ? newNotices : [...prev, ...newNotices],
          );
          setFetchState((prev) => ({
            ...prev,
            page: page + 1,
          }));
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

  // 학과 변경 시 데이터 초기화 및 재요청
  useEffect(() => {
    if (dept) {
      setDeptNotices([]); // 기존 데이터 제거로 스켈레톤 유도
      setHasMore(true);
      setFetchState({ lastPostId: undefined, page: 1 });
      fetchData(1, true);
    }
  }, [dept]);

  const handleNext = () => {
    if (hasMore && !isLoading) {
      fetchData(fetchState.page);
    }
  };

  useEffect(() => {
    if (userInfo.department && !dept) {
      navigate(`/home/deptnotice/${userInfo.department}`, {
        replace: true,
      });
    }
  }, [userInfo.department, dept, navigate]);

  const handleDepartmentClick = async (department: string) => {
    try {
      await putMemberDepartment(department);
      const deptKorean = findTitleOrCode(department);
      setUserInfo({
        ...userInfo,
        department: deptKorean,
      });
      setIsDeptSelectorOpen(false);
      navigate(`/home/deptnotice/${deptKorean}`, { replace: true });
    } catch (error) {
      console.error(error);
      alert("학과 변경을 실패했습니다.");
    }
  };

  return (
    <>
      <MobileHeader />
      <MobileDeptNoticePageWrapper>
        <TipsListContainerWrapper>
          {/* 초기 로딩 상태 처리 */}
          {deptNotices.length === 0 && isLoading ? (
            <TipsCardWrapper>
              {Array.from({ length: 8 }).map((_, i) => (
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
              scrollableTarget="app-scroll-view"
              // 추가 데이터 로딩 시 하단 로더
              loader={
                <div style={{ marginTop: "12px" }}>
                  <Box>
                    <PostItem isLoading />
                  </Box>
                </div>
              }
              endMessage={<LoadingText>더 이상 게시물이 없습니다.</LoadingText>}
            >
              <TipsCardWrapper>
                {deptNotices.map((deptNotice, index) => (
                  <Box
                    key={`${deptNotice.title}-${index}`}
                    onClick={() => {
                      window.open(deptNotice.url, "_blank");
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

        {navBarList[1].child && (
          <DepartmentNoticeSelector
            departments={navBarList[1].child}
            isOpen={isDeptSelectorOpen}
            setIsOpen={setIsDeptSelectorOpen}
            handleClick={handleDepartmentClick}
          />
        )}
      </MobileDeptNoticePageWrapper>
    </>
  );
};

export default MobileDeptNoticePage;

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
  padding-top: 12px;
`;

const LoadingText = styled.h4`
  text-align: center;
  padding: 20px 0;
  color: #888;
  font-size: 14px;
`;
