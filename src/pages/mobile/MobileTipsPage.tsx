import styled from "styled-components";
import { useHeader } from "@/context/HeaderContext";
import CategorySelectorNew from "@/components/mobile/common/CategorySelectorNew";
import { Fragment, useEffect, useMemo, useState } from "react";
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
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

interface CategoryPostListProps {
  category: string;
}

const CategoryPostList = ({ category }: CategoryPostListProps) => {
  const navigate = useNavigate();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["posts", "mobile", category],
    queryFn: async ({ pageParam }) => {
      const response = await getPostsMobile(pageParam, category);
      return (response.data || []) as Post[];
    },
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.length < 10) return undefined;
      return lastPage[lastPage.length - 1]?.id;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  const posts = useMemo(() => {
    return data?.pages.flatMap((page) => page) ?? [];
  }, [data]);

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
        next={fetchNextPage}
        hasMore={Boolean(hasNextPage)}
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

  const [swiperRef, setSwiperRef] = useState<SwiperClass | null>(null);
  const [hasSwiped, setHasSwiped] = useState(() => {
    return localStorage.getItem("has_swiped_tips") === "true";
  });

  const { data: categoryResData } = useQuery({
    queryKey: ["categories", "tips"],
    queryFn: async () => {
      const res = await getTipsCategories();
      return (res.data || []) as string[];
    },
    staleTime: 1000 * 60 * 30,
  });

  const categoryList = useMemo(() => categoryResData ?? [], [categoryResData]);

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

    if (nextCategory && nextCategory !== selectedCategory) {
      resetScrollToTop();
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
