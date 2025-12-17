import styled from "styled-components";
import Chip from "src/components/common/Chip";

import AIIcon from "@/resources/assets/mobile-home/chip/AIIcon.svg";
import CallINU from "@/resources/assets/mobile-home/chip/CallINU.svg";
import Unidorm from "@/resources/assets/mobile-home/chip/Unidorm.svg";
import { useNavigate } from "react-router-dom";

const HomeChipGroup = () => {
  const navigate = useNavigate();
  const chips = [
    {
      iconSrc: AIIcon,
      title: "횃불이 AI",
      onClick: () => {
        navigate(`/ai`);
      },
      isAIButton: true,
    },
    {
      iconSrc: CallINU,
      title: "INU 전화번호부",
    },
    {
      iconSrc: Unidorm,
      title: "유니돔",
      isExternalLink: "true",
    },
  ];

  return (
    <MaskContainer>
      <ChipGroupWrapper>
        {chips.map((chip, index) => (
          <Chip
            key={index}
            iconSrc={chip.iconSrc}
            title={chip.title}
            isExternalLink={chip.isExternalLink}
            isAIButton={chip.isAIButton}
            onClick={chip.onClick}
          />
        ))}
      </ChipGroupWrapper>
    </MaskContainer>
  );
};

export default HomeChipGroup;

/* 마스킹 효과 컨테이너 */
const MaskContainer = styled.div`
  position: relative;
  width: 100%;
  overflow: hidden;

  /* 우측 끝부분을 투명하게 처리 (배경색 무관) */
  mask-image: linear-gradient(
    to right,
    rgba(0, 0, 0, 1) 90%,
    rgba(0, 0, 0, 0) 100%
  );
  -webkit-mask-image: linear-gradient(
    to right,
    rgba(0, 0, 0, 1) 90%,
    rgba(0, 0, 0, 0) 100%
  );
`;

const ChipGroupWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;

  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;

  padding: 4px 0;

  /* 마스크에 가려지는 영역 보정 */
  padding-right: 20px;

  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }
`;
