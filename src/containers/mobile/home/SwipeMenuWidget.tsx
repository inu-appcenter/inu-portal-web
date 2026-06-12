import { useEffect, useState, useMemo, useRef } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { getCafeterias } from "@/apis/cafeterias";
import { cafeterias } from "@/resources/strings/cafeterias";
import { ROUTES } from "@/constants/routes";
import Skeleton from "@/components/common/Skeleton";

interface MenuData {
  title: string;
  menus: (string | null)[];
  isLoading: boolean;
}

export default function SwipeMenuWidget() {
  const navigate = useNavigate();
  const [menuDataList, setMenuDataList] = useState<Record<string, MenuData>>({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [swiperInstance, setSwiperInstance] = useState<any>(null);
  const cardWrapperRef = useRef<HTMLDivElement>(null);
  const paginationRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const hasMovedRef = useRef(false);
  const fadeTimeoutRef = useRef<any>(null);

  const showPagination = () => {
    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current);
    }
    paginationRef.current?.classList.add("show");
    fadeTimeoutRef.current = setTimeout(() => {
      paginationRef.current?.classList.remove("show");
    }, 1000);
  };

  useEffect(() => {
    showPagination();
    return () => {
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
      }
    };
  }, []);

  // 날짜 및 시간 구하기
  const today = useMemo(() => new Date().getDay(), []);
  const currentHour = useMemo(() => {
    const now = new Date();
    return now.getHours() + now.getMinutes() / 60;
  }, []);

  // 식사 시간대별 인덱스 및 라벨 매핑
  const getMealInfo = (cafeteriaName: string, hour: number): { indices: number[]; label: string } => {
    if (cafeteriaName === "학생식당") {
      if (hour >= 14.5) {
        return { indices: [2], label: "석식" };
      } else {
        return { indices: [0, 1], label: "중식" };
      }
    }

    const hasBreakfast =
      cafeteriaName === "제1기숙사식당" || cafeteriaName === "27호관식당";

    if (hasBreakfast && hour < 9.5) {
      return { indices: [0], label: "조식" };
    } else if (hour >= 14.5) {
      return { indices: [2], label: "석식" };
    } else {
      return { indices: [1], label: "중식" };
    }
  };

  // 학생식당 코너 라벨 변환
  const getCornerLabel = (cafeteriaName: string, index: number): string => {
    if (cafeteriaName === "학생식당") {
      if (index === 0) return "1코너 (백반)";
      if (index === 1) return "2코너 (일품)";
      return "석식";
    }
    if (index === 0) return "조식";
    if (index === 1) return "중식";
    return "석식";
  };

  // 메뉴 텍스트 추출 (가격/칼로리 정보 제거 후 공백(" ") 기준 첫 번째 메뉴만 추출)
  const extractMenu = (input: string): string => {
    if (!input) return "";
    
    // 1. 가격 및 칼로리 제거를 위해 가격 매칭 전까지만 추출
    const match = input.match(/^(.*?)(?=\s[0-9,]+원|\s\"[0-9,]+원)/);
    const cleanText = match ? match[1].trim() : input.trim();
    
    // 2. MobileMenuPage/CafeteriaItem이 공백(" ")을 기준으로 줄바꿈하는 것을 참고하여
    //    공백(" ")으로 쪼갠 뒤 가장 첫 번째 메뉴(index 0)만 추출
    const firstMenu = cleanText.split(/\s+/)[0];
    
    return firstMenu ? firstMenu.trim() : cleanText;
  };

  // 식단표 데이터 병렬 페칭
  useEffect(() => {
    const fetchAllMenus = async () => {
      // 초기 상태 로딩 설정
      const initialStates: Record<string, MenuData> = {};
      cafeterias.forEach((caf) => {
        initialStates[caf.title] = { title: caf.title, menus: [], isLoading: true };
      });
      setMenuDataList(initialStates);

      const promises = cafeterias.map(async (caf) => {
        try {
          const response = await getCafeterias(caf.title, today);
          setMenuDataList((prev) => ({
            ...prev,
            [caf.title]: {
              title: caf.title,
              menus: response.data,
              isLoading: false,
            },
          }));
        } catch (error) {
          console.error(`${caf.title} 식단 조회 실패`, error);
          setMenuDataList((prev) => ({
            ...prev,
            [caf.title]: {
              title: caf.title,
              menus: [],
              isLoading: false,
            },
          }));
        }
      });

      await Promise.all(promises);
    };

    fetchAllMenus();
  }, [today]);

  const handleCardClick = (cafeteriaName: string) => {
    if (isDraggingRef.current) return;
    navigate(`${ROUTES.BOARD.MENU}?category=${cafeteriaName}`);
  };

  return (
    <CardWrapper ref={cardWrapperRef}>
      <SwiperContainer
        slidesPerView={1}
        spaceBetween={0}
        speed={300}
        onSwiper={(swiper) => setSwiperInstance(swiper)}
        onSlideChange={(swiper) => {
          setActiveIndex(swiper.activeIndex);
          showPagination();
        }}
        onTouchStart={() => {
          hasMovedRef.current = false;
          cardWrapperRef.current?.classList.add("swiping");
          showPagination();
        }}
        onSliderMove={() => {
          hasMovedRef.current = true;
          isDraggingRef.current = true;
          showPagination();
        }}
        onTransitionStart={() => {
          // 빠른 Flick(휙 넘기기) 시 onSliderMove 누락 감지를 보완하고 스와이프 클래스를 보장합니다.
          hasMovedRef.current = true;
          isDraggingRef.current = true;
          cardWrapperRef.current?.classList.add("swiping");
          showPagination();
        }}
        onTouchEnd={() => {
          if (!hasMovedRef.current) {
            cardWrapperRef.current?.classList.remove("swiping");
          }
          setTimeout(() => {
            isDraggingRef.current = false;
          }, 100);
        }}
        onTransitionEnd={() => {
          cardWrapperRef.current?.classList.remove("swiping");
          isDraggingRef.current = false;
        }}
      >
        {cafeterias.map((caf) => {
          const cafData = menuDataList[caf.title];
          const mealInfo = getMealInfo(caf.title, currentHour);

          return (
            <SwiperSlide key={caf.title}>
              <SlideContent onClick={() => handleCardClick(caf.title)}>
                <WidgetHeader>
                  <WidgetTitle>식당 메뉴</WidgetTitle>
                  <WidgetSubTitle>{caf.title}</WidgetSubTitle>
                </WidgetHeader>

                <MenuArea>
                  {cafData?.isLoading ? (
                    <SkeletonContainer>
                      <Skeleton width={60} height={14} />
                      <Skeleton width="90%" height={16} />
                    </SkeletonContainer>
                  ) : (
                    mealInfo.indices.map((index) => {
                      const rawMenu = cafData?.menus?.[index];
                      const cleanMenu = rawMenu ? extractMenu(rawMenu) : "";
                      const hasMenu = cleanMenu && cleanMenu !== "없음" && cleanMenu.trim() !== "";

                      return (
                        <MenuInfoRow key={index}>
                          <MenuCorner>
                            {getCornerLabel(caf.title, index)}
                          </MenuCorner>
                          <MenuName $isEmpty={!hasMenu}>
                            {hasMenu ? cleanMenu : "메뉴 정보가 없습니다."}
                          </MenuName>
                        </MenuInfoRow>
                      );
                    })
                  )}
                </MenuArea>
              </SlideContent>
            </SwiperSlide>
          );
        })}
      </SwiperContainer>

      <PaginationDots ref={paginationRef} aria-label="식당 메뉴 위젯 페이지네이션">
        {cafeterias.map((caf, index) => (
          <PaginationDot
            key={caf.title}
            type="button"
            $active={index === activeIndex}
            onClick={() => {
              swiperInstance?.slideTo(index);
            }}
            aria-label={`${caf.title} 식단 보기`}
            aria-current={index === activeIndex}
          />
        ))}
      </PaginationDots>
    </CardWrapper>
  );
}

// --- Styled Components ---

const CardWrapper = styled.div`
  background: transparent;
  border: 1px solid transparent;
  border-radius: 24px;
  padding: 0px;
  box-shadow: none;
  
  cursor: pointer;
  position: relative;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  will-change: transform, background-color, border-color, box-shadow;

  transition: transform 0.25s cubic-bezier(0.25, 0.8, 0.25, 1),
              background-color 0.25s ease-in-out,
              border-color 0.25s ease-in-out,
              box-shadow 0.25s ease-in-out;
              
  transform: scale(1.0);

  &:active {
    transform: scale(0.98);
  }

  &.swiping {
    background-color: rgba(255, 255, 255, 0.35);
    border-color: rgba(255, 255, 255, 0.6);
    box-shadow: none;
    transform: scale(0.98);
  }
`;

const SwiperContainer = styled(Swiper)`
  overflow: visible;
  width: 100%;
  height: 100%;
`;

const SlideContent = styled.div`
  background-color: #ffffff;
  border-radius: 20px;
  box-shadow: 0 4px 20px 0 rgba(0, 97, 255, 0.06);
  display: flex;
  flex-direction: column;
  padding: 16px 16px 24px 16px;
  gap: 12px;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-width: 0;
  
  transform: scale(1.0);
  transform-origin: center center;
  
  transition: transform 0.25s cubic-bezier(0.25, 0.8, 0.25, 1),
              border-radius 0.25s ease-in-out,
              box-shadow 0.25s ease-in-out;

  /* CardWrapper가 swiping 클래스를 가지고 있을 때 내부 SlideContent 축소 */
  .swiping & {
    border-radius: 16px;
    box-shadow: none;
    transform: scale(0.95);
  }
`;

const PaginationDots = styled.div`
  position: absolute;
  left: 50%;
  bottom: 8px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 6px;
  transform: translateX(-50%);
  
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease-in-out;

  &.show {
    opacity: 1;
    pointer-events: auto;
  }
`;

const PaginationDot = styled.button<{ $active: boolean }>`
  display: block;
  flex: 0 0 auto;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: ${(props) =>
    props.$active
      ? "var(--text-brand, #0061ff)"
      : "rgba(0, 0, 0, 0.15)"};
  transition:
    transform 0.2s ease,
    background-color 0.2s ease;
  transform: ${(props) => (props.$active ? "scale(1.15)" : "scale(1.0)")};
  border: none;
  padding: 0;
  cursor: pointer;
`;

const WidgetHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  min-width: 0;
  gap: 8px;
`;

const WidgetTitle = styled.span`
  color: var(--text-secondary, #333d4b);
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: 24px;
  letter-spacing: -0.2px;
  white-space: nowrap;
  flex-shrink: 0;
`;

const WidgetSubTitle = styled.span`
  color: var(--text-brand, #0061ff);
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px;
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
`;

const MenuArea = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  flex: 1;
  min-height: 52px; /* 2줄 분량 높이 확보 */
  min-width: 0;
`;

const MenuInfoRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  width: 100%;
  min-width: 0;
`;

const MenuCorner = styled.span`
  color: var(--text-tertiary, #8b95a1);
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
`;

const MenuName = styled.span<{ $isEmpty: boolean }>`
  color: ${({ $isEmpty }) =>
    $isEmpty ? "var(--text-disabled, #b0b8c1)" : "var(--text-secondary, #333d4b)"};
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 24px;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
  display: block;
`;

const SkeletonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
`;
