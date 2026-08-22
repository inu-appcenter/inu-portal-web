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
import SchoolNoticeItem from "@/components/mobile/notice/SchoolNoticeItem";
import { getSchoolNoticeCategories } from "@/apis/categories";
import { useLocation, useNavigate } from "react-router-dom";
import { useInView } from "react-intersection-observer";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  DESKTOP_CONTENT_MAX_WIDTH,
  DESKTOP_MEDIA,
  DESKTOP_SEARCH_BAR_MAX_WIDTH,
} from "@/styles/responsive";
import FloatingSearchBar from "@/components/mobile/common/FloatingSearchBar";
import FloatingActionButton from "@/components/common/FloatingActionButton";
import { Bell, Search } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import useUserStore from "@/stores/useUserStore";
import { mixpanelTrack } from "@/utils/mixpanel";
import { resetScrollToTop } from "@/utils/scroll";
import { markNoticesSeen } from "@/utils/noticeSeenStorage";

const SEARCH_MIN_QUERY_LENGTH = 2;
const SEARCH_MIN_QUERY_MESSAGE = "검색어를 2글자 이상 입력해 주세요.";

interface SchoolNoticeListProps {
  category: string;
  committedQuery: string;
  onNoticeView: (category: string, title: string) => void;
  onLengthChange?: () => void;
}

