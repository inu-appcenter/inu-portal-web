import styled from "styled-components";
import { useLocation } from "react-router-dom";
import BackButton from "mobile/components/mypage/BackButton.tsx";
import Title from "mobile/components/mypage/Title.tsx";
import useMobileNavigate from "../../../hooks/useMobileNavigate.ts";

interface CommentTitleProps {
  title: string;
  onback?: () => void;
}

export default function MobileTitleHeader({
  title,
  onback,
}: CommentTitleProps) {
  const mobileNavigate = useMobileNavigate();
  const location = useLocation();

  // 기본 onback 핸들러
  const handleBack = () => {
    const params = new URLSearchParams(location.search);

    // 파라미터가 하나라도 있으면 /home으로 이동
    if ([...params].length > 0) {
      mobileNavigate("/home");
    } else {
      mobileNavigate(-1);
    }
  };

  return (
    <MobileTitleHeaderWrapper>
      <BackButtonWrapper onClick={onback ?? handleBack}>
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
