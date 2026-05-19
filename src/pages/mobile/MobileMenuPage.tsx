import styled from "styled-components";
import { useEffect, useMemo, useState } from "react";
import { getCafeterias } from "@/apis/cafeterias";
import CafeteriaInfoContainer from "@/containers/mobile/cafeteria/CafeteriaInfoContainer";
import CafeteriaTitleContainer from "@/containers/mobile/cafeteria/CafeteriaTitleContainer";
import { useHeader } from "@/context/HeaderContext";
import CategorySelectorNew from "@/components/mobile/common/CategorySelectorNew";
import SwipeChevronGuides from "@/components/mobile/common/SwipeChevronGuides";
import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperClass } from "swiper";
import "swiper/css";
import {
  DESKTOP_CONTENT_MAX_WIDTH,
  DESKTOP_MEDIA,
} from "@/styles/responsive";
import { cafeterias } from "@/resources/strings/cafeterias";
import { useLocation, useNavigate } from "react-router-dom";
import { mixpanelTrack } from "@/utils/mixpanel";
import { resetScrollToTop } from "@/utils/scroll";

interface CafeteriaDetail {
  구성원가: string;
  칼로리: string;
}

interface CafeteriaListContentProps {
  cafeteria: string;
  nowday: number;
  weekDates: { dayName: string; date: string }[];
  onDayChange: (day: number) => void;
}

const CafeteriaListContent = ({
  cafeteria,
  nowday,
  weekDates,
  onDayChange,
}: CafeteriaListContentProps) => {
  const [cafeteriaDetail, setCafeteriaDetail] = useState<(CafeteriaDetail | null)[]>([]);
  const [cafeteriaInfo, setCafeteriaInfo] = useState<(string | null)[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCafeteriaData = async (date: number) => {
    try {
      setIsLoading(true);
      const response = await getCafeterias(cafeteria, date);
      const processedData = response.data.map((info: string) =>
        extractValues(info),
      );
      const infoData = response.data.map((info: string) => extractMenu(info));
      setCafeteriaInfo(infoData);
      setCafeteriaDetail(processedData);
      setIsLoading(false);

      const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
      mixpanelTrack.cafeteriaViewed(cafeteria, dayNames[date]);
    } catch (error) {
      console.error("학식 메뉴 가져오기 실패", error);
    }
  };

  const extractValues = (input: string): CafeteriaDetail | null => {
    const price = input.match(/([0-9,]+)원/);
    const calory = input.match(/[0-9,]+kcal/);
    if (price && calory) {
      return {
        구성원가: price[0],
        칼로리: calory[0],
      };
    }
    return null;
  };

  const extractMenu = (input: string): string | null => {
    const match = input.match(/^(.*?)(?=\s[0-9,]+원|\s\"[0-9,]+원)/);
    return match ? match[1].trim() : input;
  };

  useEffect(() => {
    fetchCafeteriaData(nowday);
  }, [cafeteria, nowday]);

  // 카테고리 로딩 완료 시 강건하게 최상단 스크롤 리셋
  useEffect(() => {
    resetScrollToTop();
  }, [cafeteria, isLoading]);

  return (
    <>
      <CafeteriaTitleContainer
        title={cafeteria}
        nowday={nowday}
        setNowDay={onDayChange}
        weekDates={weekDates}
      />
      <CafeteriaInfoContainer
        title={cafeteria}
        cafeteriaDetail={cafeteriaDetail}
        cafeteriaInfo={cafeteriaInfo}
        isLoading={isLoading}
      />
    </>
  );
};

export default function MobileMenuPage() {
  const [nowday, setNowDay] = useState(new Date().getDay());
  const [weekDates, setWeekDates] = useState<
    { dayName: string; date: string }[]
  >([]);
  const date = new Date();
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const selectedCafeteria = params.get("category") || "학생식당";

  useEffect(() => {
    setWeekDates(getWeekDates(date)); // 주의 날짜 설정
  }, []);

  const getWeekDates = (date: Date): { dayName: string; date: string }[] => {
    const weekDates = [];
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    const currentDay = date.getDay();
    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(date);
    monday.setDate(date.getDate() + diffToMonday);

    for (let i = 0; i < 7; i++) {
      const weekDate = new Date(monday);
      weekDate.setDate(monday.getDate() + i);
      weekDates.push({
        dayName: days[weekDate.getDay()],
        date: `${weekDate.getDate()}`,
      });
    }
    return weekDates;
  };

  const cafeteriaCategories = useMemo(
    () => cafeterias.map((cafeteria) => cafeteria.title),
    [],
  );

  const [swiperRef, setSwiperRef] = useState<SwiperClass | null>(null);
  const [hasSwiped, setHasSwiped] = useState(() => {
    return localStorage.getItem("has_swiped_menu_list") === "true";
  });

  const currentIndex = useMemo(() => {
    const idx = cafeteriaCategories.indexOf(selectedCafeteria);
    return idx === -1 ? 0 : idx;
  }, [selectedCafeteria, cafeteriaCategories]);

  useEffect(() => {
    if (swiperRef && swiperRef.activeIndex !== currentIndex) {
      swiperRef.slideTo(currentIndex);
    }
  }, [currentIndex, swiperRef]);

  // 데이터나 날짜 변경 시 돔 리플로우 완료 시점을 대비한 스위퍼 리사이징 수동 업데이트 트리거
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
  }, [selectedCafeteria, nowday, swiperRef]);

  const handleSlideChange = (s: SwiperClass) => {
    const nextCategory = cafeteriaCategories[s.activeIndex];

    if (!hasSwiped) {
      setHasSwiped(true);
      localStorage.setItem("has_swiped_menu_list", "true");
    }

    resetScrollToTop();

    if (nextCategory && nextCategory !== selectedCafeteria) {
      const nextParams = new URLSearchParams(location.search);
      nextParams.set("category", nextCategory);
      navigate(`${location.pathname}?${nextParams.toString()}`, { replace: true });
    }
  };

  const subHeader = useMemo(
    () => (
      <CategorySelectorNew
        categories={cafeteriaCategories}
        selectedCategory={selectedCafeteria}
      />
    ),
    [cafeteriaCategories, selectedCafeteria],
  );

  // 헤더 설정 주입
  useHeader({
    title: "식당 메뉴",
    subHeader,
    floatingSubHeader: true,
  });

  return (
    <CafeteriaWrapper>
      {cafeteriaCategories.length > 0 && (
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
          {cafeteriaCategories.map((cafeteria) => (
            <SwiperSlide key={cafeteria} style={{ height: "auto" }}>
              <CafeteriaListContent
                cafeteria={cafeteria}
                nowday={nowday}
                weekDates={weekDates}
                onDayChange={setNowDay}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      {/* 가로 스와이프 안내 시각 가이드 (스와이프 조작을 한 번도 안 한 최초 진입 시에만 노출) */}
      <SwipeChevronGuides
        hasSwiped={hasSwiped}
        currentIndex={currentIndex}
        totalSlides={cafeteriaCategories.length}
      />
    </CafeteriaWrapper>
  );
}

const CafeteriaWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  gap: 16px;

  padding-top: 12px;

  .swiper-autoheight {
    transition: height 0ms !important;
  }

  @media ${DESKTOP_MEDIA} {
    width: min(100%, ${DESKTOP_CONTENT_MAX_WIDTH});
    margin: 0 auto;
    gap: 24px;
    padding-top: 16px;
    padding-bottom: 48px;
  }
`;


