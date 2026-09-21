import styled from "styled-components";
import {
  useEffect,
  useState,
  useMemo,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useHeader } from "@/context/HeaderContext";
import CategorySelectorNew from "@/components/mobile/common/CategorySelectorNew";
import SwipeChevronGuides from "@/components/mobile/common/SwipeChevronGuides";
import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperClass } from "swiper";
import "swiper/css";
import {
  DESKTOP_MEDIA,
  MOBILE_PAGE_GUTTER,
  DESKTOP_READING_WIDTH,
} from "@/styles/responsive";
import { mixpanelTrack, trackPageView } from "@/utils/mixpanel";
import { resetScrollToTop } from "@/utils/scroll";
import MobileAgentReminderSetting from "@/components/mobile/dailyBrief/MobileAgentReminderSetting";
import MobileDailyBriefCardOrderSetting from "@/components/mobile/dailyBrief/MobileDailyBriefCardOrderSetting";

export const DAILY_BRIEF_TABS = [
  { label: "카드 구성", value: "cards" },
  { label: "맞춤 루틴", value: "agent" },
];

export default function MobileDailyBriefSettingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const currentTab = params.get("tab") || "cards";

  const [swiperRef, setSwiperRef] = useState<SwiperClass | null>(null);
  const [hasSwiped, setHasSwiped] = useState(() => {
    return localStorage.getItem("has_swiped_daily_brief") === "true";
  });

  const currentIndex = useMemo(() => {
    if (currentTab === "cards") return 0;
    return 1; // "agent" or any other tab
  }, [currentTab]);

  useEffect(() => {
    if (swiperRef && swiperRef.activeIndex !== currentIndex) {
      swiperRef.slideTo(currentIndex);
    }
    swiperRef?.update();
    swiperRef?.updateAutoHeight();
  }, [currentIndex, swiperRef]);

  // 스위퍼 높이 자동 동기화
  useEffect(() => {
    if (!swiperRef) return;

    const timers = [50, 150, 300, 600, 1000].map((delay) =>
      setTimeout(() => {
        swiperRef.update();
        swiperRef.updateAutoHeight();
      }, delay),
    );

    let ro: ResizeObserver | null = null;
    if (swiperRef.el && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => {
        window.requestAnimationFrame(() => {
          swiperRef.update();
          swiperRef.updateAutoHeight();
        });
      });
      ro.observe(swiperRef.el);
      swiperRef.slides?.forEach((slide) => {
        ro?.observe(slide);
      });
    }

    return () => {
      timers.forEach((t) => clearTimeout(t));
      if (ro) ro.disconnect();
    };
  }, [currentTab, swiperRef]);

  const handleSlideChange = (s: SwiperClass) => {
    const nextTab = DAILY_BRIEF_TABS[s.activeIndex]?.value;

    if (!hasSwiped) {
      setHasSwiped(true);
      localStorage.setItem("has_swiped_daily_brief", "true");
    }

    resetScrollToTop();

    if (nextTab && nextTab !== currentTab) {
      const nextParams = new URLSearchParams(location.search);
      nextParams.set("tab", nextTab);
      navigate(`${location.pathname}?${nextParams.toString()}`, {
        replace: true,
      });
    }
  };

  const subHeader = useMemo(
    () => (
      <CategorySelectorNew
        categories={DAILY_BRIEF_TABS}
        selectedCategory={currentTab === "cards" ? "cards" : "agent"}
        queryParam="tab"
      />
    ),
    [currentTab],
  );

  useHeader({
    title: "Daily Brief 설정",
    hasback: true,
    subHeader: subHeader,
    floatingSubHeader: true,
    rightArea: null,
  });

  useEffect(() => {
    trackPageView(`Daily Brief 설정 - ${currentTab}`);
    mixpanelTrack.noticeSettingTabSwitched(currentTab);
  }, [currentTab]);

  return (
    <PageWrapper>
      <ContentContainer>
        <Swiper
          onSwiper={setSwiperRef}
          initialSlide={currentIndex}
          onSlideChange={handleSlideChange}
          spaceBetween={24}
          speed={320}
          autoHeight={true}
          observer={true}
          observeParents={true}
          threshold={12}
          touchAngle={45}
          touchStartPreventDefault={false}
          preventClicks={false}
          preventClicksPropagation={false}
          nested={true}
          style={{ width: "100%", overflow: "hidden" }}
        >
          {/* 슬라이드 1: 카드 구성 */}
          <SwiperSlide
            style={{ height: "auto", width: "100%", boxSizing: "border-box" }}
          >
            <SlideInnerWrapper>
              <MobileDailyBriefCardOrderSetting />
            </SlideInnerWrapper>
          </SwiperSlide>

          {/* 슬라이드 2: 맞춤 루틴 (시스템 기본 루틴 + 내 루틴 + 추천 프리셋) */}
          <SwiperSlide
            style={{ height: "auto", width: "100%", boxSizing: "border-box" }}
          >
            <SlideInnerWrapper>
              <MobileAgentReminderSetting />
            </SlideInnerWrapper>
          </SwiperSlide>
        </Swiper>

        <SwipeChevronGuides
          hasSwiped={hasSwiped}
          currentIndex={currentIndex}
          totalSlides={DAILY_BRIEF_TABS.length}
        />
      </ContentContainer>
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 16px ${MOBILE_PAGE_GUTTER} 60px;
  box-sizing: border-box;
`;

const ContentContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;

  .swiper-autoheight {
    transition: height 0ms !important;
  }

  @media ${DESKTOP_MEDIA} {
    width: min(100%, ${DESKTOP_READING_WIDTH});
    margin: 0 auto;
  }
`;

const SlideInnerWrapper = styled.div`
  width: 100%;
  box-sizing: border-box;
  overflow: visible;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;
