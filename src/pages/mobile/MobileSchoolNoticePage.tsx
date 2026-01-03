import styled from "styled-components";
import { useHeader } from "@/context/HeaderContext";
import InfiniteScroll from "react-infinite-scroll-component";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Notice } from "@/types/notices";
import { getNotices } from "@/apis/notices";
import Box from "@/components/common/Box";
import PostItem from "@/components/mobile/notice/PostItem";
import { getSchoolNoticeCategories } from "@/apis/categories";
import CategorySelectorNew from "@/components/mobile/common/CategorySelectorNew";
import { useLocation } from "react-router-dom";

const LIMIT = 8; // 페이지당 데이터 수

const MobileSchoolNoticePage = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [categoryList, setCategoryList] = useState<string[]>([]);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const selectedCategory = params.get("category") || "전체";

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // 데이터 페칭 함수
  const fetchData = useCallback(
    async (pageNum: number, isFirst: boolean = false) => {
      // 중복 로딩 방지
      if (isLoading && !isFirst) return;

      setIsLoading(true);
      try {
        const response = await getNotices(selectedCategory, "date", pageNum);
        const newNotices: Notice[] = response.data.contents;

        if (newNotices && newNotices.length > 0) {
          setNotices((prev) =>
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
          setHasMore(false);
        }
      } catch (error) {
        console.error("데이터 로드 실패", error);
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedCategory], // isLoading 제거: 함수 안정성 유지
  );

  // 카테고리 로드
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getSchoolNoticeCategories();
        setCategoryList(["전체", ...response.data]);
      } catch (error) {
        console.error("카테고리 로드 실패", error);
      }
    };

    fetchCategories();
  }, []);

  // 카테고리 변경 시 초기화
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
  }, [selectedCategory, fetchData]);

  const subHeader = useMemo(
    () => (
      <CategorySelectorNew
        categories={categoryList}
        selectedCategory={selectedCategory}
      />
    ),
    [categoryList, selectedCategory],
  );

  useHeader({
    title: "학교 공지사항",
    hasback: true,
    subHeader: subHeader,
    floatingSubHeader: true,
  });

  return (
    <MobileSchoolNoticePageWrapper>
      <InfiniteScroll
        dataLength={notices.length}
        next={() => fetchData(page)}
        hasMore={hasMore}
        scrollableTarget="app-scroll-view" // SubLayout의 ID와 일치
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
          {notices.length === 0 && isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <Box key={`skeleton-${i}`}>
                  <PostItem isLoading />
                </Box>
              ))
            : notices.map((notice, index) => (
                <Box
                  key={`${notice.id || index}`}
                  onClick={() => {
                    if (notice.url)
                      window.open("https://" + notice.url, "_blank");
                  }}
                >
                  <PostItem
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
  margin: 0 16px;
  padding-bottom: 20px;
`;

const LoadingText = styled.h4`
  text-align: center;
  padding: 20px 0;
  color: #888;
  font-size: 14px;
`;
