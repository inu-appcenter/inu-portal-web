import styled from "styled-components";
import { useHeader } from "@/context/HeaderContext";
import { useEffect, useState, useMemo, useCallback } from "react";
import { Notice, SearchNotice } from "@/types/notices";
import { ApiResponse, Pagination } from "@/types/common";
import { getNotices, searchNotices } from "@/apis/notices";
import Box from "@/components/common/Box";
import PostItem from "@/components/mobile/notice/PostItem";
import { getSchoolNoticeCategories } from "@/apis/categories";
import CategorySelectorNew from "@/components/mobile/common/CategorySelectorNew";
import { useLocation, useNavigate } from "react-router-dom";
import { useInView } from "react-intersection-observer";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  DESKTOP_CONTENT_MAX_WIDTH,
  DESKTOP_MEDIA,
  MOBILE_PAGE_GUTTER,
} from "@/styles/responsive";
import MobilePillSearchBar from "@/components/mobile/common/MobilePillSearchBar";

const SEARCH_MIN_QUERY_LENGTH = 2;
const SEARCH_MIN_QUERY_MESSAGE = "검색어를 2글자 이상 입력해 주세요.";

const MobileSchoolNoticePage = () => {
  const [categoryList, setCategoryList] = useState<string[]>([]);
  const { ref, inView } = useInView();
  const navigate = useNavigate();

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const selectedCategory = params.get("category") || "전체";
  const committedQuery = params.get("query")?.trim() ?? "";

  const [inputValue, setInputValue] = useState(committedQuery);

  useEffect(() => {
    setInputValue(committedQuery);
  }, [committedQuery]);

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
  } = useInfiniteQuery<ApiResponse<Pagination<(Notice | SearchNotice)[]>>>({
    queryKey: ["notices", selectedCategory, committedQuery],
    queryFn: ({ pageParam = 1 }) =>
      committedQuery
        ? searchNotices(committedQuery, selectedCategory, pageParam as number)
        : getNotices(selectedCategory, "date", pageParam as number),
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

  const handleSearchSubmit = () => {
    const nextQuery = inputValue.trim();

    if (nextQuery && nextQuery.length < SEARCH_MIN_QUERY_LENGTH) {
      window.alert(SEARCH_MIN_QUERY_MESSAGE);
      return;
    }

    const nextParams = new URLSearchParams(location.search);
    if (nextQuery) {
      nextParams.set("query", nextQuery);
    } else {
      nextParams.delete("query");
    }
    nextParams.set("page", "1");

    // 이미 검색 중인 상태에서 검색어를 바꾸는 것이라면 히스토리를 쌓지 않고 교체(replace)합니다.
    navigate(`${location.pathname}?${nextParams.toString()}`, {
      replace: !!committedQuery,
    });
  };

  const handleBackToAll = useCallback(() => {
    // 검색 모드에서 뒤로가기를 누르면 단순히 이전 히스토리(전체 목록)로 돌아갑니다.
    navigate(-1);
  }, [navigate]);

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
    title: committedQuery ? "검색 결과" : "학교 공지사항",
    hasback: true,
    onBack: committedQuery ? handleBackToAll : undefined,
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
          notices.map((notice: Notice | SearchNotice, index: number) => (
            <Box
              key={`${notice.id || index}`}
              onClick={() => {
                if (notice.url) window.open("https://" + notice.url, "_blank");
              }}
            >
              <PostItem
                title={notice.title}
                category={
                  "subCategory" in notice && notice.subCategory
                    ? `${notice.category} - ${notice.subCategory}`
                    : notice.category
                }
                writer={notice.writer}
                date={notice.createDate}
                views={"view" in notice ? notice.view : undefined}
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

      <SearchSpacer />

      <FloatingSearchBar>
        <MobilePillSearchBar
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleSearchSubmit}
          placeholder="검색어를 입력하세요."
        />
      </FloatingSearchBar>
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

const SearchSpacer = styled.div`
  height: 88px;
`;

const FloatingSearchBar = styled.div`
  position: fixed;
  left: 50%;
  bottom: 28px;
  transform: translateX(-50%);
  width: calc(100% - 32px);
  z-index: 120;

  @media ${DESKTOP_MEDIA} {
    width: min(calc(100% - 48px), ${DESKTOP_CONTENT_MAX_WIDTH});
  }
`;
