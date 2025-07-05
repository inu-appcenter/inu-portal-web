import styled from "styled-components";
import BackButton from "mobile/components/mypage/BackButton.tsx";
import Title from "mobile/components/mypage/Title.tsx";

interface CommentTitleProps {
  title: string;
  onback: () => void;
}

export default function MobileTitleHeader({
  title,
  onback,
}: CommentTitleProps) {
  return (
    <MobileTitleHeaderWrapper>
      <BackButtonWrapper onClick={onback}>
        <BackButton />
      </BackButtonWrapper>
      <Title title={title} />
    </MobileTitleHeaderWrapper>
  );
}

const MobileTitleHeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  border-bottom: 1px solid #d9d9d9;
  padding: 15px 1rem;
  gap: 8px;
  width: 100%;
  box-sizing: border-box;
`;

const BackButtonWrapper = styled.span`
  display: flex;
  align-items: center;
`;
