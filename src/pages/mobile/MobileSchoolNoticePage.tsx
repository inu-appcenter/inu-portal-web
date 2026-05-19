import styled from "styled-components";
import { useHeader } from "@/context/HeaderContext";
import { useEffect, useState, useMemo, useCallback } from "react";
import CategorySelectorNew from "@/components/mobile/common/CategorySelectorNew";
import SwipeChevronGuides from "@/components/mobile/common/SwipeChevronGuides";
import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperClass } from "swiper";
import "swiper/css";
import { Notice, SearchNotice } from "@/types/notices";
import { ApiResponse, Pagination } from "@/types/common";
import { getNotices, searchNotices } from "@/apis/notices";
import Box from "@/components/common/Box";
import PostItem from "@/components/mobile/notice/PostItem";
import { getSchoolNoticeCategories } from "@/apis/categories";
import { useLocation, useNavigate } from "react-router-dom";
import { useInView } from "react-intersection-observer";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  DESKTOP_CONTENT_MAX_WIDTH,
  DESKTOP_MEDIA,
  DESKTOP_SEARCH_BAR_MAX_WIDTH,
  MOBILE_PAGE_GUTTER,
} from "@/styles/responsive";
import MobilePillSearchBar from "@/components/mobile/common/MobilePillSearchBar";
import FloatingActionButton from "@/components/common/FloatingActionButton";
import { Bell } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import useUserStore from "@/stores/useUserStore";
import { mixpanelTrack } from "@/utils/mixpanel";
import { resetScrollToTop } from "@/utils/scroll";

const SEARCH_MIN_QUERY_LENGTH = 2;
const SEARCH_MIN_QUERY_MESSAGE = "검색어를 2글자 이상 입력해 주세요.";

interface SchoolNoticeListProps {
  category: string;
  committedQuery: string;
  onNoticeView: (category: string, title: string) => void;
}

