import { useState, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { X, Sparkles, AlertCircle, Copy, Check, RefreshCw } from "lucide-react";
import ChatBulButtonImg from "@/resources/assets/ai/chat-bul-button.webp";
import { useTimeTableEvaluation } from "@/hooks/useTimeTableEvaluation";
import { mixpanelTrack } from "@/utils/mixpanel";

interface TimetableAiEvaluationBubbleProps {
  timetableId: number | null | undefined;
  timetableName?: string;
  hasEvents: boolean;
}

const TimetableAiEvaluationBubble = ({
  timetableId,
  timetableName = "시간표",
  hasEvents,
}: TimetableAiEvaluationBubbleProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const contentBodyRef = useRef<HTMLDivElement>(null);

  const {
    cachedData,
    isCacheLoading,
    evaluationText,
    isStreaming,
    isLoading,
    error,
    startEvaluation,
  } = useTimeTableEvaluation(timetableId);

  // 말풍선 열릴 때 자동으로 캐시가 없으면 평가 시작하거나 캐시 표시
  const handleToggle = () => {
    if (!timetableId) return;

    if (!hasEvents) {
      alert("시간표에 강의나 일정을 먼저 등록해주세요!");
      return;
    }

    const nextOpen = !isOpen;
    setIsOpen(nextOpen);

    if (nextOpen) {
      mixpanelTrack.timetableFeatureClicked("시간표 AI 평가 열기", "시간표 홈");

      // 캐시가 없고, 현재 스트리밍 중도 아니고, 기존 텍스트도 없으면 즉시 시작
      if (!cachedData && !evaluationText && !isStreaming) {
        startEvaluation(false);
      }
    }
  };

  const handleRetry = () => {
    if (isStreaming || isLoading) return;
    mixpanelTrack.timetableFeatureClicked("시간표 AI 재평가", "AI 평가 말풍선");
    startEvaluation(true);
  };

  const handleCopy = async () => {
    if (!displayText) return;
    try {
      await navigator.clipboard.writeText(displayText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("복사 실패:", e);
    }
  };

  // 스트리밍 중일 때 최하단으로 자동 스크롤
  useEffect(() => {
    if (isStreaming && contentBodyRef.current) {
      contentBodyRef.current.scrollTop = contentBodyRef.current.scrollHeight;
    }
  }, [evaluationText, isStreaming]);

  // 표시할 본문 결정 (실시간 스트리밍 텍스트 -> 캐시 데이터 순)
  const displayText = evaluationText || (cachedData?.content ?? "");

  // 간단한 마크다운 파서 렌더러
  const renderFormattedContent = (content: string) => {
    if (!content) return null;

    const lines = content.split("\n");
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <div key={idx} style={{ height: "6px" }} />;
      }

      // 강조 볼드체 처리 (**text** or `text`)
      const formattedParts = line.split(/(\*\*.*?\*\*|`.*?`)/g).map((part, pIdx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <BoldText key={pIdx}>{part.slice(2, -2)}</BoldText>;
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return <HighlightBadge key={pIdx}>{part.slice(1, -1)}</HighlightBadge>;
        }
        return part;
      });

      if (trimmed.startsWith("###") || trimmed.startsWith("##") || trimmed.startsWith("#")) {
        const headerText = trimmed.replace(/^#+\s*/, "");
        return (
          <SectionHeader key={idx}>
            <Sparkles size={13} color="#FF5F15" />
            <span>{headerText}</span>
          </SectionHeader>
        );
      }

      if (trimmed.startsWith("-") || trimmed.startsWith("*") || trimmed.startsWith("•")) {
        const bulletText = line.replace(/^\s*[-*•]\s*/, "");
        const formattedBulletParts = bulletText.split(/(\*\*.*?\*\*|`.*?`)/g).map((part, pIdx) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return <BoldText key={pIdx}>{part.slice(2, -2)}</BoldText>;
          }
          if (part.startsWith("`") && part.endsWith("`")) {
            return <HighlightBadge key={pIdx}>{part.slice(1, -1)}</HighlightBadge>;
          }
          return part;
        });

        return (
          <BulletItem key={idx}>
            <BulletDot />
            <span>{formattedBulletParts}</span>
          </BulletItem>
        );
      }

      return <Paragraph key={idx}>{formattedParts}</Paragraph>;
    });
  };

  const bubbleVariants: Variants = {
    hidden: {
      opacity: 0,
      scale: 0.88,
      y: 12,
      transformOrigin: "bottom right",
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transformOrigin: "bottom right",
      transition: {
        type: "spring",
        stiffness: 380,
        damping: 26,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.88,
      y: 10,
      transformOrigin: "bottom right",
      transition: {
        duration: 0.16,
        ease: "easeOut",
      },
    },
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <BubbleWrapper
            variants={bubbleVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* 말풍선 상단 (자연스럽게 녹아든 헤더) */}
            <BubbleTopBar>
              <ProfileGroup>
                <TorchAvatar src={ChatBulButtonImg} alt="횃불이" />
                <TorchName>횃불이의 시간표 평가 😎</TorchName>
              </ProfileGroup>

              <CloseButton onClick={() => setIsOpen(false)} aria-label="닫기">
                <X size={17} />
              </CloseButton>
            </BubbleTopBar>

            {/* 말풍선 본문 */}
            <BubbleBody ref={contentBodyRef}>
              {/* 1. 로딩 상태 */}
              {(isLoading || isCacheLoading) && !displayText && (
                <LoadingStateContainer>
                  <ScanningAvatarWrapper>
                    <ScanningAvatar src={ChatBulButtonImg} alt="분석 중" />
                    <ScanningRadar />
                  </ScanningAvatarWrapper>
                  <LoadingTitle>시간표 뜯어보는 중... 🔥</LoadingTitle>
                  <LoadingDesc>
                    공강 시간, 1교시, 점심시간까지 꼼꼼히 확인하고 있어!
                  </LoadingDesc>
                  <DotsLoader>
                    <span />
                    <span />
                    <span />
                  </DotsLoader>
                </LoadingStateContainer>
              )}

              {/* 2. 에러 상태 */}
              {error && (
                <ErrorContainer>
                  <AlertCircle size={28} color="#FF3B30" />
                  <ErrorMessage>{error}</ErrorMessage>
                  <RetryButton onClick={handleRetry}>
                    다시 시도하기
                  </RetryButton>
                </ErrorContainer>
              )}

              {/* 3. 텍스트 표시 영역 */}
              {displayText && (
                <ContentArea>
                  {renderFormattedContent(displayText)}
                  {isStreaming && (
                    <TypingCursor>
                      <span />
                    </TypingCursor>
                  )}

                  {/* 하단 액션 버튼 (복사 & 다시 생성) */}
                  {!isStreaming && !isLoading && (
                    <MessageFooter>
                      <ActionButton onClick={handleCopy} title="답변 복사">
                        {copied ? (
                          <Check size={12} color="#52c41a" />
                        ) : (
                          <Copy size={12} />
                        )}
                        <span>{copied ? "복사됨" : "복사"}</span>
                      </ActionButton>

                      <ActionButton onClick={handleRetry} title="다시 생성">
                        <RefreshCw size={12} />
                        <span>다시 생성</span>
                      </ActionButton>
                    </MessageFooter>
                  )}
                </ContentArea>
              )}

              {/* 4. 초기 미분석 상태 */}
              {!isLoading && !isCacheLoading && !error && !displayText && (
                <EmptyStateContainer>
                  <p>아직 평가를 받지 않았어!</p>
                  <StartButton onClick={() => startEvaluation(false)}>
                    <Sparkles size={15} />
                    시간표 평가받기
                  </StartButton>
                </EmptyStateContainer>
              )}
            </BubbleBody>

            {/* 말풍선 꼬리 */}
            <BubbleTail />
          </BubbleWrapper>
        )}
      </AnimatePresence>

      {/* 우측 하단 플로팅 버튼 */}
      <FloatingButtonContainer>
        <AiButton
          onClick={handleToggle}
          whileTap={{ scale: 0.92 }}
          animate={{ y: [0, -5, 0] }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          aria-label="시간표 AI 평가 횃불이"
        >
          <ButtonBadge>
            <Sparkles size={10} color="#FFFFFF" />
            <span>AI 평가</span>
          </ButtonBadge>
          <img src={ChatBulButtonImg} alt="시간표 AI 평가" />
        </AiButton>
      </FloatingButtonContainer>
    </>
  );
};

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.4; transform: scale(0.95); }
  50% { opacity: 1; transform: scale(1.05); }
