import styled from "styled-components";
import 외부연결버튼 from "@/resources/assets/mobile-home/chip/ExternalLink.svg";
import Ripple from "./Ripple";

interface ChipButtonProps {
  iconSrc?: string;
  iconComponent?: React.ElementType;
  title: string;
  isExternalLink?: boolean;
  isAIButton?: boolean;
  onClick?: () => void;
}

const Chip = ({
  iconSrc,
  iconComponent: IconComponent,
  title,
  isExternalLink,
  isAIButton,
  onClick,
}: ChipButtonProps) => {
  return (
    <ChipWrapper
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      $isAIButton={isAIButton}
    >
      <Ripple />
      <InnerContent>
        {iconSrc && <Icon src={iconSrc} alt="" />}
        {IconComponent && <IconComponent size={18} color="#4071B9" />}
        <ContentArea>
          <div className="title">{title}</div>
          {isExternalLink && <img src={외부연결버튼} />}
        </ContentArea>
      </InnerContent>
    </ChipWrapper>
  );
};

export default Chip;

const InnerContent = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  transition: transform 0.12s ease-in-out;
`;

const ChipWrapper = styled.button<{ $isAIButton?: boolean }>`
  display: flex;
  padding: 8px 12px;
  align-items: center;
  gap: 4px;

  width: fit-content;
  height: fit-content;

  background: ${({ $isAIButton }) =>
    $isAIButton
      ? "linear-gradient(270deg, #EFFFF4 0%, #DEEFFF 67.31%, #FEEDFF 100%)"
      : "#fff"};
  position: relative;
  overflow: hidden;
  outline: none;
  cursor: pointer;

  border-radius: var(--radius-full, 999px);
  border: 1px solid var(--border-default, #e5e8eb);
  background: var(--bg-base, #fff);

  //box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.08);

  &.active-touch {
    ${InnerContent} {
      transform: scale(0.96);
    }
  }
`;

const Icon = styled.img`
  height: 20px;
`;

const ContentArea = styled.div`
  display: flex;
  flex-direction: row;
  gap: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  .title {
    color: #000;
    font-size: 14px;
    font-weight: 600;
  }
`;
