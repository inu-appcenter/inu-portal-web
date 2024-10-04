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

export default function TipsListContainer({
  viewMode,
  docType,
  category,
  query,
}: TipsListContainerProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [lastPostId, setLastPostId] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setPage(1);
    setLastPostId(undefined);
    setHasMore(true);
    setPosts([]);
  }, [query, docType, setPosts, category]);

  useEffect(() => {
    const fetchData = async () => {
      console.log(docType, page, category, lastPostId);
      try {
        let response;
        if (docType === "TIPS") {
          response = await getPostsMobile(lastPostId, category);
        } else if (docType === "NOTICE") {
          response = await getNotices(category, "date", page.toString());
        } else if (docType === "SEARCH" && query) {
          response = await search(query, "date", page.toString());
        }
        if (response && response.status === 200) {
          let newPosts;
          if (docType === "TIPS") {
            newPosts = response.body.data;
          } else if (docType === "NOTICE") {
            newPosts = response.body.data.notices;
          } else if (docType === "SEARCH") {
            newPosts = response.body.data.posts;
          }
          if (newPosts && newPosts.length > 0) {
            setPosts((prev) =>
              posts.length === 0 ? newPosts : [...prev, ...newPosts]
            );
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
    fetchData();
  }, [category, docType, query, page, lastPostId]);

  const setNext = () => {
    if (docType === "TIPS") {
      setLastPostId(Number(posts[posts.length - 1]?.id));
    } else {
      setPage((page) => page + 1);
    }
  };

  return (
    <TipsListContainerWrapper id="scrollableDiv" $docType={docType}>
      <InfiniteScroll
        dataLength={posts.length}
        next={setNext}
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
