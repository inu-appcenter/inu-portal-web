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

// 서버에서 보내주는 페이지당 데이터 개수
const LIMIT = 8;

interface FetchState {
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
    page: 1,
  });
  const [isDeptSelectorOpen, setIsDeptSelectorOpen] = useState(false);

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

  // 데이터 요청 함수
  const fetchData = useCallback(
    async (page: number, isInitial: boolean = false) => {
      // 초기화 요청이 아닐 때만 중복 방지 가드 작동
      if (isLoading && !isInitial) return;

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
          setFetchState({ page: page + 1 });

          // 데이터 개수가 LIMIT 미만이면 더 이상 데이터 없음
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

  // 학과 변경 시 상태 초기화 및 첫 데이터 요청
  useEffect(() => {
    if (dept) {
      setDeptNotices([]);
      setHasMore(true);
      setFetchState({ page: 1 });

      const scrollableDiv = document.getElementById("app-scroll-view");
      if (scrollableDiv) scrollableDiv.scrollTop = 0;

      fetchData(1, true);
    }
  }, [dept]);

  // 무한 스크롤 핸들러
  const handleNext = () => {
    fetchData(fetchState.page);
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
    <MobileDeptNoticePageWrapper>
      <TipsListContainerWrapper>
        {/* 초기 로딩: 데이터가 없고 로딩 중일 때만 스켈레톤 노출 */}
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
            // 추가 데이터 로딩 시에만 하단 스켈레톤 노출
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
`;

const LoadingText = styled.h4`
  text-align: center;
  padding: 20px 0;
  color: #888;
  font-size: 14px;
`;
