import styled from "styled-components";
import { useHeader } from "@/context/HeaderContext";
import { useNavigate, useParams } from "react-router-dom";
import { Fragment, useCallback, useEffect, useState } from "react";
import { Post } from "@/types/posts";
import { getPostsMobile } from "@/apis/posts";
import InfiniteScroll from "react-infinite-scroll-component";
import Box from "@/components/common/Box";
import Divider from "@/components/common/Divider";
import { ROUTES } from "@/constants/routes";
import PostItem from "@/components/mobile/notice/PostItem";

const MobileTipsCategoryPage = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [lastPostId, setLastPostId] = useState<number | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const selectedCategory = category || "전체";

  const fetchData = useCallback(
    async (isFirst: boolean = false) => {
      if (isLoading && !isFirst) return;

      setIsLoading(true);
      try {
        const currentLastId = isFirst ? undefined : lastPostId;
        const response = await getPostsMobile(currentLastId, selectedCategory);
        const newPosts: Post[] = response.data;

        if (newPosts && newPosts.length > 0) {
          setPosts((prev) => (isFirst ? newPosts : [...prev, ...newPosts]));
          const lpi = newPosts[newPosts.length - 1]?.id;
          setLastPostId(lpi);
          // 보통 모바일 API는 개수로 판단하거나 빈 배열로 판단
          if (newPosts.length < 10) {
            setHasMore(false);
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
    [selectedCategory, lastPostId, isLoading],
  );

  useEffect(() => {
    setPosts([]);
    setLastPostId(undefined);
    setHasMore(true);
    fetchData(true);
  }, [selectedCategory]);

  useHeader({
    title: selectedCategory,
    hasback: true,
  });

  return (
    <Wrapper>
      {/*<SerachForm />*/}
      <InfiniteScroll
        dataLength={posts.length}
        next={() => fetchData()}
        hasMore={hasMore}
        scrollableTarget="app-scroll-view"
        loader={<LoadingText>Loading...</LoadingText>}
        endMessage={<LoadingText>더 이상 게시물이 없습니다.</LoadingText>}
      >
        <ListContainer>
          <Box>
            {posts.length > 0
              ? posts.map((post, index) => (
                  <Fragment key={post.id}>
                    <PostItem
                      title={post.title}
                      // category={post.category}
                      date={post.createDate}
                      writer={post.writer}
                      onClick={() => {
                        navigate(ROUTES.BOARD.TIPS_DETAIL(post.id));
                      }}
                    />
                    {index < posts.length - 1 && <Divider margin={"16px 0"} />}
                  </Fragment>
                ))
              : !isLoading && (
                  <EmptyState>해당 카테고리의 게시글이 없습니다.</EmptyState>
                )}
          </Box>
        </ListContainer>
      </InfiniteScroll>
    </Wrapper>
  );
};

export default MobileTipsCategoryPage;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const ListContainer = styled.div`
  padding: 0 16px 40px;
  box-sizing: border-box;
`;

const EmptyState = styled.div`
  font-size: 14px;
  color: #bbb;
  text-align: center;
  padding: 20px 0;
`;

const LoadingText = styled.h4`
  text-align: center;
  padding: 20px 0;
  color: #888;
  font-size: 14px;
`;
