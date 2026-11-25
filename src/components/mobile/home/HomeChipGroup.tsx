import styled from "styled-components";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";

import Chip from "@/components/common/Chip";

import TooltipMessage from "@/components/common/TooltipMessage";
import { torchAiLogo as AIIcon } from "@/resources/assets/illustrations/ai";
import {
  CallInuIcon,
  UnidormIcon,
} from "@/resources/assets/icons/mobile-home/chip";
import { map as CampusMapIcon } from "@/resources/assets/illustrations/mobile-home/category-form";
import { appcenterLogoMark as AppcenterLogo_NoText } from "@/resources/assets/illustrations/brand";
import {
  LuArmchair,
  LuCalendarClock,
  LuFlaskConical,
  LuPartyPopper,
  LuRepeat,
} from "react-icons/lu";
import { useFeatureFlag } from "@/hooks/useFeatureFlags";
import { DESKTOP_MEDIA } from "@/styles/responsive";
import { usePromotion } from "@/hooks/usePromotion";
import { PROMOTIONS } from "@/utils/promotion/registry";
import { ROUTES } from "@/constants/routes";
import { FEATURE_FLAG_KEYS } from "@/types/featureFlags";
import { mixpanelTrack } from "@/utils/mixpanel";
import { usePollEntryEnabled } from "@/hooks/usePollAuth";
import { isMobileAppEnvironment } from "@/apis/mobileAgentBridge";

const HomeChipGroup = () => {
  const navigate = useNavigate();
  const phonebookTooltipAnchorRef = useRef<HTMLDivElement | null>(null);
  const festivalTooltipAnchorRef = useRef<HTMLDivElement | null>(null);
  const libraryTooltipAnchorRef = useRef<HTMLDivElement | null>(null);
  const { enabled: isLabsEnabled } = useFeatureFlag(FEATURE_FLAG_KEYS.LABS);
  const { enabled: isFestivalEnabled } = useFeatureFlag(
    FEATURE_FLAG_KEYS.FESTIVAL,
  );

  const isSchedulePollEnabled = usePollEntryEnabled();

  const {
    isVisible: isFestivalTooltipVisible,
    dismiss: dismissFestivalTooltip,
    accept: acceptFestivalTooltip,
  } = usePromotion(PROMOTIONS.HOME_FESTIVAL, { enabled: isFestivalEnabled });

  const {
    isVisible: isLibraryTooltipVisible,
    dismiss: dismissLibraryTooltip,
    accept: acceptLibraryTooltip,
  } = usePromotion(PROMOTIONS.LIBRARY_SEAT_WATCH, {
    enabled: isMobileAppEnvironment(),
  });

  const chips = [
    {
      id: "campus-map",
      iconSrc: CampusMapIcon,
      title: "캠퍼스맵",
      onClick: () => {
        mixpanelTrack.featureClicked("캠퍼스맵", "Home Chip");
        navigate(ROUTES.BOARD.CAMPUS);
      },
    },
    {
      id: "library",
      iconComponent: LuArmchair,
      iconColor: "var(--interactive-primary)",
      iconSize: 22,
      title: "도서관 좌석",
      onClick: () => {
        mixpanelTrack.featureClicked("도서관 좌석", "Home Chip");
        if (isLibraryTooltipVisible) {
          acceptLibraryTooltip("Chip");
        }
        navigate(ROUTES.SERVICES.LIBRARY);
      },
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

        if (isFestivalTooltipVisible) {
          acceptFestivalTooltip("Chip");
        }

        navigate(ROUTES.FESTIVAL2026);
      },
      isActive: isFestivalEnabled,
    },
    {
      id: "schedule-poll",
      iconComponent: LuCalendarClock,
      iconColor: "#4071B9",
      iconSize: 22,
      title: "시간 맞추기",
      onClick: () => {
        mixpanelTrack.featureClicked("시간 맞추기", "Home Chip");
        navigate(ROUTES.SCHEDULE_POLL.LIST);
      },
      isActive: isSchedulePollEnabled,
    },
    {
      id: "phonebook",
      iconComponent: CallInuIcon,
      iconColor: "var(--interactive-primary)",
      iconSize: 22,
      title: "INU 전화번호부",
      onClick: () => {
        mixpanelTrack.featureClicked("INU 전화번호부", "Home Chip");
        navigate(ROUTES.PHONEBOOK.ROOT);
      },
    },
    {
      id: "routine",
      iconComponent: LuRepeat,
      iconColor: "var(--interactive-primary)",
      iconSize: 22,
      title: "루틴",
      onClick: () => {
        mixpanelTrack.featureClicked("루틴", "Home Chip");
        navigate(ROUTES.LABS.ROUTINE);
      },
    },
    {
      id: "ai",
      iconSrc: AIIcon,
      title: "횃불이 AI",
      onClick: () => {
        mixpanelTrack.featureClicked("횃불이 AI", "Home Chip");
        navigate(ROUTES.AI.ROOT);
      },
      isAIButton: true,
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
      iconComponent: UnidormIcon,
      iconColor: "var(--interactive-primary)",
      iconSize: 22,
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

  return (
    <MaskContainer>
      <ChipGroupWrapper>
        {chips
          .filter((chip) => chip.isActive !== false)
          .map((chip) => {
            const isPhonebookChip = chip.id === "phonebook";
            const isFestivalChip = chip.id === "festival2026";
            const isLibraryChip = chip.id === "library";

            const reserveTooltipSpace =
              (isFestivalChip && isFestivalTooltipVisible) ||
              (isLibraryChip && isLibraryTooltipVisible);

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
                        : isLibraryChip
                          ? libraryTooltipAnchorRef
                          : undefined
                  }
                >
                  <Chip
                    iconSrc={chip.iconSrc}
                    iconComponent={chip.iconComponent}
                    iconColor={chip.iconColor}
                    iconSize={chip.iconSize}
                    title={chip.title}
                    isExternalLink={chip.isExternalLink}
                    isAIButton={chip.isAIButton}
                    onClick={chip.onClick}
                  />
                  {isFestivalChip && isFestivalTooltipVisible && (
                    <TooltipMessage
                      message="2026년 대동제 정보를\n확인해보세요!"
                      onClose={dismissFestivalTooltip}
                      position="top"
                      align="center"
                      anchorRef={festivalTooltipAnchorRef}
                    />
                  )}
                  {isLibraryChip && isLibraryTooltipVisible && (
                    <TooltipMessage
                      message="자리 나면 바로 알려드려요\n열람실 빈자리 알림을 켜보세요!"
                      onClose={dismissLibraryTooltip}
                      position="top"
                      align="center"
                      anchorRef={libraryTooltipAnchorRef}
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
