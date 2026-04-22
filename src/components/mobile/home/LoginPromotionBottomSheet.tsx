import { BottomSheet } from "react-spring-bottom-sheet";
import "react-spring-bottom-sheet/dist/style.css";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { LogIn, Bell } from "lucide-react";
import { mixpanelTrack } from "@/utils/mixpanel";

interface LoginPromotionBottomSheetProps {
  open: boolean;
  onDismiss: () => void;
}

export default function LoginPromotionBottomSheet({
  open,
  onDismiss,
}: LoginPromotionBottomSheetProps) {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    mixpanelTrack.promotionClicked(
      "Login Promotion",
      "Login Button",
      "Home Bottom Sheet",
    );
    navigate(ROUTES.LOGIN);
  };

  const handleDismiss = () => {
    mixpanelTrack.promotionClicked(
      "Login Promotion",
      "Dismiss Button",
      "Home Bottom Sheet",
    );
    onDismiss();
  };

  return (
    <StyledBottomSheet open={open} onDismiss={handleDismiss}>
      <ContentWrapper>
        <Title>로그인하고 더 많은 기능을 누려보세요!</Title>
        <PromoList>
          <PromoItem>
            <IconWrapper bgColor="#f0fdf4">
              <Bell size={20} color="#22c55e" />
            </IconWrapper>
            <PromoText>
              내 학과 공지사항 놓치지 않을테야!
              <br />
              <strong>학과공지 알리미</strong>를 사용해보세요
            </PromoText>
          </PromoItem>
          <PromoItem>
            <IconWrapper bgColor="#fff0e6">
              <LogIn size={20} color="#ff6600" />
            </IconWrapper>
            <PromoText>
              <strong>포털 아이디</strong>로 간편하게 로그인 가능해요
            </PromoText>
          </PromoItem>
        </PromoList>

        <ButtonGroup>
          <LoginButton onClick={handleLoginClick}>로그인하러 가기</LoginButton>
          <DismissButton onClick={handleDismiss}>다음에 할게요</DismissButton>
        </ButtonGroup>
      </ContentWrapper>
    </StyledBottomSheet>
  );
}

const StyledBottomSheet = styled(BottomSheet)`
  [data-rsbs-overlay] {
    z-index: 9999;
  }
  [data-rsbs-backdrop] {
    z-index: 9998;
  }
`;

const ContentWrapper = styled.div`
  padding: 24px 20px 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  line-height: 1.4;
`;

const PromoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const PromoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const IconWrapper = styled.div<{ bgColor: string }>`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background-color: ${(props) => props.bgColor};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const PromoText = styled.p`
  margin: 0;
  font-size: 15px;
  color: #4a4a4a;
  line-height: 1.5;

  strong {
    color: #1a1a1a;
    font-weight: 600;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
`;

const LoginButton = styled.button`
  width: 100%;
  height: 52px;
  background-color: #3182ce;
  color: white;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;

  &:active {
    background-color: #2b6cb0;
  }
`;

const DismissButton = styled.button`
  width: 100%;
  height: 52px;
  background-color: #f5f5f5;
  color: #666;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;

  &:active {
    background-color: #e2e2e2;
  }
`;
