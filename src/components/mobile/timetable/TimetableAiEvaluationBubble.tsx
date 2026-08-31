import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import styled, { keyframes } from "styled-components";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Sparkles, Copy, RefreshCw } from "lucide-react";
import Icon from "@/components/common/Icon";
import { EvaluationButtonIcon as TimetableAiEvalButtonIcon } from "@/resources/assets/illustrations/timetable";
import {
  TorchAiLogoIcon,
  TimetableEvaluateTorchIcon as TimetableTorchIcon,
} from "@/resources/assets/illustrations/ai";
import { BOTTOM_NAV_SAFE_HEIGHT } from "@/containers/mobile/common/MobileBottomNav";
import { useTimeTableEvaluation } from "@/hooks/useTimeTableEvaluation";
import { useSheetBackHandler } from "@/hooks/useSheetBackHandler";
import { mixpanelTrack } from "@/utils/mixpanel";

interface TimetableAiEvaluationBubbleProps {
  timetableId: number | null | undefined;
  timetableName?: string;
  hasEvents: boolean;
  eventsKey?: any;
}

const TimetableAiEvaluationBubble = ({
  timetableId,
  hasEvents,
  eventsKey,
}: TimetableAiEvaluationBubbleProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useSheetBackHandler(isOpen, () => setIsOpen(false));

  const {
    cachedData,
    isCacheLoading,
    evaluationText,
    isStreaming,
    isLoading,
    error,
    remainingCount,
    startEvaluation,
  } = useTimeTableEvaluation(timetableId, eventsKey);

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
      if (!isCacheLoading && !cachedData && !evaluationText && !isStreaming) {
        startEvaluation(false);
      }
    }
  };

  // 말풍선이 열린 상태에서 캐시 조회가 끝났는데 유효 캐시/텍스트가 없다면(시간표 변경 등) 자동 스트리밍 시작
  useEffect(() => {
    if (
      isOpen &&
      hasEvents &&
      !isCacheLoading &&
      !cachedData &&
      !evaluationText &&
      !isStreaming &&
      !isLoading &&
      !error
    ) {
      startEvaluation(false);
    }
  }, [
    isOpen,
    hasEvents,
    isCacheLoading,
    cachedData,
    evaluationText,
    isStreaming,
    isLoading,
    error,
    startEvaluation,
  ]);

  const handleRetry = () => {
    if (isStreaming || isLoading) return;

    if (remainingCount <= 0) {
      alert(
        "동일한 시간표에서는 최대 3회까지만 다시 생성할 수 있어! 시간표 강의나 일정을 변경하면 새롭게 평가받을 수 있어 🔥",
      );
      return;
    }

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

  // 표시할 본문 결정 (실시간 스트리밍 텍스트 -> 캐시 데이터 순)
  const displayText = evaluationText || (cachedData?.content ?? "");

  // 인라인 마크다운 렌더링 (굵은기울임 ***, 굵게 **, 하이라이트 `, 기울임 *)
  const renderInlineMarkdown = (text: string) => {
    if (!text) return null;

    // ***굵은기울임***, **볼드**, `코드/뱃지`, *기울임* 토큰 분리 (긴 패턴 우선)
    const parts = text.split(/(\*\*\*[^*]+?\*\*\*|\*\*[^*]+?\*\*|`[^`]+?`|\*[^*]+?\*)/g);

    return parts.map((part, pIdx) => {
      if (part.startsWith("***") && part.endsWith("***") && part.length >= 6) {
        return (
          <BoldText key={pIdx}>
            <em>{part.slice(3, -3)}</em>
          </BoldText>
        );
      }
      if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
        return <BoldText key={pIdx}>{part.slice(2, -2)}</BoldText>;
      }
      if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
        return <HighlightBadge key={pIdx}>{part.slice(1, -1)}</HighlightBadge>;
      }
      if (
        part.startsWith("*") &&
        part.endsWith("*") &&
        part.length >= 2 &&
        !part.startsWith("**")
      ) {
        return <em key={pIdx}>{part.slice(1, -1)}</em>;
      }
      // 스트리밍 도중 마지막 토큰이 닫히지 않은 기호로 시작할 경우
      if (isStreaming) {
        if (part.startsWith("***") && part.length > 3) {
          return (
            <BoldText key={pIdx}>
              <em>{part.slice(3)}</em>
            </BoldText>
          );
        }
        if (part.startsWith("**") && part.length > 2) {
          return <BoldText key={pIdx}>{part.slice(2)}</BoldText>;
        }
      }
      return part;
    });
  };

  // 마크다운 형식의 텍스트를 자연스럽게 렌더링
  const renderFormattedContent = (content: string) => {
    if (!content) return null;

    const lines = content.split("\n");
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <div key={idx} style={{ height: "6px" }} />;
      }

      // 0. 가로 구분선 (***, ---, ___)
      if (/^(\*{3,}|-{3,}|_{3,})$/.test(trimmed)) {
        return <HorizontalDivider key={idx} />;
      }

      // 1. 헤더 (#, ##, ### 뒤에 공백)
      if (/^#{1,6}\s+/.test(trimmed)) {
        const headerText = trimmed.replace(/^#{1,6}\s+/, "");
        return (
          <SectionHeader key={idx}>
            <Sparkles size={13} color="#FF5F15" />
            <span>{renderInlineMarkdown(headerText)}</span>
          </SectionHeader>
        );
      }

      // 2. 번호 목록 (1. , 2. 등)
      if (/^\d+\.\s+/.test(trimmed)) {
        const numberPrefix = trimmed.match(/^(\d+\.)\s+/)?.[1] || "";
        const listText = trimmed.replace(/^\d+\.\s+/, "");
        return (
          <NumberedItem key={idx}>
            <NumberLabel>{numberPrefix}</NumberLabel>
            <div>{renderInlineMarkdown(listText)}</div>
          </NumberedItem>
        );
      }

      // 3. 불릿 목록 (-, *, •, + 뒤에 반드시 공백이 있는 경우만)
      if (/^[-*•+]\s+/.test(trimmed)) {
        const bulletText = trimmed.replace(/^[-*•+]\s+/, "");
        return (
          <BulletItem key={idx}>
            <BulletDot />
            <div>{renderInlineMarkdown(bulletText)}</div>
          </BulletItem>
        );
      }

      // 4. 일반 문단
      return <Paragraph key={idx}>{renderInlineMarkdown(line)}</Paragraph>;
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

  return createPortal(
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 배경 흐림 및 딤 효과 백드롭 (헤더/바텀바 포함 전체 화면 덮음) */}
            <Backdrop
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />

            <BubbleWrapper
              variants={bubbleVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* 말풍선 상단 (자연스럽게 녹아든 헤더) */}
              <BubbleTopBar>
                <ProfileGroup>
                  <TorchAvatar>
                    <TimetableTorchIcon aria-hidden="true" />
                  </TorchAvatar>
                  <TorchName>횃불이의 시간표 평가 😎</TorchName>
                </ProfileGroup>

                <CloseButton onClick={() => setIsOpen(false)} aria-label="닫기">
                  <Icon name="close-md" size={17} />
                </CloseButton>
              </BubbleTopBar>

              {/* 말풍선 본문 */}
              <BubbleBody>
                {/* 1. 로딩 상태: 캐시 확인 중이거나, AI 스트리밍 요청 후 첫 텍스트 도착 전 */}
                {(isLoading || isCacheLoading || isStreaming) && !displayText && (
                  <LoadingStateContainer>
                    <ScanningAvatarWrapper>
                      <TimetableTorchIcon aria-hidden="true" />
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
                    <Icon name="circle-warning" size={28} color="#FF3B30" />
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
                      <>
                        <MessageFooter>
                          <ActionButton onClick={handleCopy} title="답변 복사">
                            {copied ? (
                              <Icon name="check" size={12} color="#52c41a" />
                            ) : (
                              <Copy size={12} />
                            )}
                            <span>{copied ? "복사됨" : "복사"}</span>
                          </ActionButton>

                          <ActionButton
                            onClick={handleRetry}
                            title={
                              remainingCount > 0
                                ? `다시 생성 (남은 횟수: ${remainingCount}회)`
                                : "동일 시간표 재생성 횟수(3회)를 모두 사용했습니다."
                            }
                            $disabled={remainingCount <= 0}
                          >
                            <RefreshCw size={12} />
                            <span>
                              다시 생성{" "}
                              {remainingCount > 0
                                ? `(${remainingCount}/3)`
                                : "(0/3)"}
                            </span>
                          </ActionButton>
                        </MessageFooter>

                        <AiDisclaimerBadge>
                          <TorchAiLogoIcon width={28} height={28} aria-hidden="true" />
                          <AiDisclaimerText>
                            <strong>횃불이 AI</strong>로 생성된 콘텐츠입니다.
                            <br />
                            중요한 내용은 직접 확인하세요.
                          </AiDisclaimerText>
                        </AiDisclaimerBadge>
                      </>
                    )}
                  </ContentArea>
                )}

                {/* 4. 초기 미분석 상태 */}
                {!isLoading && !isCacheLoading && !isStreaming && !error && !displayText && (
                  <EmptyStateContainer>
                    <p>아직 평가를 받지 않았어!</p>
                    <StartButton
                      onClick={() => startEvaluation(false)}
                      disabled={isLoading || isStreaming}
                    >
                      <Sparkles size={15} />
                      시간표 평가받기
                    </StartButton>
                  </EmptyStateContainer>
                )}
              </BubbleBody>

              {/* 말풍선 꼬리 */}
              <BubbleTail />
            </BubbleWrapper>
          </>
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
          <TimetableAiEvalButtonIcon width="100%" height="100%" aria-hidden="true" />
        </AiButton>
      </FloatingButtonContainer>
    </>,
    document.body
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

const Backdrop = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  z-index: 10001;
  -webkit-tap-highlight-color: transparent;
`;

const FloatingButtonContainer = styled.div`
  position: fixed;
  bottom: calc(${BOTTOM_NAV_SAFE_HEIGHT} + 6px);
  right: 10px;
  width: 88px;
  height: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 90;

  @media (min-width: 1024px) {
    bottom: 80px;
    right: calc(50% - 600px + 10px);
  }
`;

const AiButton = styled(motion.button)`
  position: relative;
  width: 100%;
  height: 100%;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
  -webkit-tap-highlight-color: transparent;

  svg {
    width: 100%;
    height: 100%;
    display: block;
  }
`;

const BubbleWrapper = styled(motion.div)`
  position: fixed;
  bottom: calc(${BOTTOM_NAV_SAFE_HEIGHT} + 6px + 112px);
  left: 15px;
  right: 15px;
  width: auto;
  max-width: none;
  max-height: min(480px, calc(100dvh - ${BOTTOM_NAV_SAFE_HEIGHT} - 190px));
  min-height: 120px;
  background: #ffffff;
  border-radius: 20px 20px 6px 20px;
  box-shadow:
    0 16px 36px -8px rgba(0, 0, 0, 0.18),
    0 3px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.07);
  display: flex;
  flex-direction: column;
  z-index: 10003;
  overflow: visible;

  @media (max-height: 650px) {
    max-height: calc(100dvh - ${BOTTOM_NAV_SAFE_HEIGHT} - 150px);
  }

  @media (min-width: 1024px) {
    bottom: calc(80px + 112px);
    left: auto;
    right: calc(50% - 600px + 15px);
    width: 380px;
    max-width: 380px;
    max-height: min(600px, calc(100vh - 220px));
  }
`;

const BubbleTail = styled.div`
  position: absolute;
  bottom: -7px;
  right: 28px;
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
  flex-shrink: 0;
`;

const ProfileGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TorchAvatar = styled.div`
  width: 20px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 100%;
    height: 100%;
    display: block;
  }
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
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;

  svg {
    width: 32px;
    height: 45px;
    animation: ${pulse} 2s ease-in-out infinite;
  }
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

const HorizontalDivider = styled.div`
  width: 100%;
  height: 1px;
  background-color: rgba(0, 0, 0, 0.06);
  margin: 8px 0;
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

  > div {
    flex: 1;
  }
`;

const BulletDot = styled.span`
  width: 3.5px;
  height: 3.5px;
  background: #ff5f15;
  border-radius: 50%;
  margin-top: 7px;
  flex-shrink: 0;
`;

const NumberedItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 4px;
  margin: 3px 0;
  line-height: 1.5;

  > div {
    flex: 1;
  }
`;

const NumberLabel = styled.span`
  font-weight: 700;
  color: #ff5f15;
  font-size: 13px;
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

const AiDisclaimerBadge = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 6px;
  width: 100%;
  margin-top: 10px;
  font-size: 10.5px;
  color: #8e8e93;

  svg {
    width: 28px;
    height: 28px;
    flex-shrink: 0;
  }
`;

const AiDisclaimerText = styled.span`
  display: block;
  line-height: 1.35;
  text-align: left;
  word-break: keep-all;

  strong {
    font-weight: 600;
    color: #636366;
  }
`;

const ActionButton = styled.button<{ $disabled?: boolean }>`
  background: none;
  border: none;
  padding: 4px 6px;
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  color: ${({ $disabled }) => ($disabled ? "#c7c7cc" : "#8e8e93")};
  display: flex;
  align-items: center;
  gap: 4px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  transition: all 0.15s ease;
  opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};

  &:hover {
    color: ${({ $disabled }) => ($disabled ? "#c7c7cc" : "#1c1c1e")};
    background-color: ${({ $disabled }) =>
      $disabled ? "transparent" : "rgba(0, 0, 0, 0.05)"};
  }

  &:active {
    transform: ${({ $disabled }) => ($disabled ? "none" : "scale(0.95)")};
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
