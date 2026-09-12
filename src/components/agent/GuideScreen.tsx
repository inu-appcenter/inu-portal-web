import React from "react";
import styled from "styled-components";
import { Sparkles, BookOpen, Utensils, Bus, Calendar, Compass } from "lucide-react";
import loadingGif from "@/resources/assets/illustrations/횃불이ai로딩애니메이션.gif";

const GuideContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 760px;
  margin: auto 0;
  padding: 30px 16px;
  text-align: center;
`;

const MascotImg = styled.img`
  width: 68px;
  height: 68px;
  object-fit: contain;
  margin-bottom: 12px;
`;

const GreetingTitle = styled.h1`
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
`;

const GreetingDesc = styled.p`
  font-size: 14px;
  color: #64748b;
  margin: 0 0 28px 0;
  line-height: 1.6;
  max-width: 540px;
`;

const SuggestionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  width: 100%;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const SuggestionCard = styled.button`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 14px 16px;
  text-align: left;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);

  &:hover {
    border-color: #0958d9;
    background: #f0f7ff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(9, 88, 217, 0.1);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #0958d9;
`;

const CardQuery = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
  line-height: 1.4;
`;

interface GuideScreenProps {
  onSelectSuggestion: (question: string) => void;
}

export const GuideScreen: React.FC<GuideScreenProps> = ({ onSelectSuggestion }) => {
  const suggestions = [
    {
      category: "inuai 학사 RAG",
      icon: <BookOpen size={14} color="#0958d9" />,
      query: "조기졸업 하려면 평점이랑 이수학점이 몇 점이어야 해?",
    },
    {
      category: "inuai 학칙 규정",
      icon: <Compass size={14} color="#0958d9" />,
      query: "휴학은 연속으로 몇 학기까지 가능하고 최대 제한이 있어?",
    },
    {
      category: "캠퍼스 학식 & 식당",
      icon: <Utensils size={14} color="#d97706" />,
      query: "오늘 점심 학생식당이랑 2기숙사 식단 메뉴 알려줘",
    },
    {
      category: "실시간 교통 & 버스",
      icon: <Bus size={14} color="#059669" />,
      query: "지금 정문이랑 자연대 셔틀버스 언제 도착해?",
    },
    {
      category: "학사일정 & 캘린더",
      icon: <Calendar size={14} color="#7c3aed" />,
      query: "이번 달 주요 학사일정이랑 수강신청 정정 기간 알려줘",
    },
    {
      category: "복합 질의 (빅스비 연합)",
      icon: <Sparkles size={14} color="#0958d9" />,
      query: "오늘 날씨 어때? 그리고 졸업 요건 학점 기준도 같이 알려줘",
    },
  ];

  return (
    <GuideContainer>
      <MascotImg src={loadingGif} alt="인팁 AI 마스코트 횃불이" />
      <GreetingTitle>안녕하세요! 인팁 AI 캠퍼스 비서입니다</GreetingTitle>
      <GreetingDesc>
        학교 공식 학칙·규정·공지사항(inuai) 답변부터 실시간 학식, 버스 도착,
        학사일정까지 한 번에 안내해 드립니다.
      </GreetingDesc>

      <SuggestionGrid>
        {suggestions.map((item, idx) => (
          <SuggestionCard key={idx} onClick={() => onSelectSuggestion(item.query)}>
            <CardHeader>
              {item.icon}
              <span>{item.category}</span>
            </CardHeader>
            <CardQuery>{item.query}</CardQuery>
          </SuggestionCard>
        ))}
      </SuggestionGrid>
    </GuideContainer>
  );
};
