import styled from "styled-components";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import Chip from "src/components/common/Chip";

import TooltipMessage from "@/components/common/TooltipMessage";
import AIIcon from "@/resources/assets/mobile-home/chip/AIIcon.svg";
import CallINU from "@/resources/assets/mobile-home/chip/CallINU.svg";
import Unidorm from "@/resources/assets/mobile-home/chip/Unidorm.svg";
import AppcenterLogo_NoText from "@/resources/assets/앱센터로고_글씨x.png";
import { DESKTOP_MEDIA } from "@/styles/responsive";
import {
  dismissTooltip,
  isTooltipDismissed,
} from "@/utils/dismissibleTooltipStorage";

const PHONEBOOK_TOOLTIP_ID = "home-phonebook-search";

const HomeChipGroup = () => {
  const navigate = useNavigate();
  const phonebookTooltipAnchorRef = useRef<HTMLDivElement | null>(null);
  const [isPhonebookTooltipVisible, setIsPhonebookTooltipVisible] = useState(
    () => !isTooltipDismissed(PHONEBOOK_TOOLTIP_ID),
  );

  const chips = [
    {
      id: "ai",
      iconSrc: AIIcon,
      title: "횃불이 AI",
      onClick: () => {
        navigate(`/ai`);
      },
      isAIButton: true,
      isActive: false,
    },
    {
      id: "phonebook",
      iconSrc: CallINU,
      title: "INU 전화번호부",
      onClick: () => {
        // const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
        //
        // // iOS WebView 판별 (Safari 제외)
        // const isIOSWebView = isIOS && !/Safari/i.test(navigator.userAgent);
        //
        // if (isIOSWebView) {
        //   alert(
        //     "iPhone의 경우 페이지 진입 시 동영상이 전체화면으로 재생되는 문제가 있습니다.\n동영상을 닫고 이용해주세요. 문제를 수정한 앱을 곧 배포하겠습니다.",
        //   );
        // }
        navigate(`/phonebook`);
      },
    },

    {
      id: "more-apps",
      iconSrc: AppcenterLogo_NoText,
      title: "앱센터의 다른 앱",
      onClick: () => {
        navigate(`/more-apps`);
      },
    },

    {
      id: "unidorm",
      iconSrc: Unidorm,
      title: "유니돔",
      isExternalLink: true,
      onClick: () => {
        window.open(
          "https://unidorm.inuappcenter.kr",
          "_blank",
          "noopener,noreferrer",
        );
      },
      isActive: false,
    },
  ];

  const handleClosePhonebookTooltip = () => {
    dismissTooltip(PHONEBOOK_TOOLTIP_ID);
    setIsPhonebookTooltipVisible(false);
  };

  return (
    <MaskContainer>
      <ChipGroupWrapper>
        {chips
          .filter((chip) => chip.isActive !== false)
          .map((chip) => {
            const isPhonebookChip = chip.id === "phonebook";

            return (
              <ChipSlot
                key={chip.id}
                $reserveTooltipSpace={
                  isPhonebookChip && isPhonebookTooltipVisible
                }
              >
                <TooltipAnchor
                  ref={isPhonebookChip ? phonebookTooltipAnchorRef : undefined}
                >
                  <Chip
                    iconSrc={chip.iconSrc}
                    title={chip.title}
                    isExternalLink={chip.isExternalLink}
                    isAIButton={chip.isAIButton}
                    onClick={chip.onClick}
                  />
                  {isPhonebookChip && isPhonebookTooltipVisible && (
                    <TooltipMessage
                      message="신규 기능 오픈!\n원하는 학교 연락처를\n찾아보세요."
                      onClose={handleClosePhonebookTooltip}
                      position="bottom"
                      align="center"
                      anchorRef={phonebookTooltipAnchorRef}
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
