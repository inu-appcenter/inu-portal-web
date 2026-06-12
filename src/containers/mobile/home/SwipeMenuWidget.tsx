import { useEffect, useState, useMemo } from "react";
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
  const [isSwiping, setIsSwiping] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

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

  // 메뉴 텍스트 정규식 추출 (엔터 기준 첫 번째 메뉴만 추출 후 가격 제거)
  const extractMenu = (input: string): string => {
    if (!input) return "";
    const firstLine = input.split(/\r?\n|\\n/)[0].trim();
    const match = firstLine.match(/^(.*?)(?=\s[0-9,]+원|\s\"[0-9,]+원)/);
    return match ? match[1].trim() : firstLine;
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
    if (isDragging) return;
    navigate(`${ROUTES.BOARD.MENU}?category=${cafeteriaName}`);
  };

  return (
    <CardWrapper $isSwiping={isSwiping}>
      <SwiperContainer
        slidesPerView={isSwiping ? 1.08 : 1}
        spaceBetween={isSwiping ? 10 : 0}
        speed={300}
        onSliderMove={() => {
          setIsDragging(true);
          setIsSwiping(true);
        }}
        onTouchEnd={() => {
          setIsSwiping(false);
          setTimeout(() => setIsDragging(false), 50);
        }}
        onTransitionStart={() => setIsSwiping(true)}
        onTransitionEnd={() => {
          setIsSwiping(false);
          setTimeout(() => setIsDragging(false), 50);
        }}
      >
        {cafeterias.map((caf) => {
          const cafData = menuDataList[caf.title];
          const mealInfo = getMealInfo(caf.title, currentHour);

          return (
            <SwiperSlide key={caf.title}>
              <SlideContent $isSwiping={isSwiping} onClick={() => handleCardClick(caf.title)}>
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
    </CardWrapper>
  );
}

// --- Styled Components ---

const CardWrapper = styled.div<{ $isSwiping: boolean }>`
  background: ${({ $isSwiping }) =>
    $isSwiping ? "rgba(255, 255, 255, 0.45)" : "transparent"};
  backdrop-filter: ${({ $isSwiping }) =>
    $isSwiping ? "blur(16px)" : "none"};
  -webkit-backdrop-filter: ${({ $isSwiping }) =>
    $isSwiping ? "blur(16px)" : "none"};
  border: 1px solid
    ${({ $isSwiping }) => ($isSwiping ? "rgba(255, 255, 255, 0.5)" : "transparent")};
  border-radius: 24px;
  padding: ${({ $isSwiping }) => ($isSwiping ? "10px" : "0px")};
  
  box-shadow: ${({ $isSwiping }) =>
    $isSwiping ? "0 0 30px 10px rgba(255, 255, 255, 0.85)" : "none"};
  cursor: pointer;
  position: relative;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  transition: transform 0.25s cubic-bezier(0.25, 0.8, 0.25, 1),
              background 0.25s ease-in-out,
              backdrop-filter 0.25s ease-in-out,
              border 0.25s ease-in-out,
              padding 0.25s cubic-bezier(0.25, 0.8, 0.25, 1),
              box-shadow 0.25s ease-in-out;
              
  transform: ${({ $isSwiping }) => ($isSwiping ? "scale(0.96)" : "scale(1.0)")};

  &:active {
    transform: scale(0.98);
  }
`;

const SwiperContainer = styled(Swiper)`
  overflow: visible;
  width: 100%;
  height: 100%;
`;

const SlideContent = styled.div<{ $isSwiping: boolean }>`
  background-color: #ffffff;
  border-radius: ${({ $isSwiping }) => ($isSwiping ? "16px" : "20px")};
  box-shadow: ${({ $isSwiping }) =>
    $isSwiping ? "0 2px 8px rgba(0, 0, 0, 0.04)" : "0 4px 20px 0 rgba(0, 97, 255, 0.06)"};
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 12px;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  
  transition: border-radius 0.25s ease-in-out, box-shadow 0.25s ease-in-out;
`;

const WidgetHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const WidgetTitle = styled.span`
  color: var(--text-secondary, #333d4b);
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: 24px;
  letter-spacing: -0.2px;
`;

const WidgetSubTitle = styled.span`
  color: var(--text-brand, #0061ff);
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px;
  text-align: right;
`;

const MenuArea = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  flex: 1;
  min-height: 52px; /* 2줄 분량 높이 확보 */
`;

const MenuInfoRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  width: 100%;
`;

const MenuCorner = styled.span`
  color: var(--text-tertiary, #8b95a1);
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px;
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
`;

const SkeletonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
`;
