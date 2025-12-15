import styled from "styled-components";

interface CapsuleButtonProps {
  iconSrc: string;
  title: string;
  description: string;
  onClick?: () => void;
}

const CapsuleButton = ({
  iconSrc,
  title,
  description,
  onClick,
}: CapsuleButtonProps) => {
  return (
    <CapsuleButtonWrapper onClick={onClick}>
      <Icon src={iconSrc} alt="" />
      <ContentArea>
        <div className="title">{title}</div>
        <div className="description">{description}</div>
      </ContentArea>
    </CapsuleButtonWrapper>
  );
};

export default CapsuleButton;

const CapsuleButtonWrapper = styled.button`
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
  justify-content: start;
  padding: 16px 12px;
  box-sizing: border-box;
  width: 40%;
  max-width: 170px;

  border-radius: 50px;
  background: #fff;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);

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
