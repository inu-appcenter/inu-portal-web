import styled from "styled-components";
import { useHeader } from "@/context/HeaderContext";
import { useEffect, useState, useMemo } from "react";
import { Notice } from "@/types/notices";
import { getNotices } from "@/apis/notices";
import Box from "@/components/common/Box";
import PostItem from "@/components/mobile/notice/PostItem";
import { getSchoolNoticeCategories } from "@/apis/categories";
import CategorySelectorNew from "@/components/mobile/common/CategorySelectorNew";
import { useLocation } from "react-router-dom";
import { useInView } from "react-intersection-observer";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  DESKTOP_CONTENT_MAX_WIDTH,
  DESKTOP_MEDIA,
  MOBILE_PAGE_GUTTER,
} from "@/styles/responsive";

const MobileSchoolNoticePage = () => {
  const [categoryList, setCategoryList] = useState<string[]>([]);
  const { ref, inView } = useInView();

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const selectedCategory = params.get("category") || "전체";

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

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["notices", selectedCategory],
    queryFn: ({ pageParam = 1 }) => getNotices(selectedCategory, "date", pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const totalPages = lastPage.data.pages;
      const currentPage = allPages.length;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const notices = useMemo(() => {
    return data?.pages.flatMap((page) => page.data.contents) || [];
  }, [data]);

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
      <TipsCardWrapper>
        {/* 초기 로딩 스켈레톤 */}
        {isLoading && notices.length === 0 ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Box key={`skeleton-${i}`}>
              <PostItem isLoading />
            </Box>
          ))
        ) : isError ? (
          <LoadingText>데이터를 불러오는 중 오류가 발생했습니다.</LoadingText>
        ) : notices.length === 0 ? (
          <LoadingText>게시물이 없습니다.</LoadingText>
        ) : (
          notices.map((notice: Notice, index: number) => (
            <Box
              key={`${notice.id || index}`}
              onClick={() => {
                if (notice.url) window.open("https://" + notice.url, "_blank");
              }}
            >
              <PostItem
                title={notice.title}
                category={notice.category}
                writer={notice.writer}
                date={notice.createDate}
                views={notice.view}
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

      {!hasNextPage && notices.length > 0 && (
        <LoadingText>더 이상 게시물이 없습니다.</LoadingText>
      )}
    </MobileSchoolNoticePageWrapper>
  );
};

export default MobileSchoolNoticePage;

const MobileSchoolNoticePageWrapper = styled.div`
  width: 100%;

  @media ${DESKTOP_MEDIA} {
    width: min(100%, ${DESKTOP_CONTENT_MAX_WIDTH});
    margin: 0 auto;
  }
`;

const TipsCardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0 ${MOBILE_PAGE_GUTTER};
  padding-top: 12px;
  padding-bottom: 20px;
  box-sizing: border-box;

  @media ${DESKTOP_MEDIA} {
    width: 100%;
    margin: 0;
    padding: 16px 0 32px;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }
`;

const LoadingText = styled.h4`
  text-align: center;
  padding: 20px 0;
  color: #888;
  font-size: 14px;
`;
