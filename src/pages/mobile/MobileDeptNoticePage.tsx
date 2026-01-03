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

const LIMIT = 8; // 페이지당 데이터 수

const MobileDeptNoticePage = () => {
  const { userInfo, setUserInfo } = useUserStore();
  const navigate = useNavigate();
  const { dept } = useParams<{ dept: string }>();

  // 상태 관리 (참조 코드와 동일한 구조)
  const [deptNotices, setDeptNotices] = useState<Notice[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [isDeptSelectorOpen, setIsDeptSelectorOpen] = useState(false);

  // 리다이렉트 로직
  useEffect(() => {
    if (userInfo.department && !dept) {
      navigate(`/home/deptnotice/${userInfo.department}`, { replace: true });
    }
  }, [userInfo.department, dept, navigate]);

  // 헤더 메뉴
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

  // 데이터 페칭 함수 (참조 코드 로직 그대로 적용)
  const fetchData = useCallback(
    async (pageNum: number, isFirst: boolean = false) => {
      // 중복 로딩 방지
      if (isLoading && !isFirst) return;

      setIsLoading(true);
      try {
        const deptCode = dept ? findTitleOrCode(dept) : undefined;
        if (!deptCode) return;

        const response = await getDepartmentNotices(deptCode, "date", pageNum);
        const newNotices: Notice[] = response.data.contents;

        if (newNotices && newNotices.length > 0) {
          setDeptNotices((prev) =>
            isFirst ? newNotices : [...prev, ...newNotices],
          );
          setPage(pageNum + 1);

          // 데이터 개수 기반 다음 페이지 유무 판별
          if (newNotices.length < LIMIT) {
            setHasMore(false);
          } else {
            setHasMore(true);
          }
        } else {
          // 데이터가 아예 없는 경우 처리
          if (isFirst) setDeptNotices([]);
          setHasMore(false);
        }
      } catch (error) {
        console.error("데이터 로드 실패", error);
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    },
    [dept], // isLoading 제거: 함수 안정성 유지 (참조 코드 방식)
  );

  // 학과 변경 시 초기화 및 첫 로드 (참조 코드 방식)
  useEffect(() => {
    if (dept) {
      const initLoad = async () => {
        setDeptNotices([]);
        setPage(1);
        setHasMore(true);

        const scrollableDiv = document.getElementById("app-scroll-view");
        if (scrollableDiv) scrollableDiv.scrollTop = 0;

        await fetchData(1, true);
      };
      initLoad();
    }
  }, [dept, fetchData]);

  // 학과 변경 처리
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
      <InfiniteScroll
        key={dept} // 학과 변경 시 컴포넌트 리셋을 위해 key 추가
        dataLength={deptNotices.length}
        next={() => fetchData(page)} // 현재 page 상태를 인자로 전달
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
          {/* 초기 로딩 스켈레톤 */}
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
