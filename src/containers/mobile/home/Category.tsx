import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useRef, useState, type RefObject, useEffect } from "react";

import menuImg from "@/resources/assets/mobile-home/category-form/menu.svg";
import noticeImg from "@/resources/assets/mobile-home/category-form/notice.svg";
import tipImg from "@/resources/assets/mobile-home/category-form/tip.svg";
import calendarImg from "@/resources/assets/mobile-home/category-form/calendar.svg";
import mapImg from "@/resources/assets/mobile-home/category-form/map.svg";
import clubImg from "@/resources/assets/mobile-home/category-form/club.svg";
import busImg from "@/resources/assets/mobile-home/category-form/bus.svg";
import schoolNoticeImg from "@/resources/assets/mobile-home/category-form/school-notice.svg";
import { DESKTOP_MEDIA } from "@/styles/responsive";
import { SOFT_CARD_SHADOW } from "@/styles/shadows";
import TooltipMessage, {
  type TooltipAlign,
  type TooltipPosition,
} from "@/components/common/TooltipMessage";
import {
  dismissTooltip,
  isTooltipDismissed,
} from "@/utils/dismissibleTooltipStorage";
import { mixpanelTrack } from "@/utils/mixpanel";

type CategoryTooltip = {
  id: string;
  message: string;
  position?: TooltipPosition;
  align?: TooltipAlign;
  width?: string;
  minWidth?: string;
};

type CategoryItem = {
  title: string;
  img: string;
  href: string;
  isNew?: boolean;
  tooltip?: CategoryTooltip;
};

const categories: CategoryItem[] = [
  { title: "식당 메뉴", img: menuImg, href: "/home/menu" },
  {
    title: "학교 공지",
    img: schoolNoticeImg,
    href: "/home/notice",
    tooltip: {
      id: "school-notice-tooltip",
      message: "학교 공지 알리미 오픈!",
      position: "top",
      align: "right",
      width: "max-content",
    },
  },
  {
    title: "학과 공지",
    img: noticeImg,
    href: "/home/deptnotice",
    isNew: false,
  },
  {
    title: "학사 일정",
    img: calendarImg,
    href: "/home/calendar",
    tooltip: {
      id: "academic-calendar-tooltip",
      message: "[횃불이 AI]\n내 학과 일정도\n한 눈에 확인해보세요!",
      position: "top",
      align: "right",
      width: "max-content",
    },
  },
  { title: "캠퍼스맵", img: mapImg, href: "/home/campus" },
  { title: "동아리", img: clubImg, href: "/home/club" },
  { title: "TIPS", img: tipImg, href: "/home/tips" },
  { title: "인입런", img: busImg, href: "/bus", isNew: false },
];

export default function CategoryForm() {
  const navigate = useNavigate();

  const tooltipRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [visibleTooltips, setVisibleTooltips] = useState<
    Record<string, boolean>
  >(() =>
    categories.reduce(
      (acc, category) => {
        if (category.tooltip) {
          acc[category.tooltip.id] = !isTooltipDismissed(category.tooltip.id);
        }
        return acc;
      },
      {} as Record<string, boolean>,
    ),
  );

  const handleCloseTooltip = (tooltipId: string) => {
    mixpanelTrack.promotionClicked(tooltipId, "Close Button", "Home Category");
    dismissTooltip(tooltipId);
    setVisibleTooltips((prev) => ({
      ...prev,
      [tooltipId]: false,
    }));
  };

  useEffect(() => {
    Object.entries(visibleTooltips).forEach(([id, visible]) => {
      if (id && visible) {
        mixpanelTrack.promotionImpression(id, "Home Category");
      }
    });
  }, []);

  return (
    <CategoryFormWrapper>
      {categories.map((category) => {
        const tooltip = category.tooltip;
        const anchorRef = tooltip
          ? ({
              get current() {
                return tooltipRefs.current[tooltip.id];
              },
            } as RefObject<HTMLDivElement | null>)
          : undefined;

        return (
          <TooltipAnchor
            key={category.title}
            ref={(el) => {
              if (tooltip) {
                tooltipRefs.current[tooltip.id] = el;
              }
            }}
          >
            <CategoryCard
              type="button"
              onClick={() => {
                mixpanelTrack.featureClicked(category.title, "Home Category");
                navigate(category.href);
              }}
            >
              <IconWrapper>
                <img src={category.img} alt={`${category.title} 아이콘`} />
                {category.isNew && <NewBadge>NEW!</NewBadge>}
              </IconWrapper>
              <CategoryLabel>{category.title}</CategoryLabel>
            </CategoryCard>

            {tooltip && visibleTooltips[tooltip.id] && (
              <TooltipMessage
                message={tooltip.message}
                onClose={() => handleCloseTooltip(tooltip.id)}
                position={tooltip.position}
                align={tooltip.align}
                width={tooltip.width}
                minWidth={tooltip.minWidth}
                anchorRef={anchorRef}
              />
            )}
          </TooltipAnchor>
        );
      })}
    </CategoryFormWrapper>
  );
}

const CategoryFormWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px 12px;
  width: 100%;
  padding: 16px;
  border-radius: 20px;
  background: #fff;
  box-shadow: ${SOFT_CARD_SHADOW};

  @media ${DESKTOP_MEDIA} {
    grid-template-columns: repeat(8, minmax(0, 1fr));
    gap: 20px 16px;
    padding: 24px;
  }
`;

const CategoryCard = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-width: 0;

  @media ${DESKTOP_MEDIA} {
    gap: 14px;
  }
`;

const CategoryLabel = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: #121212;
  text-align: center;
  word-break: keep-all;

  @media ${DESKTOP_MEDIA} {
    font-size: 14px;
  }
`;

const IconWrapper = styled.div`
  position: relative;
  width: 40px;
  height: 40px;

  img {
    width: 100%;
    height: 100%;
  }

  @media ${DESKTOP_MEDIA} {
    width: 48px;
    height: 48px;
  }
`;

const NewBadge = styled.span`
  position: absolute;
  top: -6px;
  right: -16px;
  background-color: #4f9cff;
  color: white;
  font-size: 10px;
  font-weight: bold;
  border-radius: 9999px;
  padding: 2px 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);
`;

const TooltipAnchor = styled.div`
  position: relative;
  justify-self: center;
  width: fit-content;
`;
