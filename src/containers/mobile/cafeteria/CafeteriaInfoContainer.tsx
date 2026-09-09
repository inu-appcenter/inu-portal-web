import { useMemo } from "react";
import styled from "styled-components";
import { cafeterias } from "@/resources/strings/cafeterias";
import CafeteriaItem from "@/components/mobile/cafeteria/CafeteriaItem";
import { parseCafeteriaSections } from "@/utils/cafeteriaMenu";
import { DESKTOP_MEDIA, MOBILE_PAGE_GUTTER } from "@/styles/responsive";

interface CafeteriaInfoWrapperProps {
  title: string;
  cafeteriaMenus: (string | null)[];
  isLoading: boolean;
}

const MEAL_COUNT = 3;

export default function CafeteriaInfoContainer({
  title,
  cafeteriaMenus,
  isLoading,
}: CafeteriaInfoWrapperProps) {
  // 한 끼니 안에 코너가 여럿이면 코너마다 카드를 만든다.
  const cards = useMemo(() => {
    const mealLabels = cafeterias.find((list) => list.title === title)?.info ?? [];

    return cafeteriaMenus.flatMap((menu, mealIndex) => {
      const mealLabel = mealLabels[mealIndex];
      if (!mealLabel || mealLabel === "없음") {
        return [];
      }
      return parseCafeteriaSections(menu).map((section) => ({
        ...section,
        title: section.title ? `${mealLabel} ${section.title}` : mealLabel,
      }));
    });
  }, [title, cafeteriaMenus]);

  if (isLoading) {
    return (
      <CafeteriaInfoWrapper>
        {Array.from({ length: MEAL_COUNT }, (_, index) => (
          <CafeteriaItem key={index} isLoading />
        ))}
      </CafeteriaInfoWrapper>
    );
  }

  return (
    <CafeteriaInfoWrapper>
      {cards.map((card) => (
        <CafeteriaItem key={card.title} section={card} isLoading={false} />
      ))}
    </CafeteriaInfoWrapper>
  );
}

const CafeteriaInfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;
  padding: 0 ${MOBILE_PAGE_GUTTER};
  //margin: 0 16px;
  min-height: fit-content;
  border-radius: 10px;

  .total-wrapper {
    margin: 20px 0;
  }

  .type-wrapper {
    align-items: center;
    display: flex;
    flex-direction: column;

    .type {
      font-size: 10px;
      font-weight: 500;
      margin: 0;
      text-align: center;
    }

    .time {
      font-size: 8px;
      font-weight: 400;
      color: #969696;
      margin: 0;
    }
  }

  .info-wrapper {
    display: flex;
    align-items: center;
    gap: 20px;

    img {
      width: 38px;
      height: 38px;
    }
  }

  @media ${DESKTOP_MEDIA} {
    width: 100%;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    align-items: stretch;
  }
`;
