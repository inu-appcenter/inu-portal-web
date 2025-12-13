import { ROUTES } from "@/constants/routes";
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import BackButton from "@/components/mobile/mypage/BackButton.tsx";
import Title from "@/components/mobile/mypage/Title.tsx";

interface CommentTitleProps {
  title: string;
  onback?: () => void;
}

export default function MobileTitleHeader({
  title,
  onback,
}: CommentTitleProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    const params = new URLSearchParams(location.search);

    // [수정] string[] 타입 명시로 includes 에러 해결
    const specialPaths: string[] = [
      ROUTES.BOARD.UTIL,
      ROUTES.BOARD.COUNCIL,
      ROUTES.BOARD.CAMPUS,
      ROUTES.BOARD.TIPS,
    ];

    const shouldGoHome =
      specialPaths.includes(location.pathname) && [...params].length > 0;

    // [수정] 하드코딩된 경로를 상수로 교체 (대소문자 및 /m 제거 주의)
    const isBusInfoPage = location.pathname.includes(ROUTES.BUS.INFO);

    if (isBusInfoPage) {
      navigate(ROUTES.BUS.ROOT);
    } else if (shouldGoHome) {
      navigate(ROUTES.HOME);
    } else {
      navigate(-1);
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
