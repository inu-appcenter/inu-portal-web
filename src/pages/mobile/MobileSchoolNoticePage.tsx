import styled from "styled-components";
import { useHeader } from "@/context/HeaderContext";
import CategorySelectorNew from "@/components/mobile/common/CategorySelectorNew";
import InfiniteScroll from "react-infinite-scroll-component";
import { useEffect, useState, useCallback } from "react";
import { Notice } from "@/types/notices";
import { getNotices } from "@/apis/notices";
import Box from "@/components/common/Box";
import MobileHeader from "@/containers/mobile/common/MobileHeader";
import NoticeItem from "@/components/mobile/notice/NoticeItem";
import { getSchoolNoticeCategories } from "@/apis/categories";

const MobileSchoolNoticePage = () => {
  useHeader({
    title: "학과 공지사항",
    hasback: true,
  });

  const [notices, setNotices] = useState<Notice[]>([]);
  const [categoryList, setCategoryList] = useState<string[]>([]);
  const params = new URLSearchParams(location.search);
  const selectedCategory = params.get("category") || "전체";

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // 데이터 요청 함수
  const fetchData = useCallback(
    async (pageNum: number, isFirst: boolean = false) => {
      if (isLoading) return;
      setIsLoading(true);
      try {
        const response = await getNotices(selectedCategory, "date", pageNum);
        const newNotices: Notice[] = response.data.contents;

        if (newNotices && newNotices.length > 0) {
          setNotices((prev) =>
            isFirst ? newNotices : [...prev, ...newNotices],
          );
          setPage(pageNum + 1);
        } else {
          setHasMore(false);
        }
      } catch (error) {
        console.error("데이터 로드 실패", error);
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedCategory, isLoading],
  );

  useEffect(() => {
    const fetchData = async () => {
      const response = await getSchoolNoticeCategories();
      setCategoryList(["전체", ...response.data]);
    };

    fetchData();
  }, []);

  // 카테고리 변경 시 초기화
  useEffect(() => {
    const initLoad = async () => {
      setNotices([]);
      setPage(1);
      setHasMore(true);

      // 스크롤 상단 이동
      const scrollableDiv = document.getElementById("app-scroll-view");
      if (scrollableDiv) scrollableDiv.scrollTop = 0;

      await fetchData(1, true);
    };
    initLoad();
  }, [selectedCategory]);

  return (
    <MobileSchoolNoticePageWrapper>
      <MobileHeader />
      <TitleCategorySelectorWrapper>
        <CategorySelectorNew
          categories={categoryList}
          selectedCategory={selectedCategory}
        />
      </TitleCategorySelectorWrapper>
      <TipsListContainerWrapper>
        <InfiniteScroll
          dataLength={notices.length}
          next={() => fetchData(page)}
          hasMore={hasMore}
          scrollableTarget="app-scroll-view" // 레이아웃의 스크롤 ID와 일치
          loader={<LoadingText>Loading...</LoadingText>}
          endMessage={<LoadingText>더 이상 게시물이 없습니다.</LoadingText>}
        >
          <TipsCardWrapper>
            {notices.map((notice, index) => (
              <Box key={`${notice.title}-${index}`}>
                <NoticeItem
                  title={notice.title}
                  category={notice.category}
                  writer={notice.writer}
                  date={notice.createDate}
                />
              </Box>
            ))}
          </TipsCardWrapper>
        </InfiniteScroll>
      </TipsListContainerWrapper>
    </MobileSchoolNoticePageWrapper>
  );
};

export default MobileSchoolNoticePage;

const MobileSchoolNoticePageWrapper = styled.div`
  width: 100%;
`;

const TitleCategorySelectorWrapper = styled.div`
  width: 100%;
  padding: 0 16px;
  box-sizing: border-box;
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
`;
