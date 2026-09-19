import { useEffect, useState, useMemo } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { getCafeterias } from "@/apis/cafeterias";
import { getAgentReminders } from "@/apis/agentReminder";
import { cafeterias } from "@/resources/strings/cafeterias";
import { parseCafeteriaSections, firstMenuOf } from "@/utils/cafeteriaMenu";
import { ROUTES } from "@/constants/routes";

interface CafeteriaMenuState {
  name: string;
  mealLabel: string;
  menuSummary: string;
  isOperating: boolean;
}

let cachedMenuMap: Record<string, CafeteriaMenuState> = {};
let cachedSelectedCafeteria: string = "학생식당";

export default function DailyBriefCafeteriaCard() {
  const navigate = useNavigate();
  const hasCached = Object.keys(cachedMenuMap).length > 0;
  const [selectedCafeteria, setSelectedCafeteria] = useState<string>(cachedSelectedCafeteria);
  const [menuMap, setMenuMap] = useState<Record<string, CafeteriaMenuState>>(cachedMenuMap);
  const [isLoading, setIsLoading] = useState<boolean>(!hasCached);

  const todayDay = new Date().getDay(); // 0(일) ~ 6(토)
  const currentHour = useMemo(() => {
    const now = new Date();
    return now.getHours() + now.getMinutes() / 60;
  }, []);

  // 식당별 현재 시간대에 맞는 끼니(조식/중식/석식) 판별
  const getMealSlotForCafeteria = (cafeteriaTitle: string) => {
    const cafMeta = cafeterias.find((c) => c.title === cafeteriaTitle);
    const info = cafMeta?.info ?? ["조식", "중식", "석식"];

    // 아침 (9시 30분 이전)
    if (currentHour < 9.5) {
      if (info[0] && info[0] !== "없음") {
        return { index: 0, label: info[0] };
      }
      // 조식이 없는 식당은 당일 중식을 미리 보여줌
      return { index: 1, label: info[1] || "중식" };
    }
    // 오후 2시 30분 이후는 석식
    if (currentHour >= 14.5) {
      return { index: 2, label: info[2] || "석식" };
    }
    // 점심 (9시 30분 ~ 14시 30분)
    return { index: 1, label: info[1] || "중식" };
  };

  useEffect(() => {
    let isMounted = true;

    const fetchAllCafeterias = async () => {
      if (Object.keys(cachedMenuMap).length === 0) {
        setIsLoading(true);
      }

      // 1. 유저의 맞춤 루틴에 설정된 식당 확인
      let userPreferredCafeteria: string | null = null;
      try {
        const remRes = await getAgentReminders();
        if (remRes.data) {
          const cafReminder = remRes.data.find(
            (r) =>
              r.enabled &&
              (r.targetTool || "").toUpperCase().includes("CAFETERIA") &&
              r.toolParamsJson,
          );
          if (cafReminder?.toolParamsJson) {
            const parsed = JSON.parse(cafReminder.toolParamsJson);
            if (parsed.cafeteria && parsed.cafeteria !== "전체") {
              userPreferredCafeteria = parsed.cafeteria;
            }
          }
        }
      } catch (ignored) {}

      // 2. 전체 식당 데이터 병렬 조회
      const results: Record<string, CafeteriaMenuState> = {};
      let firstOperatingName: string | null = null;

      await Promise.all(
        cafeterias.map(async (caf) => {
          const { index: mealIndex, label: mealLabel } = getMealSlotForCafeteria(caf.title);

          try {
            const res = await getCafeterias(caf.title, todayDay);
            if (!isMounted) return;

            const rawMenu = res.data?.[mealIndex];
            const sections = parseCafeteriaSections(rawMenu);

            if (sections.length > 0) {
              const summaryList = sections
                .map((s) => firstMenuOf(s))
                .filter(Boolean);

              const menuSummary =
                summaryList.length > 0
                  ? summaryList.slice(0, 2).join(" · ")
                  : "오늘은 쉽니다";

              const isOperating = menuSummary !== "오늘은 쉽니다";

              results[caf.title] = {
                name: caf.title,
                mealLabel,
                menuSummary,
                isOperating,
              };

              if (isOperating && !firstOperatingName) {
                firstOperatingName = caf.title;
              }
            } else {
              results[caf.title] = {
                name: caf.title,
                mealLabel,
                menuSummary: "오늘은 쉽니다",
                isOperating: false,
              };
            }
          } catch (error) {
            results[caf.title] = {
              name: caf.title,
              mealLabel,
              menuSummary: "오늘은 쉽니다",
              isOperating: false,
            };
          }
        }),
      );

      cachedMenuMap = results;
      let targetCaf = "학생식당";
      if (userPreferredCafeteria && results[userPreferredCafeteria]) {
        targetCaf = userPreferredCafeteria;
      } else if (firstOperatingName) {
        targetCaf = firstOperatingName;
      }
      cachedSelectedCafeteria = targetCaf;

      if (isMounted) {
        setMenuMap(results);
        setIsLoading(false);
        setSelectedCafeteria((prev) => (results[prev] ? prev : targetCaf));
      }
    };

    fetchAllCafeterias();

    return () => {
      isMounted = false;
    };
  }, [todayDay, currentHour]);

  const currentMenuState = menuMap[selectedCafeteria] || {
    name: selectedCafeteria,
    mealLabel: "중식",
    menuSummary: isLoading ? "식단 정보를 불러오는 중..." : "오늘은 쉽니다",
    isOperating: false,
  };

  const isOperating = currentMenuState.isOperating;

  const handleNavigateToMenu = () => {
    navigate(`${ROUTES.BOARD.MENU}?category=${encodeURIComponent(selectedCafeteria)}`);
  };

  return (
    <SectionWrapper>
      <ContextIntro>
        맛있는 식사와 함께 활기찬 캠퍼스 라이프를 즐겨보세요.
      </ContextIntro>

      <CardContainer onClick={handleNavigateToMenu}>
        <CardHeader>
          <CardBrandTitle>학식 메뉴</CardBrandTitle>
          <CafeteriaIconBadge>{isOperating ? "🍴" : "🍱"}</CafeteriaIconBadge>
        </CardHeader>

        {/* 식당 선택 칩 목록 */}
        <CafeteriaChipList onClick={(e) => e.stopPropagation()}>
          {cafeterias.map((caf) => {
            const state = menuMap[caf.title];
            const isSelected = caf.title === selectedCafeteria;
            const cafOperating = state?.isOperating ?? true;

            return (
              <CafeteriaChip
                key={caf.title}
                type="button"
                $selected={isSelected}
                $isClosed={!cafOperating}
                onClick={() => setSelectedCafeteria(caf.title)}
              >
                <span>{caf.title.replace("(교직원)", "")}</span>
                {!cafOperating && !isSelected && <ClosedDot />}
              </CafeteriaChip>
            );
          })}
        </CafeteriaChipList>

        <MediaContentRow>
          <ThumbnailBox $isOperating={isOperating}>
            <ThumbnailArt>{isOperating ? "🍱" : "🌙"}</ThumbnailArt>
            <ThumbnailTag>
              {isOperating
                ? `${selectedCafeteria} ${currentMenuState.mealLabel}`
                : "휴무"}
            </ThumbnailTag>
          </ThumbnailBox>

          <MenuMetaCol>
            <MenuTitle $isClosed={!isOperating}>
              {currentMenuState.menuSummary}
            </MenuTitle>
            <MenuSubtitle>
              {isOperating
                ? `${selectedCafeteria} ${currentMenuState.mealLabel} 추천`
                : `${selectedCafeteria} 오늘은 식당을 운영하지 않아요`}
            </MenuSubtitle>
          </MenuMetaCol>
        </MediaContentRow>

        <BlackActionButton
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleNavigateToMenu();
          }}
        >
          {selectedCafeteria} 식단표 보러가기
        </BlackActionButton>
      </CardContainer>
    </SectionWrapper>
  );
}

const SectionWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
`;

const ContextIntro = styled.p`
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  padding: 0 4px;
  letter-spacing: -0.3px;
  line-height: 1.35;
`;

const CardContainer = styled.div`
  background: rgba(255, 255, 255, 0.65);
  border-radius: 28px;
  padding: 22px 20px;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.04),
    0 1px 3px rgba(0, 0, 0, 0.02);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CardBrandTitle = styled.h2`
  font-size: 17px;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.5px;
  margin: 0;
`;

const CafeteriaIconBadge = styled.span`
  font-size: 22px;
`;

const CafeteriaChipList = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 2px;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const CafeteriaChip = styled.button<{
  $selected: boolean;
  $isClosed?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12.5px;
  font-weight: ${({ $selected }) => ($selected ? "700" : "500")};
  white-space: nowrap;
  cursor: pointer;
  border: 1px solid
    ${({ $selected }) => ($selected ? "#111827" : "#E5E7EB")};
  background-color: ${({ $selected }) =>
    $selected ? "#111827" : "#F9FAFB"};
  color: ${({ $selected, $isClosed }) =>
    $selected ? "#FFFFFF" : $isClosed ? "#9CA3AF" : "#374151"};
  transition: all 0.15s ease;
  flex-shrink: 0;

  &:hover {
    background-color: ${({ $selected }) =>
      $selected ? "#111827" : "#F3F4F6"};
  }
`;

const ClosedDot = styled.span`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background-color: #d1d5db;
`;

const MediaContentRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ThumbnailBox = styled.div<{ $isOperating: boolean }>`
  width: 105px;
  height: 105px;
  border-radius: 18px;
  background: ${({ $isOperating }) =>
    $isOperating
      ? "linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)"
      : "linear-gradient(135deg, #4b5563 0%, #1f2937 100%)"};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const ThumbnailArt = styled.span`
  font-size: 36px;
`;

const ThumbnailTag = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: #e0e7ff;
  letter-spacing: -0.2px;
  max-width: 90px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
`;

const MenuMetaCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 0;
`;

const MenuTitle = styled.h3<{ $isClosed?: boolean }>`
  font-size: 17px;
  font-weight: 800;
  color: ${({ $isClosed }) => ($isClosed ? "#6b7280" : "#111827")};
  letter-spacing: -0.4px;
  line-height: 1.35;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const MenuSubtitle = styled.span`
  font-size: 13.5px;
  font-weight: 500;
  color: #6b7280;
  line-height: 1.35;
`;

const BlackActionButton = styled.button`
  width: 100%;
  height: 48px;
  border-radius: 24px;
  background: #000000;
  border: none;
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.2px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;

  &:active {
    background: #27272a;
  }
`;
