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
    title: "학교 공지사항",
    hasback: true,
  });

  const [notices, setNotices] = useState<Notice[]>([]);
  const [categoryList, setCategoryList] = useState<string[]>([]);
  const params = new URLSearchParams(location.search);
  const selectedCategory = params.get("category") || "전체";

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

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
        setIsLoading(false);
      } catch (error) {
        console.error("데이터 로드 실패", error);
        setHasMore(false);
      }
    },
    [selectedCategory, isLoading],
  );

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await getSchoolNoticeCategories();
      setCategoryList(["전체", ...response.data]);
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const initLoad = async () => {
      setNotices([]);
      setPage(1);
      setHasMore(true);

      const scrollableDiv = document.getElementById("app-scroll-view");
      if (scrollableDiv) scrollableDiv.scrollTop = 0;

      await fetchData(1, true);
    };
    initLoad();
  }, [selectedCategory]);

  return (
    <>
      <MobileHeader
        subHeader={
          <CategorySelectorNew
            categories={categoryList}
            selectedCategory={selectedCategory}
          />
        }
        floatingSubHeader={true}
      />
      <MobileSchoolNoticePageWrapper>
        <InfiniteScroll
          dataLength={notices.length}
          next={() => fetchData(page)}
          hasMore={hasMore}
          scrollableTarget="app-scroll-view"
          // 하단 추가 로딩 스켈레톤
          loader={
            <TipsCardWrapper>
              <Box>
                <NoticeItem isLoading />
              </Box>
            </TipsCardWrapper>
          }
          endMessage={<LoadingText>더 이상 게시물이 없습니다.</LoadingText>}
        >
          <TipsCardWrapper>
            {/* 초기 로딩 스켈레톤 (데이터가 없을 때) */}
            {notices.length === 0 && isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <Box key={`skeleton-${i}`}>
                    <NoticeItem isLoading />
                  </Box>
                ))
              : notices.map((notice, index) => (
                  <Box
                    key={`${notice.title}-${index}`}
                    onClick={() => {
                      window.open("https://" + notice.url, "_blank");
                    }}
                  >
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
      </MobileSchoolNoticePageWrapper>
    </>
  );
};

export default MobileSchoolNoticePage;

const MobileSchoolNoticePageWrapper = styled.div`
  width: 100%;
`;

const TipsCardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 12px;
  margin: 0 16px;
`;

const LoadingText = styled.h4`
  text-align: center;
  padding: 20px 0;
  color: #888;
  font-size: 14px;
`;