const SchoolNoticeList = ({
  category,
  committedQuery,
  onNoticeView,
  onLengthChange,
}: SchoolNoticeListProps) => {
  const navigate = useNavigate();
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
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const notices = useMemo(() => {
    return data?.pages.flatMap((page) => page.data.contents) || [];
  }, [data]);

  // 데이터 갯수 변경 시 상위 스위퍼 높이 리사이징 콜백 호출
  useEffect(() => {
    if (notices.length > 0 && onLengthChange) {
      onLengthChange();
    }
  }, [notices.length, onLengthChange]);

  return (
    <TipsCardWrapper>
      {isLoading && notices.length === 0 ? (
        Array.from({ length: 8 }).map((_, i) => (
          <SchoolNoticeItem key={`skeleton-${i}`} isLoading />
        ))
      ) : isError ? (
        <LoadingText>데이터를 불러오는 중 오류가 발생했습니다.</LoadingText>
      ) : notices.length === 0 ? (
        committedQuery ? (
          <EmptySearchContainer>
            <EmptyIconCircle>
              <Search size={32} color="var(--text-tertiary, #8b95a1)" />
            </EmptyIconCircle>
            <EmptyTextGroup>
              <EmptyTitleRow>
                <EmptyQueryHighlight>‘{committedQuery}’</EmptyQueryHighlight>
                <EmptyTitleText>검색 결과가 없어요</EmptyTitleText>
              </EmptyTitleRow>
              <EmptyDescription>
                철자를 확인하거나 다른 키워드로 검색해 보세요.
              </EmptyDescription>
            </EmptyTextGroup>
          </EmptySearchContainer>
        ) : (
          <LoadingText>게시물이 없습니다.</LoadingText>
        )
      ) : (
        notices.map((notice: Notice | SearchNotice, index: number) => (
          <SchoolNoticeItem
            key={`${notice.id || index}`}
            category={
              "subCategory" in notice && notice.subCategory
                ? `${notice.category} - ${notice.subCategory}`
                : notice.category
            }
            title={notice.title}
            writer={notice.writer}
            date={notice.createDate}
            onClick={(e) => {
              onNoticeView(notice.category, notice.title);
              if (notice.id) {
                navigate(ROUTES.BOARD.NOTICE_DETAIL(notice.id));
              } else if (notice.url) {
                window.open(notice.url, "_blank");
              }
            }}
          />
        ))
      )}

      {/* 무한 스크롤 트리거 */}
      <div ref={ref} style={{ height: "20px", width: "100%" }}>
        {isFetchingNextPage && (
          <div style={{ width: "100%" }}>
            <SchoolNoticeItem isLoading />
          </div>
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
  const navigate = useNavigate();

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const selectedCategory = params.get("category") || "전체";
  const committedQuery = params.get("query")?.trim() ?? "";

  const [swiperRef, setSwiperRef] = useState<SwiperClass | null>(null);
  const [hasSwiped, setHasSwiped] = useState(() => {
    return localStorage.getItem("has_swiped") === "true";
  });

  const { data: categoryResData } = useQuery({
    queryKey: ["categories", "school_notices"],
    queryFn: async () => {
      const response = await getSchoolNoticeCategories();
      return ["전체", ...(response.data || [])];
    },
    staleTime: 1000 * 60 * 30,
  });

  const categoryList = useMemo(
    () => categoryResData ?? ["전체"],
    [categoryResData],
  );

  const currentIndex = useMemo(() => {
    const idx = categoryList.indexOf(selectedCategory);
    return idx === -1 ? 0 : idx;
  }, [selectedCategory, categoryList]);

  useEffect(() => {
    if (swiperRef && swiperRef.activeIndex !== currentIndex) {
      swiperRef.slideTo(currentIndex);
    }
  }, [currentIndex, swiperRef]);

  // 스위퍼 내부 데이터 레이아웃 강제 동기화 팩터화
  const handleUpdateSwiperHeight = useCallback(() => {
    if (swiperRef) {
      requestAnimationFrame(() => {
        swiperRef.update();
        swiperRef.updateAutoHeight();
      });
    }
  }, [swiperRef]);

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

    if (nextCategory && nextCategory !== selectedCategory) {
      resetScrollToTop();
      const nextParams = new URLSearchParams(location.search);
      nextParams.set("category", nextCategory);
      navigate(`${location.pathname}?${nextParams.toString()}`, {
        replace: true,
      });
    }
  };

  const handleSearch = (query: string) => {
    const nextQuery = query.trim();

    if (nextQuery && nextQuery.length < SEARCH_MIN_QUERY_LENGTH) {
      window.alert(SEARCH_MIN_QUERY_MESSAGE);
      return;
    }

    mixpanelTrack.searchPerformed("Notice", nextQuery, 0);
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
        onSelectCategory={(category) => {
          const index = categoryList.indexOf(category);
          if (swiperRef && index !== -1) {
            swiperRef.slideTo(index);
          }
        }}
      />
    ),
    [categoryList, selectedCategory, swiperRef],
  );

  useHeader({
    title: committedQuery ? "검색 결과" : "학교 공지사항",
    showAlarm: false,
    hasback: true,
    onBack: committedQuery ? handleBackToAll : undefined,
    subHeader: !committedQuery ? subHeader : undefined,
    floatingSubHeader: true,
  });

  // 목록을 열었다면 새 공지를 확인한 것으로 보고 홈 인사말의 "새 공지" 상태를 해제한다.
  useEffect(() => {
    markNoticesSeen();
  }, []);

  return (
    <MobileSchoolNoticePageWrapper>
      {committedQuery ? (
        <SchoolNoticeList
          category={selectedCategory}
          committedQuery={committedQuery}
          onNoticeView={(cat, t) => {
            mixpanelTrack.noticeViewed(
              cat,
              t,
              !!committedQuery,
            );
          }}
        />
      ) : (
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
                committedQuery=""
                onNoticeView={(cat, t) => {
                  mixpanelTrack.noticeViewed(
                    cat,
                    t,
                    !!committedQuery,
                  );
                }}
                onLengthChange={handleUpdateSwiperHeight}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      <FloatingActionButton
        text="공지 알리미 설정"
        icon={<Bell size={20} color="var(--text-secondary, #333d4b)" />}
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
        bottom={"28px"}
      />

      <FloatingSearchBarContainer>
        <FloatingSearchBar
          placeholder="검색어를 입력하세요."
          searchParamKey="query"
          size={48}
          onSearch={handleSearch}
        />
      </FloatingSearchBarContainer>

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
  width: 100%;
  margin: 0;
  padding: 0 0 20px 0;
  box-sizing: border-box;

  @media ${DESKTOP_MEDIA} {
    width: 100%;
    margin: 0;
    padding: 0 0 32px;
  }
`;

const LoadingText = styled.h4`
  text-align: center;
  padding: 20px 0;
  color: #888;
  font-size: 14px;
`;

const EmptySearchContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  min-height: 360px;
  width: 100%;
  padding: 40px 16px;
  box-sizing: border-box;
`;

const EmptyIconCircle = styled.div`
  background: var(--bg-disabled, #e5e8eb);
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  flex-shrink: 0;
`;

const EmptyTextGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
`;

const EmptyTitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: "Pretendard", sans-serif;
  font-size: 20px;
  font-weight: 700;
  line-height: 28px;
  letter-spacing: -0.2px;
`;

const EmptyQueryHighlight = styled.span`
  color: var(--text-brand, #0061ff);
`;

const EmptyTitleText = styled.span`
  color: var(--text-primary, #191f28);
`;

const EmptyDescription = styled.p`
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  color: var(--text-tertiary, #8b95a1);
  margin: 0;
`;

const FloatingSearchBarContainer = styled.div`
  position: fixed;
  left: 50%;
  bottom: calc(28px + env(safe-area-inset-bottom, 0px));
  transform: translateX(-50%);
  width: calc(100% - 32px);
  display: flex;
  justify-content: flex-end;
  pointer-events: none;
  z-index: 120;

  @media ${DESKTOP_MEDIA} {
    width: min(calc(100% - 48px), ${DESKTOP_SEARCH_BAR_MAX_WIDTH});
  }
`;