`;

const blink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
`;

const FloatingButtonContainer = styled.div`
  position: fixed;
  bottom: 80px;
  right: 16px;
  z-index: 1000;

  @media (min-width: 1024px) {
    bottom: 85px;
    right: calc(50% - 600px + 16px);
  }
`;

const ButtonBadge = styled.div`
  position: absolute;
  top: -6px;
  right: -4px;
  background: linear-gradient(135deg, #ff5f15 0%, #ff3b30 100%);
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 3px;
  box-shadow: 0 2px 6px rgba(255, 95, 21, 0.4);
  white-space: nowrap;
  pointer-events: none;
  z-index: 2;
`;

const AiButton = styled(motion.button)`
  position: relative;
  width: 68px;
  height: 68px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.22));

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const BubbleWrapper = styled(motion.div)`
  position: fixed;
  bottom: 154px;
  right: 16px;
  width: calc(100vw - 32px);
  max-width: 340px;
  max-height: 440px;
  background: #ffffff;
  border-radius: 20px 20px 6px 20px;
  box-shadow:
    0 16px 36px -8px rgba(0, 0, 0, 0.18),
    0 3px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.07);
  display: flex;
  flex-direction: column;
  z-index: 1001;
  overflow: visible;

  @media (min-width: 1024px) {
    right: calc(50% - 600px + 16px);
  }
