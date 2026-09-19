import { useMemo } from "react";
import styled from "styled-components";

export default function DailyBriefFortuneCard() {
  const tips = [
    {
      keyword: "도서관 집중 모드 📚",
      message:
        "오늘은 학술정보관 열람실에서 집중력이 높아지는 날이에요. 미뤄둔 과제나 독서를 여유롭게 진행해 보세요.",
      luckyItem: "텀블러 & 파란색 볼펜",
    },
    {
      keyword: "뜻밖의 꿀팁 🍀",
      message:
        "강의실에서 친구나 선배와의 대화 중에 유익한 공모전이나 취업 팁을 얻을 수 있는 하루예요.",
      luckyItem: "시원한 아이스 음료",
    },
    {
      keyword: "열정과 도전 🔥",
      message:
        "새로운 프로젝트나 스터디를 시작하기에 좋은 타이밍이에요. 망설이지 말고 가볍게 첫 발을 내딛어 보세요!",
      luckyItem: "신나는 플레이리스트",
    },
    {
      keyword: "달콤한 휴식 ☕",
      message:
        "바쁜 강의 일정 사이, 캠퍼스 잔디밭이나 벤치에서 잠시 바람을 쐬며 여유를 즐겨보세요.",
      luckyItem: "달콤한 간식",
    },
    {
      keyword: "알찬 하루 계획 📝",
      message:
        "강의 시작 전 오늘 해야 할 중요한 일들을 3가지 적어보세요. 훨씬 가볍고 알찬 하루가 될 거예요.",
      luckyItem: "깔끔한 메모장",
    },
  ];

  // 날짜 기반 결정론적 팁 선택 (당일엔 고정 팁 표출, 자정이 지나면 다음 팁으로 자동 순환)
  const todayTip = useMemo(() => {
    const today = new Date();
    const daySeed =
      today.getFullYear() * 10000 +
      (today.getMonth() + 1) * 100 +
      today.getDate();
    return tips[daySeed % tips.length];
  }, [tips]);

  return (
    <SectionWrapper>
      <ContextIntro>횃불이의 오늘 한마디를 확인해 볼까요?</ContextIntro>
      <CardContainer>
        <CardHeader>
          <HeaderLeft>
            <SparkleIconCircle>💬</SparkleIconCircle>
            <CardTitle>횃불이 한마디</CardTitle>
          </HeaderLeft>
        </CardHeader>

        <FortuneBody>
          <KeywordTag>{todayTip.keyword}</KeywordTag>
          <FortuneMessage>{todayTip.message}</FortuneMessage>
          <LuckyItemRow>
            <LuckyItemLabel>오늘의 추천 아이템:</LuckyItemLabel>
            <LuckyItemValue>{todayTip.luckyItem}</LuckyItemValue>
          </LuckyItemRow>
        </FortuneBody>
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
  display: flex;
  flex-direction: column;
  gap: 16px;
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
  background: #f1f5f9;
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

const FortuneBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 16px;
  background-color: #fafaf9;
  border-radius: 18px;
  border: 1px solid #f5f5f4;
`;

const KeywordTag = styled.span`
  font-size: 14px;
  font-weight: 800;
  color: #2563eb;
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
  padding-top: 6px;
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
