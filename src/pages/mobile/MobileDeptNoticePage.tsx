import styled from "styled-components";
import { MenuItemType, useHeader } from "@/context/HeaderContext";
import InfiniteScroll from "react-infinite-scroll-component";
import { useState, useEffect, useCallback } from "react"; // useCallback 추가
import { Notice } from "@/types/notices";
import { getDepartmentNotices } from "@/apis/notices";
import Box from "@/components/common/Box";
import MobileHeader from "@/containers/mobile/common/MobileHeader";
import NoticeItem from "@/components/mobile/notice/NoticeItem";
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

  // 데이터 fetch 함수
  const fetchData = useCallback(
    async (page: number, isInitial: boolean = false) => {
      if (isLoading) return; // 중복 호출 방지

      setIsLoading(true);
      try {
        const deptCode = dept ? findTitleOrCode(dept) : undefined;
        if (!deptCode) return;

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
          if (isInitial) setDeptNotices([]); // 결과가 아예 없는 경우
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

  // 학과(dept) 변경 시 초기화 및 첫 페이지 로드
  useEffect(() => {
    if (dept) {
      setHasMore(true);
      setFetchState({ lastPostId: undefined, page: 1 });
      fetchData(1, true); // 첫 페이지 호출
    }
  }, [dept]);

  const handleNext = () => {
    if (hasMore && !isLoading) {
      fetchData(fetchState.page);
    }
  };

  useEffect(() => {
    if (userInfo.department && !dept) {
      // 경로에 dept가 없을 때만 리다이렉트
      navigate(`/home/deptnotice/${userInfo.department}`, {
        replace: true,
      });
    }
  }, [userInfo.department, dept, navigate]);

  const handleDepartmentClick = async (department: string) => {
    try {
      await putMemberDepartment(department); // 학과 코드 서버 전송
      const deptKorean = findTitleOrCode(department); // 한글명 변환
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
          <InfiniteScroll
            dataLength={deptNotices.length}
            next={handleNext}
            hasMore={hasMore}
            scrollableTarget="app-scroll-view"
            loader={<LoadingText>Loading...</LoadingText>}
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
                  <NoticeItem
                    title={deptNotice.title}
                    category={deptNotice.category}
                    writer={deptNotice.writer}
                    date={deptNotice.createDate}
                  />
                </Box>
              ))}
            </TipsCardWrapper>
          </InfiniteScroll>
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
  //padding-top: 12px;
`;

const LoadingText = styled.h4`
  text-align: center;
  padding: 20px 0;
  color: #888;
`;
