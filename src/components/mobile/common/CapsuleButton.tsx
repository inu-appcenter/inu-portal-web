import type { FC, SVGProps } from "react";
import styled from "styled-components";
import { SOFT_PILL_SHADOW } from "@/styles/shadows";
import Ripple from "@/components/common/Ripple";

interface CapsuleButtonProps {
  /** 이미지 URL(webp/png 등) 또는 currentColor 벡터 아이콘 컴포넌트(svg?react). */
  iconSrc: string | FC<SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  onClick?: () => void;
  compact?: boolean;
  /** iconSrc가 벡터 컴포넌트일 때 적용할 색. 기본값은 원본 아이콘 색과 무관하게 렌더링되므로 항상 명시할 것. */
  iconColor?: string;
}

const CapsuleButton = ({
  iconSrc,
  title,
  description,
  onClick,
  compact = false,
  iconColor,
}: CapsuleButtonProps) => {
  return (
    <CapsuleButtonWrapper onClick={onClick} $compact={compact}>
      <Ripple />
      <InnerContent>
        {typeof iconSrc === "string" ? (
          <Icon src={iconSrc} alt="" />
        ) : (
          <VectorIcon as={iconSrc} aria-hidden="true" $color={iconColor} />
        )}
        <ContentArea>
          <div className="title">{title}</div>
          <div className="description">{description}</div>
        </ContentArea>
      </InnerContent>
    </CapsuleButtonWrapper>
  );
};

export default CapsuleButton;

const InnerContent = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
  justify-content: start;
  width: 100%;
  transition: transform 0.12s ease-in-out;
`;

const CapsuleButtonWrapper = styled.button<{ $compact: boolean }>`
  display: flex;
  padding: ${({ $compact }) => ($compact ? "12px 12px" : "16px 12px")};
  box-sizing: border-box;

  border-radius: 50px;
  background: #fff;
  box-shadow: ${SOFT_PILL_SHADOW};

  text-align: start;
  
  position: relative;
  overflow: hidden;
  border: none;
  outline: none;
  cursor: pointer;

  &.active-touch {
    ${InnerContent} {
      transform: scale(0.96);
    }
  }
`;

const Icon = styled.img``;

const VectorIcon = styled.svg<{ $color?: string }>`
  width: 24px;
  height: 24px;
  color: ${({ $color }) => $color ?? "inherit"};
`;

const ContentArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  .title {
    color: #000;
    font-size: 14px;
    font-style: normal;
    font-weight: 600;
  }
  .description {
    overflow: hidden;
    color: #969696;
    text-overflow: ellipsis;
    font-size: 12px;
    font-style: normal;
    font-weight: 500;
  }
`;
