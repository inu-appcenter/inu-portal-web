import styled from "styled-components";
import 외부연결버튼 from "@/resources/assets/mobile-home/chip/ExternalLink.svg";

interface ChipButtonProps {
  iconSrc: string;
  title: string;
  isExternalLink?: boolean;
  isAIButton?: boolean;
  onClick?: () => void;
}

const Chip = ({
  iconSrc,
  title,
  isExternalLink,
  isAIButton,
  onClick,
}: ChipButtonProps) => {
  return (
    <ChipWrapper onClick={onClick} $isAIButton={isAIButton}>
      <Icon src={iconSrc} alt="" />
      <ContentArea>
        <div className="title">{title}</div>
        {isExternalLink && <img src={외부연결버튼} />}
      </ContentArea>
    </ChipWrapper>
  );
};

export default Chip;

const ChipWrapper = styled.button<{ $isAIButton?: boolean }>`
  display: flex;
  padding: 8px 12px;
  align-items: center;
  gap: 4px;

  width: fit-content;
  height: fit-content;

  border-radius: 50px;
  background: ${({ $isAIButton }) =>
    $isAIButton
      ? "linear-gradient(270deg, #EFFFF4 0%, #DEEFFF 67.31%, #FEEDFF 100%)"
      : "#fff"};

  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
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
