import styled from "styled-components";
import { useHeader } from "@/context/HeaderContext";
import CategorySelectorNew from "@/components/mobile/common/CategorySelectorNew";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import Box from "@/components/common/Box";
import { getTipsCategories } from "@/apis/categories";
import { getPostsMobile } from "@/apis/posts";
import { Post } from "@/types/posts";
import Divider from "@/components/common/Divider";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import PostItem from "@/components/mobile/notice/PostItem";
import { mixpanelTrack } from "@/utils/mixpanel";
import {
  DESKTOP_CONTENT_MAX_WIDTH,
  DESKTOP_MEDIA,
} from "@/styles/responsive";
import MobileWriteButton from "@/components/mobile/tips/MobileWriteButton";
import SwipeChevronGuides from "@/components/mobile/common/SwipeChevronGuides";
import InfiniteScroll from "react-infinite-scroll-component";
import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperClass } from "swiper";
import "swiper/css";
import { resetScrollToTop } from "@/utils/scroll";

interface CategoryPostListProps {
  category: string;
}

const CategoryPostList = ({ category }: CategoryPostListProps) => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [lastPostId, setLastPostId] = useState<number | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(
    async (isFirst: boolean = false) => {
      if (isLoading && !isFirst) return;

      setIsLoading(true);
      try {
        const response = await getPostsMobile(isFirst ? undefined : lastPostId, category);
        const newPosts: Post[] = response.data;

        if (newPosts && newPosts.length > 0) {
          setPosts((prev) => (isFirst ? newPosts : [...prev, ...newPosts]));
          setLastPostId(newPosts[newPosts.length - 1]?.id);
          setHasMore(newPosts.length >= 10);
        } else {
          if (isFirst) setPosts([]);
          setHasMore(false);
        }
      } catch (error) {
        console.error("게시글 목록 로드 실패", error);
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    },
    [category, isLoading, lastPostId],
  );

  useEffect(() => {
    setPosts([]);
    setLastPostId(undefined);
    setHasMore(true);
    fetchData(true);
  }, [category]);

  if (isLoading && posts.length === 0) {
    return (
      <ListContainer>
        <Box style={{ border: 0, borderRadius: 0, background: "transparent" }}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Fragment key={`post-skeleton-${category}-${index}`}>
              <PostItem isLoading />
              {index < 5 && <Divider margin="0" />}
            </Fragment>
          ))}
        </Box>
      </ListContainer>
    );
  }

  return (
    <ListContainer>
      <InfiniteScroll
        dataLength={posts.length}
        next={() => fetchData()}
        hasMore={hasMore}
        scrollableTarget="app-scroll-view"
        loader={
          <Box style={{ border: 0, borderRadius: 0, background: "transparent" }}>
            <PostItem isLoading />
          </Box>
        }
        endMessage={posts.length > 0 ? <LoadingText>더 이상 게시물이 없습니다.</LoadingText> : null}
      >
        <Box style={{ border: 0, borderRadius: 0, background: "transparent" }}>
          {posts.length > 0 ? (
            posts.map((post, index) => (
              <Fragment key={post.id}>
                <PostItem
                  id={post.id}
                  title={post.title}
                  content={post.content}
                  date={post.createDate}
                  writer={post.writer}
                  like={post.like}
                  scrap={post.scrap}
                  replyCount={post.replyCount}
                  imageCount={post.imageCount}
                  imageUrl={post.imageUrl}
                  onClick={() => {
                    mixpanelTrack.tipViewed(category, post.title);
                    navigate(ROUTES.BOARD.TIPS_DETAIL(post.id));
                  }}
                />
                {index < posts.length - 1 && <Divider margin="0" />}
              </Fragment>
            ))
          ) : (
            <EmptyState>해당 카테고리의 게시글이 없습니다.</EmptyState>
          )}
        </Box>
      </InfiniteScroll>
    </ListContainer>
  );
};

const MobileTipsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const requestedCategory = params.get("category");

  const [categoryList, setCategoryList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [swiperRef, setSwiperRef] = useState<SwiperClass | null>(null);
  const [hasSwiped, setHasSwiped] = useState(() => {
    return localStorage.getItem("has_swiped_tips") === "true";
  });

  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      try {
        const categoryRes = await getTipsCategories();
        setCategoryList(categoryRes.data);
      } catch (error) {
        console.error("카테고리 로드 실패", error);
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, []);

  const selectedCategory = useMemo(() => {
    if (requestedCategory && categoryList.includes(requestedCategory)) {
      return requestedCategory;
    }
    return categoryList[0] ?? requestedCategory ?? "자유게시판";
  }, [categoryList, requestedCategory]);

  const currentIndex = useMemo(() => {
    const idx = categoryList.indexOf(selectedCategory);
    return idx === -1 ? 0 : idx;
  }, [categoryList, selectedCategory]);

  useEffect(() => {
    if (categoryList.length === 0) return;
    if (requestedCategory === selectedCategory) return;

    const nextParams = new URLSearchParams(location.search);
    nextParams.set("category", selectedCategory);
    navigate(`${location.pathname}?${nextParams.toString()}`, { replace: true });
  }, [categoryList.length, location.pathname, location.search, navigate, requestedCategory, selectedCategory]);

  useEffect(() => {
    if (swiperRef && swiperRef.activeIndex !== currentIndex) {
      swiperRef.slideTo(currentIndex);
    }
  }, [currentIndex, swiperRef]);

  useEffect(() => {
    if (!swiperRef) return;

    setTimeout(() => {
      swiperRef.update();
      swiperRef.updateAutoHeight();
    }, 100);
    setTimeout(() => {
      swiperRef.update();
      swiperRef.updateAutoHeight();
    }, 350);
  }, [selectedCategory, swiperRef]);

  const handleSlideChange = (s: SwiperClass) => {
    const nextCategory = categoryList[s.activeIndex];

    if (!hasSwiped) {
      setHasSwiped(true);
      localStorage.setItem("has_swiped_tips", "true");
    }

    resetScrollToTop();

    if (nextCategory && nextCategory !== selectedCategory) {
      const nextParams = new URLSearchParams(location.search);
      nextParams.set("category", nextCategory);
      navigate(`${location.pathname}?${nextParams.toString()}`, { replace: true });
    }
  };

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
    title: "커뮤니티",
    hasback: true,
    subHeader,
    floatingSubHeader: true,
  });

  return (
    <MobileTipsPageWrapper>
      {categoryList.length > 0 ? (
        <Swiper
          onSwiper={setSwiperRef}
          initialSlide={currentIndex}
          onSlideChange={handleSlideChange}
          speed={320}
          autoHeight={true}
          observer={true}
          observeParents={true}
          style={{ width: "100%" }}
        >
          {categoryList.map((category) => (
            <SwiperSlide key={category} style={{ height: "auto" }}>
              <CategoryPostList category={category} />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <CategoryPostList category={selectedCategory} />
      )}
      <SwipeChevronGuides
        hasSwiped={hasSwiped}
        currentIndex={currentIndex}
        totalSlides={categoryList.length}
      />
      <MobileWriteButton category={selectedCategory} />
    </MobileTipsPageWrapper>
  );
};

export default MobileTipsPage;

const MobileTipsPageWrapper = styled.div`
  width: 100%;
  position: relative;

  .swiper-autoheight {
    transition: height 0ms !important;
  }

  @media ${DESKTOP_MEDIA} {
    width: min(100%, ${DESKTOP_CONTENT_MAX_WIDTH});
    margin: 0 auto;
  }
`;

const ListContainer = styled.div`
  width: 100%;
  padding: 0 0 40px;
  box-sizing: border-box;

  @media ${DESKTOP_MEDIA} {
    padding: 0 0 120px;
  }
`;

const EmptyState = styled.div`
  font-size: 14px;
  color: #bbb;
  text-align: center;
  padding: 40px 20px;
`;

const LoadingText = styled.h4`
  text-align: center;
  padding: 20px 0;
  color: #888;
  font-size: 14px;
`;