`;

const BubbleTail = styled.div`
  position: absolute;
  bottom: -7px;
  right: 18px;
  width: 14px;
  height: 14px;
  background: #ffffff;
  border-right: 1px solid rgba(0, 0, 0, 0.07);
  border-bottom: 1px solid rgba(0, 0, 0, 0.07);
  transform: rotate(45deg);
`;

const BubbleTopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 8px 16px;
`;

const ProfileGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TorchAvatar = styled.img`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  object-fit: contain;
`;

const TorchName = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: #1c1c1e;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  border-radius: 50%;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #8e8e93;
  transition: all 0.15s;
  padding: 0;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
    color: #1c1c1e;
  }
`;

const BubbleBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 4px 16px 16px 16px;
  font-size: 13.5px;
  line-height: 1.6;
  color: #2c2c2e;
  word-break: break-word;

  &::-webkit-scrollbar {
    width: 3px;
  }
  &::-webkit-scrollbar-thumb {
    background: #e5e5ea;
    border-radius: 3px;
  }
`;

const LoadingStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 10px;
  text-align: center;
`;

const ScanningAvatarWrapper = styled.div`
  position: relative;
  width: 52px;
  height: 52px;
  margin-bottom: 12px;
`;

const ScanningAvatar = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  animation: ${pulse} 2s ease-in-out infinite;
`;

const ScanningRadar = styled.div`
  position: absolute;
  inset: -5px;
  border: 1.5px dashed #ff5f15;
  border-radius: 50%;
  animation: ${spin} 5s linear infinite;
`;

const LoadingTitle = styled.h4`
  font-size: 14px;
  font-weight: 700;
  color: #1c1c1e;
  margin: 0 0 4px 0;
`;

const LoadingDesc = styled.p`
  font-size: 11.5px;
  color: #8e8e93;
  margin: 0 0 12px 0;
  line-height: 1.4;
`;

const DotsLoader = styled.div`
  display: flex;
  gap: 5px;

  span {
    width: 5px;
    height: 5px;
    background: #ff5f15;
    border-radius: 50%;
    animation: ${pulse} 1.2s infinite ease-in-out;

    &:nth-child(2) {
      animation-delay: 0.2s;
    }
    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px 10px;
`;

const ErrorMessage = styled.p`
  font-size: 12.5px;
  color: #ff3b30;
  margin: 8px 0 12px 0;
`;

const RetryButton = styled.button`
  background: #ff3b30;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
`;

const ContentArea = styled.div`
  display: flex;
  flex-direction: column;
`;

const BoldText = styled.strong`
  font-weight: 700;
  color: #111827;
`;

const HighlightBadge = styled.span`
  background: #fff3eb;
  color: #ea580c;
  font-weight: 700;
  font-size: 12.5px;
  padding: 1px 5px;
  border-radius: 5px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13.5px;
  font-weight: 700;
  color: #ff5f15;
  margin-top: 10px;
  margin-bottom: 3px;
`;

const BulletItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin: 2px 0;
  line-height: 1.5;
`;

const BulletDot = styled.span`
  width: 3.5px;
  height: 3.5px;
  background: #ff5f15;
  border-radius: 50%;
  margin-top: 7px;
  flex-shrink: 0;
`;

const Paragraph = styled.div`
  margin: 3px 0;
  line-height: 1.55;
`;

const TypingCursor = styled.span`
  display: inline-block;
  margin-left: 2px;

  span {
    display: inline-block;
    width: 5px;
    height: 13px;
    background: #ff5f15;
    animation: ${blink} 0.8s infinite;
    vertical-align: middle;
  }
`;

const MessageFooter = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding-top: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  padding: 4px 6px;
  cursor: pointer;
  color: #8e8e93;
  display: flex;
  align-items: center;
  gap: 4px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  transition: all 0.15s ease;

  &:hover {
    color: #1c1c1e;
    background-color: rgba(0, 0, 0, 0.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 24px 10px;

  p {
    font-size: 12.5px;
    color: #8e8e93;
    margin-bottom: 12px;
  }
`;

const StartButton = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  background: linear-gradient(135deg, #ff5f15 0%, #ff3b30 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 3px 10px rgba(255, 95, 21, 0.3);
  transition: transform 0.15s;

  &:active {
    transform: scale(0.96);
  }
`;

export default TimetableAiEvaluationBubble;
