import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Swiper, SwiperSlide } from "swiper/react";
import CategorySelectorNew from "@/components/mobile/common/CategorySelectorNew";
import SwipeChevronGuides from "@/components/mobile/common/SwipeChevronGuides";
import { Swiper as SwiperClass } from "swiper";
import "swiper/css";
import DynamicLegacyBusTabContent from "@/components/mobile/bus/goHomeSchool/DynamicLegacyBusTabContent";
import { useDynamicBusRoutes } from "@/hooks/useDynamicBusRoutes";
import MichuholShuttle from "@/components/mobile/bus/shuttle/MichuholShuttle";
import SubwayShuttle from "@/components/mobile/bus/shuttle/SubwayShuttle";
import SchoolShuttle from "@/components/mobile/bus/shuttle/SchoolShuttle";
import { postApiLogs } from "@/apis/members";
import { MenuItemType, useHeader } from "@/context/HeaderContext";
import { DESKTOP_MEDIA, MOBILE_PAGE_GUTTER } from "@/styles/responsive";
import {
  buildBusUiRoute,
  getStoredBusUiVersion,
  isSwitchableBusInfoType,
  setStoredBusUiVersion,
} from "@/utils/busUiPreference";
import { mixpanelTrack } from "@/utils/mixpanel";
import { resetScrollToTop } from "@/utils/scroll";

export default function BusInfoPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const type = query.get("type");
  const tab = query.get("category");

  const { tabs: dynamicTabs } = useDynamicBusRoutes(type);

  const tabList = useMemo(() => {
    if (type === "shuttle") {
      return ["사범대 셔틀", "인천대입구 셔틀", "통학 셔틀"];
    }
    if (dynamicTabs && dynamicTabs.length > 0) {
      return dynamicTabs.map((t) => t.label);
    }
    return [];
  }, [type, dynamicTabs]);

  const defaultTab = tabList[0] || (
    type === "go-school"
      ? "인입런"
      : type === "go-home"
        ? "인천대 정문"
        : "사범대 셔틀"
  );
  const selectedTab = tab ?? defaultTab;
  const shouldUseNewUi =
    isSwitchableBusInfoType(type) && getStoredBusUiVersion() === "new";
  const redirectTarget = shouldUseNewUi
    ? buildBusUiRoute({
        type,
        category: selectedTab,
        version: "new",
      })
    : null;

  useEffect(() => {
    if (type && !redirectTarget) {
      mixpanelTrack.busChecked(type, "N/A", selectedTab, "legacy");
    }
  }, [type, selectedTab, redirectTarget]);

  useEffect(() => {
    if (redirectTarget) {
      navigate(redirectTarget, { replace: true });
      return;
    }

    return undefined;
  }, [navigate, redirectTarget]);

  useEffect(() => {
    if (redirectTarget || !type) {
      return;
    }

    const logApi = async () => {
      await postApiLogs(`/api/buses/${type}`);
    };

    void logApi();
  }, [redirectTarget, type]);


  const [swiperRef, setSwiperRef] = useState<SwiperClass | null>(null);
  const [hasSwiped, setHasSwiped] = useState(() => {
    return localStorage.getItem("has_swiped") === "true";
  });

  const currentIndex = useMemo(() => {
    const idx = tabList.indexOf(selectedTab);
    return idx === -1 ? 0 : idx;
  }, [selectedTab, tabList]);

  useEffect(() => {
    if (swiperRef && swiperRef.activeIndex !== currentIndex) {
      swiperRef.slideTo(currentIndex);
    }
  }, [currentIndex, swiperRef]);

  const handleSlideChange = (s: SwiperClass) => {
    const nextCategory = tabList[s.activeIndex];

    if (!hasSwiped) {
      setHasSwiped(true);
      localStorage.setItem("has_swiped", "true");
    }

    resetScrollToTop();

    if (nextCategory && nextCategory !== selectedTab) {
      const nextParams = new URLSearchParams(location.search);
      nextParams.set("category", nextCategory);
      navigate(`${location.pathname}?${nextParams.toString()}`, { replace: true });
    }
  };

  // 탭 카테고리 변경 시 강건하게 최상단 스크롤 리셋
  useEffect(() => {
    resetScrollToTop();
  }, [selectedTab]);

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
  }, [selectedTab, swiperRef]);

  const subHeader = useMemo(
    () => (
      <CategorySelectorNew
        categories={tabList}
        selectedCategory={selectedTab}
      />
    ),
    [selectedTab, tabList],
  );

  const menuItems = useMemo<MenuItemType[] | undefined>(() => {
    if (!isSwitchableBusInfoType(type)) {
      return undefined;
    }

    return [
      {
        label: "신 버전으로 사용하기",
        onClick: () => {
          mixpanelTrack.busUiSwitched("new", "Legacy List UI");
          setStoredBusUiVersion("new");
          navigate(
            buildBusUiRoute({
              type,
              category: selectedTab,
              version: "new",
            }),
            { replace: true },
          );
        },
      },
    ];
  }, [navigate, selectedTab, type]);

  useHeader({
    title:
      type === "go-school"
        ? "학교 갈래요"
        : type === "go-home"
          ? "집 갈래요"
          : type === "shuttle"
            ? "셔틀버스"
            : "인입런",
    subHeader,
    menuItems,
    floatingSubHeader: true,
  });

  if (redirectTarget) {
    return null;
  }

  const renderBusComponent = (category: string) => {
    if (type === "go-school" || type === "go-home") {
      return <DynamicLegacyBusTabContent type={type} tabName={category} />;
    } else if (type === "shuttle") {
      if (category === "사범대 셔틀") return <MichuholShuttle />;
      if (category === "인천대입구 셔틀") return <SubwayShuttle />;
      if (category === "통학 셔틀") return <SchoolShuttle />;
    }
    return null;
  };

  return (
    <BusInfoPageWrapper>
      {tabList.length > 0 && (
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
          {tabList.map((category) => (
            <SwiperSlide key={category} style={{ height: "auto" }}>
              <ContentWrapper>
                {renderBusComponent(category)}
              </ContentWrapper>
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      {/* 가로 스와이프 안내 시각 가이드 (스와이프 조작을 한 번도 안 한 최초 진입 시에만 노출) */}
      <SwipeChevronGuides
        hasSwiped={hasSwiped}
        currentIndex={currentIndex}
        totalSlides={tabList.length}
      />
    </BusInfoPageWrapper>
  );
}

const BusInfoPageWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding-bottom: 100px;

  .swiper-autoheight {
    transition: height 0ms !important;
  }

  @media ${DESKTOP_MEDIA} {
    height: 100%;
    min-height: 0;
    padding-bottom: 0;
    overflow: hidden;
  }
`;

const ContentWrapper = styled.div`
  padding: 8px ${MOBILE_PAGE_GUTTER} 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  @media ${DESKTOP_MEDIA} {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 8px 0 20px;
  }
`;


