import { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import styled from "styled-components";
import TipsCard from "../../components/tips/TipsCard";
import { getPostsMobile } from "../../../utils/API/Posts";
import { getNotices } from "../../../utils/API/Notices";
import { search } from "../../../utils/API/Search";

interface TipsListContainerProps {
  viewMode: "grid" | "list";
  docType: string;
  category: string;
  query: string;
}

interface FetchState {
  lastPostId: number | undefined;
  page: number;
}

export default function TipsListContainer({
  viewMode,
  docType,
  category,
  query,
}: TipsListContainerProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [fetchState, setFetchState] = useState<FetchState>({
    lastPostId: undefined,
    page: 1,
  });
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // 초기화
  useEffect(() => {
    const scrollableDiv = document.getElementById("scrollableDiv");
    if (scrollableDiv) {
      scrollableDiv.scrollTop = 0;
    }
    setFetchState({
      lastPostId: undefined,
      page: 1,
    });
    setHasMore(true);
    setPosts([]);
    setIsInitialLoad(true);
    console.log("초기화 fetchData", docType, query, category, fetchState);
    fetchData();
  }, [query, docType, setPosts, category]);

  // 첫 번째 로드 후 추가 데이터를 불러오도록 설정
  useEffect(() => {
    if (isInitialLoad) {
      if (docType === "TIPS") {
        if (fetchState.lastPostId !== undefined) {
          setIsInitialLoad(false);
          console.log("두번째 fetchData", docType, query, category, fetchState);
          fetchData();
        }
      } else {
        if (fetchState.page !== 1) {
          setIsInitialLoad(false);
          console.log("두번째 fetchData", docType, query, category, fetchState);
          fetchData();
        }
      }
    }
  }, [fetchState]);

  const fetchData = async () => {
    try {
      let response;
      if (docType === "TIPS") {
        response = await getPostsMobile(fetchState.lastPostId, category);
      } else if (docType === "NOTICE") {
        response = await getNotices(
          category,
          "date",
          fetchState.page.toString()
        );
      } else if (docType === "SEARCH" && query) {
        response = await search(query, "date", fetchState.page.toString());
      }

      if (response && response.status === 200) {
        let newPosts: Post[] = [];
        if (docType === "TIPS") {
          newPosts = response.body.data;
        } else if (docType === "NOTICE") {
          newPosts = response.body.data.notices;
        } else if (docType === "SEARCH") {
          newPosts = response.body.data.posts;
        }

        if (newPosts && newPosts.length > 0) {
          setPosts((prev) => [...prev, ...newPosts]);

          // lastPostId 및 페이지 수 업데이트
          if (docType === "TIPS") {
            const lpi = Number(newPosts[newPosts.length - 1]?.id);
            setFetchState((prev) => ({
              ...prev,
              lastPostId: Number.isNaN(lpi) ? undefined : lpi,
            }));
          } else {
            setFetchState((prev) => ({
              ...prev,
              page: prev.page + 1,
            }));
          }
        } else {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setHasMore(false);
    }
  };

  const handleNext = () => {
    if (!isInitialLoad && hasMore) {
      console.log("handleNext fetchData", docType, query, category, fetchState);
      fetchData();
    }
  };

  return (
    <TipsListContainerWrapper id="scrollableDiv" $docType={docType}>
      <InfiniteScroll
        key={docType}
        dataLength={posts.length}
        next={handleNext}
        hasMore={hasMore}
        loader={<h4 style={{ textAlign: "center" }}>Loading...</h4>}
        endMessage={
          <h4 style={{ textAlign: "center" }}>더 이상 게시물이 없습니다.</h4>
        }
        scrollableTarget="scrollableDiv"
      >
        <TipsCardWrapper $viewMode={viewMode}>
          {posts.map((p, i) => (
            <TipsCard
              key={i}
              post={p as Post}
              viewMode={viewMode}
              docType={docType}
            />
          ))}
        </TipsCardWrapper>
      </InfiniteScroll>
    </TipsListContainerWrapper>
  );
}

const TipsListContainerWrapper = styled.div<{ $docType: string }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: ${({ $docType }) =>
    $docType === "NOTICE"
      ? "calc(100svh - 72px - 64px - 16px - 32px)" // DocType이 NOTICE 일 때는 SearchForm 없음
      : "calc(100svh - 72px - 64px - 16px - 32px - 16px - 49px)"}; // 100% 로 하면 안먹혀서 header, nav, gap, TitleCategorySelectorWrapper, SearchForm 크기 직접 빼주기
  overflow-y: auto;
`;

const TipsCardWrapper = styled.div<{ $viewMode: "grid" | "list" }>`
  display: ${({ $viewMode }) => ($viewMode === "grid" ? "grid" : "flex")};
  flex-direction: ${({ $viewMode }) =>
    $viewMode === "list" ? "column" : "unset"};
  gap: 8px;
  width: 100%;
  grid-template-columns: ${({ $viewMode }) =>
    $viewMode === "grid" ? "repeat(2, 1fr)" : "unset"};
`;
