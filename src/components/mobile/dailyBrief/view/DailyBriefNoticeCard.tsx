import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { getNotices } from "@/apis/notices";
import { Notice } from "@/types/notices";
import { ROUTES } from "@/constants/routes";
import { Volume2, Square } from "lucide-react";

export default function DailyBriefNoticeCard() {
  const navigate = useNavigate();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isReading, setIsReading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    void getNotices("전체", "date", 1)
      .then((res) => {
        if (isMounted && res.data?.contents) {
          setNotices(res.data.contents);
        }
      })
      .catch((err) => {
        console.warn("공지사항 조회 실패:", err);
      });

    return () => {
      isMounted = false;
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const topNotice = notices[0] || {
    id: 1,
    title: "2026학년도 2학기 수강신청 및 장학금 신청 안내",
    category: "학사",
    date: "2026-09-18",
  };

  const handleReadAloud = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.speechSynthesis) {
      navigate(ROUTES.BOARD.NOTICE_DETAIL(topNotice.id));
      return;
    }

    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
      return;
    }

    window.speechSynthesis.cancel();
    const textToRead = `오늘의 주요 공지사항입니다. ${topNotice.category || "학사"} 공지, ${topNotice.title} 입니다. 자세한 사항은 공지사항 탭에서 확인하실 수 있습니다.`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = "ko-KR";
    utterance.rate = 1.0;
    utterance.onend = () => setIsReading(false);
    utterance.onerror = () => setIsReading(false);

    window.speechSynthesis.speak(utterance);
    setIsReading(true);
  };

  return (
    <SectionWrapper>
      <ContextIntro>
        최신 소식이 궁금한가요? 주요 공지사항을 확인해 보세요.
      </ContextIntro>
      <CardContainer
        onClick={() => navigate(ROUTES.BOARD.NOTICE_DETAIL(topNotice.id))}
      >
        <NoticeHeaderRow>
          <IconBox>
            <NewsIconText>NOTICE</NewsIconText>
          </IconBox>
          <NoticeMetaCol>
            <DomainLabel>inu.ac.kr · {topNotice.category || "학사"}</DomainLabel>
            <NoticeTitle>{topNotice.title}</NoticeTitle>
          </NoticeMetaCol>
        </NoticeHeaderRow>

        <ReadAloudButton onClick={handleReadAloud} $active={isReading}>
          {isReading ? (
            <Square size={15} color="#3730a3" />
          ) : (
            <Volume2 size={16} color="#1f2937" />
          )}
          <span>{isReading ? "낭독 중단하기" : "주요 내용 읽어주기"}</span>
        </ReadAloudButton>
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
  gap: 18px;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;

  &:active {
    transform: scale(0.985);
  }
`;

const NoticeHeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
`;

const IconBox = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2);
`;

const NewsIconText = styled.span`
  font-size: 9px;
  font-weight: 900;
  color: #ffffff;
  letter-spacing: 0.5px;
  background: rgba(255, 255, 255, 0.2);
  padding: 3px 4px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.35);
`;

const NoticeMetaCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const DomainLabel = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
`;

const NoticeTitle = styled.h3`
  font-size: 15.5px;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.3px;
  line-height: 1.35;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ReadAloudButton = styled.button<{ $active?: boolean }>`
  width: 100%;
  height: 48px;
  border-radius: 24px;
  background: ${({ $active }) => ($active ? "#e0e7ff" : "#edf2f7")};
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 700;
  color: ${({ $active }) => ($active ? "#3730a3" : "#1f2937")};
  cursor: pointer;
  transition: all 0.15s ease;

  &:active {
    background: #e2e8f0;
    transform: scale(0.99);
  }
`;
