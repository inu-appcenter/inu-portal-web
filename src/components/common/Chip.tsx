import styled from "styled-components";
import { ExternalLinkIcon } from "@/resources/assets/icons/mobile-home/chip";
import Ripple from "./Ripple";

interface ChipButtonProps {
  iconSrc?: string;
  iconComponent?: React.ElementType;
  /** iconComponent 색상. 생략 시 기존 동작대로 브랜드 블루(#4071B9). */
  iconColor?: string;
  /** iconComponent 크기(px). 생략 시 기존 동작대로 20(react-icons 기본). */
  iconSize?: number;
  title: string;
  isExternalLink?: boolean;
  isAIButton?: boolean;
  onClick?: () => void;
}

const Chip = ({
  iconSrc,
  iconComponent: IconComponent,
  iconColor = "#4071B9",
  iconSize = 20,
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
        {iconSrc && <Icon src={iconSrc} alt="" $isAIButton={isAIButton} />}
        {IconComponent && (
          <IconComponent
            size={iconSize}
            color={iconColor}
            style={{ width: iconSize, height: iconSize, flexShrink: 0 }}
          />
        )}
        <ContentArea>
          <div className="title">{title}</div>
          {isExternalLink && (
            <ExternalLinkImg aria-hidden="true" />
          )}
        </ContentArea>
      </InnerContent>
    </ChipWrapper>
  );
};

export default Chip;

const InnerContent = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  transition: transform 0.12s ease-in-out;
`;

const ChipWrapper = styled.button<{ $isAIButton?: boolean }>`
  display: flex;
  padding: 8px 14px;
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

const ExternalLinkImg = styled(ExternalLinkIcon)`
  color: #969696;
`;

const Icon = styled.img<{ $isAIButton?: boolean }>`
  width: 22px;
  height: 22px;
  object-fit: contain;
  flex-shrink: 0;
  ${({ $isAIButton }) =>
    $isAIButton &&
    `
    transform: scale(1.28);
  `}
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