const SchoolNoticeList = ({ category, committedQuery, onNoticeView }: SchoolNoticeListProps) => {
  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery<ApiResponse<Pagination<(Notice | SearchNotice)[]>>>({
    queryKey: ["notices", category, committedQuery],
    queryFn: ({ pageParam = 1 }) =>
      committedQuery
        ? searchNotices(committedQuery, category, pageParam as number)
        : getNotices(category, "date", pageParam as number),
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

  // 카테고리 로딩 및 변경 시 강건하게 최상단 스크롤 리셋
  useEffect(() => {
    resetScrollToTop();
  }, [category, isLoading]);

  return (
    <TipsCardWrapper>
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
              onNoticeView(notice.category, notice.title);
              if (notice.url) window.open(notice.url, "_blank");
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

      {/* 무한 스크롤 트리거 */}
      <div ref={ref} style={{ height: "20px", width: "100%" }}>
        {isFetchingNextPage && (
          <Box style={{ width: "100%", marginTop: "12px" }}>
            <PostItem isLoading />
          </Box>
        )}
      </div>

      {!hasNextPage && notices.length > 0 && (
        <LoadingText>더 이상 게시물이 없습니다.</LoadingText>
      )}
    </TipsCardWrapper>
  );
};

const MobileSchoolNoticePage = () => {
  const { tokenInfo } = useUserStore();
  const [categoryList, setCategoryList] = useState<string[]>([]);
  const navigate = useNavigate();

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const selectedCategory = params.get("category") || "전체";
  const committedQuery = params.get("query")?.trim() ?? "";

  const [inputValue, setInputValue] = useState(committedQuery);

  const [swiperRef, setSwiperRef] = useState<SwiperClass | null>(null);
  const [hasSwiped, setHasSwiped] = useState(() => {
    return localStorage.getItem("has_swiped") === "true";
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedCategory, committedQuery]);

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

  const currentIndex = useMemo(() => {
    const idx = categoryList.indexOf(selectedCategory);
    return idx === -1 ? 0 : idx;
  }, [selectedCategory, categoryList]);

  useEffect(() => {
    if (swiperRef && swiperRef.activeIndex !== currentIndex) {
      swiperRef.slideTo(currentIndex);
    }
  }, [currentIndex, swiperRef]);

  // 데이터 로딩 완료 시점을 대비한 스위퍼 리사이징 수동 업데이트 트리거
  useEffect(() => {
    if (swiperRef) {
      setTimeout(() => {
        swiperRef.update();
        swiperRef.updateAutoHeight();
      }, 100);
      setTimeout(() => {
        swiperRef.update();
        swiperRef.updateAutoHeight();
      }, 350);
    }
  }, [selectedCategory, swiperRef]);

  const handleSlideChange = (s: SwiperClass) => {
    const nextCategory = categoryList[s.activeIndex];

    if (!hasSwiped) {
      setHasSwiped(true);
      localStorage.setItem("has_swiped", "true");
    }

    resetScrollToTop();

    if (nextCategory && nextCategory !== selectedCategory) {
      const nextParams = new URLSearchParams(location.search);
      nextParams.set("category", nextCategory);
      navigate(`${location.pathname}?${nextParams.toString()}`, { replace: true });
    }
  };

  const handleSearchSubmit = () => {
    const nextQuery = inputValue.trim();

    if (nextQuery && nextQuery.length < SEARCH_MIN_QUERY_LENGTH) {
      window.alert(SEARCH_MIN_QUERY_MESSAGE);
      return;
    }

    // 검색 수행 트래킹 (결과가 0건인 경우도 포함하여 추적)
    mixpanelTrack.searchPerformed("Notice", nextQuery, 0);

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
      {categoryList.length > 0 && (
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
              <SchoolNoticeList
                category={category}
                committedQuery={committedQuery}
                onNoticeView={(noticeCat, noticeTitle) => {
                  mixpanelTrack.noticeViewed(
                    noticeCat,
                    noticeTitle,
                    !!committedQuery,
                  );
                }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      <FloatingActionButton
        text="공지 알리미 설정"
        icon={<Bell size={18} color="white" />}
        onClick={() => {
          if (!tokenInfo.accessToken) {
            if (
              window.confirm(
                "로그인이 필요해요. 로그인 페이지로 이동할까요?\nINTIP은 학교 포털 계정으로 간편하게 로그인할 수 있어요.",
              )
            ) {
              navigate(ROUTES.LOGIN);
            }
          } else {
            mixpanelTrack.notificationSettingsOpened(
              "School Notice Page",
              "school",
            );
            navigate(`${ROUTES.BOARD.DEPT_SETTING}?tab=school`);
          }
        }}
        bottom={"100px"}
      />

      <FloatingSearchBar>
        <MobilePillSearchBar
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleSearchSubmit}
          placeholder="검색어를 입력하세요."
        />
      </FloatingSearchBar>

      {/* 가로 스와이프 안내 시각 가이드 (스와이프 조작을 한 번도 안 한 최초 진입 시에만 노출) */}
      <SwipeChevronGuides
        hasSwiped={hasSwiped}
        currentIndex={currentIndex}
        totalSlides={categoryList.length}
      />
    </MobileSchoolNoticePageWrapper>
  );
};

export default MobileSchoolNoticePage;

const MobileSchoolNoticePageWrapper = styled.div`
  width: 100%;

  padding-bottom: 120px;

  .swiper-autoheight {
    transition: height 0ms !important;
  }

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

const FloatingSearchBar = styled.div`
  position: fixed;
  left: 50%;
  bottom: 28px;
  transform: translateX(-50%);
  width: calc(100% - 32px);
  z-index: 120;

  @media ${DESKTOP_MEDIA} {
    width: min(calc(100% - 48px), ${DESKTOP_SEARCH_BAR_MAX_WIDTH});
  }
`;


