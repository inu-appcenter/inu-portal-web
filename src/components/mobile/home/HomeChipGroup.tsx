import styled from "styled-components";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import Chip from "src/components/common/Chip";

import TooltipMessage from "@/components/common/TooltipMessage";
import AIIcon from "@/resources/assets/mobile-home/chip/AIIcon.svg";
import CallINU from "@/resources/assets/mobile-home/chip/CallINU.svg";
import Unidorm from "@/resources/assets/mobile-home/chip/Unidorm.svg";
import AppcenterLogo_NoText from "@/resources/assets/앱센터로고_글씨x.png";
import { LuFlaskConical, LuPartyPopper } from "react-icons/lu";
import { useFeatureFlag } from "@/hooks/useFeatureFlags";
import { DESKTOP_MEDIA } from "@/styles/responsive";
import {
  dismissTooltip,
  isTooltipDismissed,
} from "@/utils/dismissibleTooltipStorage";
import { ROUTES } from "@/constants/routes";
import { FEATURE_FLAG_KEYS } from "@/types/featureFlags";
import { mixpanelTrack } from "@/utils/mixpanel";

const FESTIVAL_TOOLTIP_ID = "home-festival-2026";

const HomeChipGroup = () => {
  const navigate = useNavigate();
  const phonebookTooltipAnchorRef = useRef<HTMLDivElement | null>(null);
  const festivalTooltipAnchorRef = useRef<HTMLDivElement | null>(null);
  const { enabled: isLabsEnabled } = useFeatureFlag(FEATURE_FLAG_KEYS.LABS);
  const { enabled: isFestivalEnabled } = useFeatureFlag(
    FEATURE_FLAG_KEYS.FESTIVAL,
  );

  const [isFestivalTooltipVisible, setIsFestivalTooltipVisible] = useState(
    () => {
      return !isTooltipDismissed(FESTIVAL_TOOLTIP_ID);
    },
  );

  const chips = [
    {
      id: "ai",
      iconSrc: AIIcon,
      title: "횃불이 AI",
      onClick: () => {
        mixpanelTrack.featureClicked("횃불이 AI", "Home Chip");
        navigate(`/ai`);
      },
      isAIButton: true,
      isActive: false,
    },
    {
      id: "festival2026",
      iconComponent: LuPartyPopper,
      title: "2026년 대동제: PAINT THE UNION",
      onClick: () => {
        mixpanelTrack.featureClicked(
          "2026년 대동제: PAINT THE UNION",
          "Home Chip",
        );
        navigate(ROUTES.FESTIVAL2026);
      },
      isActive: isFestivalEnabled,
    },
    {
      id: "phonebook",
      iconSrc: CallINU,
      title: "INU 전화번호부",
      onClick: () => {
        mixpanelTrack.featureClicked("INU 전화번호부", "Home Chip");
        navigate(ROUTES.PHONEBOOK.ROOT);
      },
    },

    {
      id: "more-apps",
      iconSrc: AppcenterLogo_NoText,
      title: "앱센터의 다른 앱",
      onClick: () => {
        mixpanelTrack.featureClicked("앱센터의 다른 앱", "Home Chip");
        navigate(ROUTES.MORE_APPS.ROOT);
      },
    },

    {
      id: "lab",
      iconComponent: LuFlaskConical,
      title: "실험실",
      onClick: () => {
        mixpanelTrack.featureClicked("실험실", "Home Chip");
        navigate(ROUTES.LABS.ROOT);
      },
      isActive: isLabsEnabled,
    },

    {
      id: "unidorm",
      iconSrc: Unidorm,
      title: "유니돔",
      isExternalLink: true,
      onClick: () => {
        mixpanelTrack.featureClicked("유니돔", "Home Chip");
        window.open(
          "https://unidorm.inuappcenter.kr",
          "_blank",
          "noopener,noreferrer",
        );
      },
      isActive: false,
    },
  ];

  useEffect(() => {
    if (isFestivalTooltipVisible) {
      mixpanelTrack.promotionImpression("Festival Tooltip", "Home Chip Group");
    }
  }, [isFestivalTooltipVisible]);

  const handleCloseFestivalTooltip = () => {
    mixpanelTrack.promotionClicked(
      "Festival Tooltip",
      "Close Button",
      "Home Chip Group",
    );
    dismissTooltip(FESTIVAL_TOOLTIP_ID);
    setIsFestivalTooltipVisible(false);
  };

  return (
    <MaskContainer>
      <ChipGroupWrapper>
        {chips
          .filter((chip) => chip.isActive !== false)
          .map((chip) => {
            const isPhonebookChip = chip.id === "phonebook";
            const isFestivalChip = chip.id === "festival2026";

            const reserveTooltipSpace =
              isFestivalChip && isFestivalTooltipVisible;

            return (
              <ChipSlot
                key={chip.id}
                $reserveTooltipSpace={reserveTooltipSpace}
              >
                <TooltipAnchor
                  ref={
                    isPhonebookChip
                      ? phonebookTooltipAnchorRef
                      : isFestivalChip
                        ? festivalTooltipAnchorRef
                        : undefined
                  }
                >
                  <Chip
                    iconSrc={chip.iconSrc}
                    iconComponent={chip.iconComponent}
                    title={chip.title}
                    isExternalLink={chip.isExternalLink}
                    isAIButton={chip.isAIButton}
                    onClick={chip.onClick}
                  />
                  {isFestivalChip && isFestivalTooltipVisible && (
                    <TooltipMessage
                      message="2026년 대동제 정보를\n확인해보세요!"
                      onClose={handleCloseFestivalTooltip}
                      position="top"
                      align="center"
                      anchorRef={festivalTooltipAnchorRef}
                    />
                  )}
                </TooltipAnchor>
              </ChipSlot>
            );
          })}
      </ChipGroupWrapper>
    </MaskContainer>
  );
};

export default HomeChipGroup;

const MaskContainer = styled.div`
  position: relative;
  width: 100%;
  overflow: hidden;

  mask-image: linear-gradient(
    to right,
    rgba(0, 0, 0, 1) 88%,
    rgba(0, 0, 0, 0) 100%
  );
  -webkit-mask-image: linear-gradient(
    to right,
    rgba(0, 0, 0, 1) 88%,
    rgba(0, 0, 0, 0) 100%
  );

  @media ${DESKTOP_MEDIA} {
    overflow: visible;
    mask-image: none;
    -webkit-mask-image: none;
  }
`;

const ChipGroupWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;

  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;

  padding: 0 20px 0 2px;

  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }

  @media ${DESKTOP_MEDIA} {
    flex-wrap: wrap;
    overflow: visible;
    padding: 8px 0 12px;
  }
`;

const ChipSlot = styled.div<{ $reserveTooltipSpace: boolean }>`
  display: flex;
  flex: 0 0 auto;
`;

const TooltipAnchor = styled.div`
  position: relative;
  width: fit-content;
`;
