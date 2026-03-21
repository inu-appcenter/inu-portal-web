import styled from "styled-components";
import { SOFT_PILL_SHADOW } from "@/styles/shadows";
interface CapsuleButtonProps {
  iconSrc: string;
  title: string;
  description: string;
  onClick?: () => void;
  compact?: boolean;
}

const CapsuleButton = ({
  iconSrc,
  title,
  description,
  onClick,
  compact = false,
}: CapsuleButtonProps) => {
  return (
    <CapsuleButtonWrapper onClick={onClick} $compact={compact}>
      <Icon src={iconSrc} alt="" />
      <ContentArea>
        <div className="title">{title}</div>
        <div className="description">{description}</div>
      </ContentArea>
    </CapsuleButtonWrapper>
  );
};

export default CapsuleButton;

const CapsuleButtonWrapper = styled.button<{ $compact: boolean }>`
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
  justify-content: start;
  padding: ${({ $compact }) => ($compact ? "12px 12px" : "16px 12px")};
  box-sizing: border-box;

  border-radius: 50px;
  background: #fff;
  box-shadow: ${SOFT_PILL_SHADOW};

  text-align: start;
`;

const Icon = styled.img``;

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
