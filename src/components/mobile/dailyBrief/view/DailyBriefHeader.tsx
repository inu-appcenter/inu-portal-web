import { useMemo } from "react";
import styled from "styled-components";
import Icon from "@/components/common/Icon";

interface DailyBriefHeaderProps {
  onBack?: () => void;
  onShare?: () => void;
}

export default function DailyBriefHeader({
  onBack,
  onShare,
}: DailyBriefHeaderProps) {
  const currentHour = new Date().getHours();

  const { title, subtitle } = useMemo(() => {
    if (currentHour >= 5 && currentHour < 12) {
      return {
        title: "상쾌한 아침이에요",
        subtitle: "좋은 느낌으로 오늘을 가득 채워 보세요.",
      };
    } else if (currentHour >= 12 && currentHour < 18) {
      return {
        title: "활기찬 오후예요",
        subtitle: "남은 하루도 기분 좋은 일들로 가득하길 바라요.",
      };
    } else if (currentHour >= 18 && currentHour < 22) {
      return {
        title: "편안한 저녁이에요",
        subtitle: "오늘 하루도 정말 수고 많으셨어요.",
      };
    } else {
      return {
        title: "고요한 밤이에요",
        subtitle: "편안한 휴식과 함께 내일을 준비해 보세요.",
      };
    }
  }, [currentHour]);

  return (
    <HeaderContainer>
      <TopNavRow>
        {onBack ? (
          <NavButton onClick={onBack} aria-label="뒤로 가기">
            <Icon name="chevron-left" size={24} color="#1E232A" />
          </NavButton>
        ) : (
          <div />
        )}

        {onShare && (
          <ShareButton onClick={onShare} aria-label="브리핑 카드 공유하기">
            <Icon name="share" size={16} color="#2563EB" />
            <ShareButtonText>공유</ShareButtonText>
          </ShareButton>
        )}
      </TopNavRow>

      <TitleSection>
        <MainGreeting>{title}</MainGreeting>
        <SubGreeting>{subtitle}</SubGreeting>
      </TitleSection>
    </HeaderContainer>
  );
}

const HeaderContainer = styled.header`
  width: 100%;
  padding-top: 12px;
  padding-bottom: 24px;
`;

const TopNavRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  min-height: 32px;
`;

const NavButton = styled.button`
  background: none;
  border: none;
  padding: 4px;
  margin-left: -4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.15s ease;

  &:active {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

const ShareButton = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.9);
  padding: 6px 12px;
  border-radius: 18px;
  cursor: pointer;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.15s ease;

  &:hover {
    background: #ffffff;
    transform: translateY(-1px);
  }

  &:active {
    transform: scale(0.96);
  }
`;

const ShareButtonText = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: #2563eb;
`;

const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const MainGreeting = styled.h1`
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.8px;
  color: #111827;
  margin: 0;
  line-height: 1.2;
`;

const SubGreeting = styled.p`
  font-size: 16px;
  font-weight: 500;
  letter-spacing: -0.3px;
  color: #374151;
  margin: 0;
  line-height: 1.4;
`;
