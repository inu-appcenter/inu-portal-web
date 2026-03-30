import { BottomSheet } from "react-spring-bottom-sheet";
import "react-spring-bottom-sheet/dist/style.css";
import styled from "styled-components";
import { Bell, Smartphone } from "lucide-react";
import { DESKTOP_MEDIA } from "@/styles/responsive";
import { getMobilePlatform } from "@/utils/getMobilePlatform";

interface InstallPromotionBottomSheetProps {
  open: boolean;
  onDismiss: () => void;
}

export default function InstallPromotionBottomSheet({
  open,
  onDismiss,
}: InstallPromotionBottomSheetProps) {
  const platform = getMobilePlatform();

  const handleInstallClick = () => {
    if (platform === "ios_browser") {
      window.open(
        "https://apps.apple.com/kr/app/%EC%9C%A0%EB%8B%88%EB%8F%94/id6751404748",
        "_blank",
      );
    } else if (platform === "android_browser") {
      window.open(
        "https://play.google.com/store/apps/details?id=com.hjunieee.inudormitory",
        "_blank",
      );
    }
  };

  return (
    <StyledBottomSheet open={open} onDismiss={onDismiss}>
      <ContentWrapper>
        <Title>INTIP 앱을 설치해보세요!</Title>
        <PromoList>
          <PromoItem>
            <IconWrapper bgColor="#eaf2ff">
              <Bell size={20} color="#2563eb" />
            </IconWrapper>
            <PromoText>
              내 학과 공지사항 놓치지 않을테야!
              <br />
              <strong>학과공지 알리미</strong>를 사용할 수 있어요.
            </PromoText>
          </PromoItem>
          <PromoItem>
            <IconWrapper bgColor="#fff1e8">
              <Smartphone size={20} color="#ea580c" />
            </IconWrapper>
            <PromoText>
              <strong>푸시알림</strong> 등 INTIP의 모든 서비스를 편리하게 이용할
              수 있어요.
            </PromoText>
          </PromoItem>
        </PromoList>

        <ButtonGroup>
          <InstallButton onClick={handleInstallClick}>
            스토어에서 설치하기
          </InstallButton>
          <DismissButton onClick={onDismiss}>다음에 할래요</DismissButton>
        </ButtonGroup>
      </ContentWrapper>
    </StyledBottomSheet>
  );
}

const StyledBottomSheet = styled(BottomSheet)`
  [data-rsbs-overlay] {
    z-index: 9999;
    background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
    box-shadow: 0 -8px 30px rgba(15, 23, 42, 0.12);
  }

  [data-rsbs-backdrop] {
    z-index: 9998;
  }

  @media ${DESKTOP_MEDIA} {
    [data-rsbs-overlay],
    [data-rsbs-root]:after {
      max-width: 440px;
      margin-left: auto;
      margin-right: auto;
      left: 0;
      right: 0;
      bottom: 0;
    }

    [data-rsbs-overlay] {
      border-top-left-radius: 24px;
      border-top-right-radius: 24px;
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }
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
  color: #102a43;
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
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.18);
`;

const PromoText = styled.p`
  margin: 0;
  font-size: 15px;
  color: #526072;
  line-height: 1.5;
  word-break: keep-all;

  strong {
    color: #17325c;
    font-weight: 600;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
`;

const InstallButton = styled.button`
  width: 100%;
  height: 52px;
  background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%);
  color: white;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  box-shadow: 0 10px 20px rgba(37, 99, 235, 0.22);

  &:active {
    background: linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%);
  }
`;

const DismissButton = styled.button`
  width: 100%;
  height: 52px;
  background-color: #eef3f8;
  color: #49617d;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #d9e2ec;
  cursor: pointer;

  &:active {
    background-color: #e3ebf4;
  }
`;
