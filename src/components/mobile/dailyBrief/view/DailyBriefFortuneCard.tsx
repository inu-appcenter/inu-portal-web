import { useState, useMemo } from "react";
import styled from "styled-components";
import Icon from "@/components/common/Icon";

export default function DailyBriefFortuneCard() {
  const [isOpen, setIsOpen] = useState(true);

  const fortunes = [
    {
      keyword: "도서관의 행운 📚",
      message:
        "오늘은 학술정보관 3층 열람실에서 집중력이 최고조에 달하는 날이에요! 미뤄둔 과제를 완벽하게 끝낼 수 있어요.",
      luckyItem: "텀블러 & 파란색 볼펜",
    },
    {
      keyword: "뜻밖의 소식 🍀",
      message:
        "강의실에서 친구나 교수님과의 우연한 대화 중에 유익한 공모전이나 꿀팁을 얻게 될 예감이에요.",
      luckyItem: "시원한 아이스 아메리카노",
    },
    {
      keyword: "열정과 몰입 🔥",
      message:
        "새로운 프로젝트나 스터디를 시작하기에 최적의 타이밍입니다. 망설이지 말고 도전해 보세요!",
      luckyItem: "에어팟 & 신나는 플레이리스트",
    },
    {
      keyword: "달콤한 휴식 ☕",
      message:
        "오늘은 바쁜 일상 속에서도 캠퍼스 잔디밭을 바라보며 잠시 여유를 즐길 때 최고의 힐링이 찾아와요.",
      luckyItem: "달콤한 디저트",
    },
  ];

  // 날짜 기반 결정론적 운세 선택 (매일 같은 날엔 일관된 운세, 다음날 변경)
  const todayFortune = useMemo(() => {
    const today = new Date();
    const daySeed =
      today.getFullYear() * 10000 +
      (today.getMonth() + 1) * 100 +
      today.getDate();
    return fortunes[daySeed % fortunes.length];
  }, [fortunes]);

  return (
    <SectionWrapper>
      <ContextIntro>오늘의 운세를 확인해 볼까요?</ContextIntro>
      <CardContainer onClick={() => setIsOpen(!isOpen)}>
        <CardHeader>
          <HeaderLeft>
            <SparkleIconCircle>✨</SparkleIconCircle>
            <CardTitle>캠퍼스 포춘</CardTitle>
          </HeaderLeft>
          <InfoIconBadge>
            <Icon name="info" size={16} color="#6b7280" />
          </InfoIconBadge>
        </CardHeader>

        {isOpen && (
          <FortuneBody>
            <KeywordTag>{todayFortune.keyword}</KeywordTag>
            <FortuneMessage>{todayFortune.message}</FortuneMessage>
            <LuckyItemRow>
              <LuckyItemLabel>오늘의 행운 아이템:</LuckyItemLabel>
              <LuckyItemValue>{todayFortune.luckyItem}</LuckyItemValue>
            </LuckyItemRow>
          </FortuneBody>
        )}

        <FooterText>포춘은 매일 아침 새롭게 계산됩니다.</FooterText>
      </CardContainer>
    </SectionWrapper>
  );
}

const SectionWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
`;

const ContextIntro = styled.p`
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  padding: 0 4px;
  letter-spacing: -0.3px;
  line-height: 1.35;
`;

const CardContainer = styled.div`
  background: #ffffff;
  border-radius: 28px;
  padding: 22px 20px;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.04),
    0 1px 3px rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.8);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;

  &:active {
    transform: scale(0.985);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SparkleIconCircle = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
`;

const CardTitle = styled.h2`
  font-size: 19px;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.4px;
  margin: 0;
`;

const InfoIconBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
`;

const FortuneBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 14px;
  background-color: #fafaf9;
  border-radius: 18px;
  border: 1px solid #f5f5f4;
`;

const KeywordTag = styled.span`
  font-size: 14px;
  font-weight: 800;
  color: #b45309;
`;

const FortuneMessage = styled.p`
  font-size: 14.5px;
  font-weight: 500;
  color: #374151;
  line-height: 1.5;
  margin: 0;
  letter-spacing: -0.2px;
`;

const LuckyItemRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  padding-top: 4px;
  border-top: 1px dashed #e7e5e4;
`;

const LuckyItemLabel = styled.span`
  font-weight: 600;
  color: #78716c;
`;

const LuckyItemValue = styled.span`
  font-weight: 700;
  color: #1c1917;
`;

const FooterText = styled.span`
  font-size: 12.5px;
  font-weight: 500;
  color: #9ca3af;
  letter-spacing: -0.2px;
`;
