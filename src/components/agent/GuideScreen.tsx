import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { COLORS } from "./colors";
import ChatbotLogo from "@/resources/assets/illustrations/chatbot-logo.svg";

const GuideScreenContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  max-width: 800px;
  padding: 20px 0 40px;
  box-sizing: border-box;
  margin: 0;
  gap: 16px;
  z-index: 1;

  @media (max-height: 680px) {
    gap: 10px;
    padding: 10px 0 20px;
  }
`;

const LogoContainer = styled.div`
  width: 72px;
  height: 60.5px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-bottom: 4px;

  @media (max-height: 680px) {
    width: 56px;
    height: 47px;
    margin-bottom: 0px;
  }
`;

const LogoImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
`;

const TextBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  font-family:
    "Pretendard",
    -apple-system,
    BlinkMacSystemFont,
    system-ui,
    Roboto,
    sans-serif;
  word-break: keep-all;
`;

const TitleText = styled.p`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.5;
  color: #1c1e1e;
  text-align: center;
  white-space: pre-line;
`;

const SubtitleText = styled.p`
  margin: 12px 0 0 0;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  color: #6f6f6f;
  text-align: center;
  white-space: pre-line;

  @media (max-height: 680px) {
    margin-top: 6px;
  }
`;

const ChipsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 10px;
  width: 100%;
  max-width: 520px;
  margin-top: 4px;
  box-sizing: border-box;

  @media (max-height: 680px) {
    gap: 8px;
    margin-top: 2px;
  }
`;

const GuideChip = styled.button`
  width: fit-content;
  max-width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  text-align: left;
  background: rgba(225, 236, 255, 0.25);
  border: 1px solid ${COLORS.blue200};
  border-radius: 60px;
  padding: 11px 20px;
  color: ${COLORS.figmaBlue};
  font-family:
    "Pretendard",
    -apple-system,
    sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  cursor: pointer;
  transition: all 0.2s ease;
  word-break: keep-all;
  box-sizing: border-box;

  @media (max-height: 680px) {
    padding: 9px 16px;
    font-size: 13.5px;
  }

  &:hover {
    background: rgba(225, 236, 255, 0.5);
    border-color: ${COLORS.figmaBlue};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

interface GuideScreenProps {
  onSelectSuggestion?: (question: string) => void;
  onSelectGuide?: (message: string) => void;
}

const INTIP_MESSAGES = [
  "컴퓨터공학부 과사 전화번호 뭐야?",
  "마일리지 장학금 신청이랑 지급 조건 알려줘.",
  "조기졸업 조건이랑 신청 시기 알려줘.",
  "한 학기 다니고 다음 학기에 바로 또 휴학할 수 있어?",
  "초과학기자도 등록금 신용카드 납부 돼?",
  "전과할 때 필수로 들어야 하는 전공 학점 있어?",
  "1월 전역이면 3월 1학기에 바로 복학 가능해?",
  "군휴학 최대 인정 기간이 얼마나 돼?",
  "부전공 다 못 채워도 주전공으로 졸업 돼?",
  "이번 학기 수강신청 기간 언제야?",
  "학점 2.50이면 국가장학금 받을 수 있어?",
  "졸업유예 상태에서 재수강 과목 수강신청 돼?",
  "결석 몇 번이면 자동으로 F 처리돼?",
  "수강포기 조건이랑 신청 방법 알려줘.",
  "오늘 점심 학생식당이랑 기숙사 학식 메뉴 알려줘",
  "정문 셔틀버스 언제 도착해?",
  "이번 달 주요 학사일정 알려줘",
];

export const GuideScreen: React.FC<GuideScreenProps> = ({
  onSelectSuggestion,
  onSelectGuide,
}) => {
  const [windowHeight, setWindowHeight] = useState(() =>
    typeof window !== "undefined" ? window.innerHeight : 800
  );

  useEffect(() => {
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const visibleCount = useMemo(() => {
    if (windowHeight < 440) return 2;
    if (windowHeight < 530) return 3;
    if (windowHeight < 620) return 4;
    return 5;
  }, [windowHeight]);

  const randomMessages = useMemo(() => {
    const shuffled = [...INTIP_MESSAGES].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5);
  }, []);

  const visibleMessages = useMemo(() => {
    return randomMessages.slice(0, visibleCount);
  }, [randomMessages, visibleCount]);

  const handleClick = (message: string) => {
    if (onSelectSuggestion) onSelectSuggestion(message);
    if (onSelectGuide) onSelectGuide(message);
  };

  return (
    <GuideScreenContainer>
      <LogoContainer>
        <LogoImage src={ChatbotLogo} alt="챗불이 로고" />
      </LogoContainer>
      <TextBlock>
        <TitleText>
          {"안녕하세요!\n인천대학교 인팁 AI 캠퍼스 비서예요!"}
        </TitleText>
        <SubtitleText>
          {"학칙과 학사 공지사항(inuai)부터 실시간 학식, 버스,\n시간표까지 무엇이든 물어보세요."}
        </SubtitleText>
      </TextBlock>
      <ChipsContainer>
        {visibleMessages.map((message, index) => (
          <GuideChip key={index} onClick={() => handleClick(message)}>
            {message}
          </GuideChip>
        ))}
      </ChipsContainer>
    </GuideScreenContainer>
  );
};
