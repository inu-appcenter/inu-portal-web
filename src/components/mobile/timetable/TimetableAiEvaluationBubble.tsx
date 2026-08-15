import { useState, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { X, Sparkles, RefreshCw, AlertCircle, Zap } from "lucide-react";
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
  const contentBodyRef = useRef<HTMLDivElement>(null);

  const {
    cachedData,
    isCacheLoading,
    evaluationText,
    isStreaming,
    isLoading,
    isCached,
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

  const handleRefresh = () => {
    if (isStreaming || isLoading) return;
    mixpanelTrack.timetableFeatureClicked("시간표 AI 재평가", "AI 평가 말풍선");
    startEvaluation(true);
  };

  // 스트리밍 중일 때 최하단으로 자동 스크롤
  useEffect(() => {
    if (isStreaming && contentBodyRef.current) {
      contentBodyRef.current.scrollTop = contentBodyRef.current.scrollHeight;
    }
  }, [evaluationText, isStreaming]);

  // 표시할 본문 결정 (실시간 스트리밍 텍스트 -> 캐시 데이터 순)
  const displayText = evaluationText || (cachedData?.content ?? "");
  const isCurrentCached = Boolean(isCached || (cachedData && !evaluationText));

  // 간단한 마크다운 파서 렌더러
  const renderFormattedContent = (content: string) => {
    if (!content) return null;

    const lines = content.split("\n");
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <div key={idx} style={{ height: "8px" }} />;
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
            <Sparkles size={14} color="#FF5F15" />
            <span>{headerText}</span>
          </SectionHeader>
        );
      }

      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        return (
          <BulletItem key={idx}>
            <BulletDot />
            <div>{formattedParts}</div>
          </BulletItem>
        );
      }

      return <Paragraph key={idx}>{formattedParts}</Paragraph>;
    });
  };

  const bubbleVariants: Variants = {
    hidden: { scale: 0.7, opacity: 0, y: 20 },
    visible: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 28,
        mass: 0.8,
      },
    },
    exit: {
      scale: 0.7,
      opacity: 0,
      y: 15,
      transition: {
        duration: 0.18,
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
            <BubbleHeader>
              <HeaderLeft>
                <TorchAvatar src={ChatBulButtonImg} alt="횃불이" />
                <TitleWrapper>
                  <HeaderTitle>횃불이의 시간표 코칭</HeaderTitle>
                  <HeaderSubtitle>{timetableName}</HeaderSubtitle>
                </TitleWrapper>
              </HeaderLeft>

              <HeaderActions>
                {isCurrentCached && !isStreaming && !isLoading && (
                  <CacheTag title="기존에 분석된 시간표 평가 결과입니다">
                    <Zap size={11} />
                    <span>캐시됨</span>
                  </CacheTag>
                )}
                <IconButton
                  onClick={handleRefresh}
                  disabled={isStreaming || isLoading}
                  title="다시 평가받기"
                  aria-label="다시 평가받기"
                >
                  <RefreshCw
                    size={16}
                    className={isStreaming || isLoading ? "spin" : ""}
                  />
                </IconButton>
                <IconButton onClick={() => setIsOpen(false)} aria-label="닫기">
                  <X size={18} />
                </IconButton>
              </HeaderActions>
            </BubbleHeader>

            <BubbleBody ref={contentBodyRef}>
              {/* 1. 로딩 상태 */}
              {(isLoading || isCacheLoading) && !displayText && (
                <LoadingStateContainer>
                  <ScanningAvatarWrapper>
                    <ScanningAvatar src={ChatBulButtonImg} alt="분석 중" />
                    <ScanningRadar />
                  </ScanningAvatarWrapper>
                  <LoadingTitle>횃불이가 시간표 뜯어보는 중... 🔥</LoadingTitle>
                  <LoadingDesc>
                    공강 시간, 1교시, 점심시간까지 꼼꼼히 확인하고 있어요!
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
                  <AlertCircle size={32} color="#FF3B30" />
                  <ErrorMessage>{error}</ErrorMessage>
                  <RetryButton onClick={handleRefresh}>
                    <RefreshCw size={14} />
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
                </ContentArea>
              )}

              {/* 4. 초기 미분석 상태 */}
              {!isLoading && !isCacheLoading && !error && !displayText && (
                <EmptyStateContainer>
                  <p>아직 평가를 받지 않았어요!</p>
                  <StartButton onClick={() => startEvaluation(false)}>
                    <Sparkles size={16} />
                    횃불이에게 시간표 평가받기
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
          animate={{ y: [0, -6, 0] }}
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
  bottom: 160px;
  right: 16px;
  width: calc(100vw - 32px);
  max-width: 360px;
  max-height: 480px;
  background: #ffffff;
  border-radius: 24px;
  box-shadow:
    0 20px 40px -10px rgba(0, 0, 0, 0.22),
    0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 95, 21, 0.18);
  display: flex;
  flex-direction: column;
  z-index: 1001;
  overflow: hidden;
  transform-origin: bottom right;

  @media (min-width: 1024px) {
    right: calc(50% - 600px + 16px);
  }
`;

const BubbleTail = styled.div`
  position: absolute;
  bottom: -10px;
  right: 28px;
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 10px solid #ffffff;
  filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.05));
`;

const BubbleHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: linear-gradient(135deg, #fff7f2 0%, #fff1ea 100%);
  border-bottom: 1px solid rgba(255, 95, 21, 0.1);
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const TorchAvatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: contain;
  background: #ffffff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
`;

const TitleWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const HeaderTitle = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: #1c1c1e;
`;

const HeaderSubtitle = styled.span`
  font-size: 11px;
  color: #8e8e93;
  font-weight: 500;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const CacheTag = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  background: #eef2ff;
  color: #4f46e5;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 6px;
`;

const IconButton = styled.button`
  background: rgba(0, 0, 0, 0.05);
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #48484a;
  transition: all 0.15s;

  &:hover {
    background: rgba(0, 0, 0, 0.1);
    color: #1c1c1e;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .spin {
    animation: ${spin} 1s linear infinite;
  }
`;

const BubbleBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  font-size: 14px;
  line-height: 1.65;
  color: #2c2c2e;
  word-break: break-word;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #e5e5ea;
    border-radius: 4px;
  }
`;

const LoadingStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 10px;
  text-align: center;
`;

const ScanningAvatarWrapper = styled.div`
  position: relative;
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
`;

const ScanningAvatar = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  animation: ${pulse} 2s ease-in-out infinite;
`;

const ScanningRadar = styled.div`
  position: absolute;
  inset: -6px;
  border: 2px dashed #ff5f15;
  border-radius: 50%;
  animation: ${spin} 6s linear infinite;
`;

const LoadingTitle = styled.h4`
  font-size: 15px;
  font-weight: 700;
  color: #1c1c1e;
  margin: 0 0 6px 0;
`;

const LoadingDesc = styled.p`
  font-size: 12px;
  color: #8e8e93;
  margin: 0 0 16px 0;
  line-height: 1.4;
`;

const DotsLoader = styled.div`
  display: flex;
  gap: 6px;

  span {
    width: 6px;
    height: 6px;
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
  padding: 24px 10px;
`;

const ErrorMessage = styled.p`
  font-size: 13px;
  color: #ff3b30;
  margin: 12px 0 16px 0;
`;

const RetryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: #ff3b30;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 13px;
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
  font-size: 13px;
  padding: 2px 6px;
  border-radius: 6px;
  border: 1px solid rgba(234, 88, 12, 0.2);
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 700;
  color: #ff5f15;
  margin-top: 12px;
  margin-bottom: 4px;
`;

const BulletItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin: 3px 0;
  line-height: 1.5;
`;

const BulletDot = styled.span`
  width: 4px;
  height: 4px;
  background: #ff5f15;
  border-radius: 50%;
  margin-top: 8px;
  flex-shrink: 0;
`;

const Paragraph = styled.div`
  margin: 4px 0;
  line-height: 1.6;
`;

const TypingCursor = styled.span`
  display: inline-block;
  margin-left: 2px;

  span {
    display: inline-block;
    width: 6px;
    height: 14px;
    background: #ff5f15;
    animation: ${blink} 0.8s infinite;
    vertical-align: middle;
  }
`;

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 30px 10px;

  p {
    font-size: 13px;
    color: #8e8e93;
    margin-bottom: 16px;
  }
`;

const StartButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #ff5f15 0%, #ff3b30 100%);
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(255, 95, 21, 0.35);
  transition: transform 0.15s;

  &:active {
    transform: scale(0.96);
  }
`;

export default TimetableAiEvaluationBubble;
