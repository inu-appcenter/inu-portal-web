import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ChevronDown, ChevronUp, CheckCircle2, Wrench, Sparkles, Loader2 } from "lucide-react";

export interface AgentThoughtItem {
  hop: number;
  thought: string;
  tools?: string[];
}

interface AgentReasoningAccordionProps {
  thoughts: AgentThoughtItem[];
  isStreaming?: boolean;
}

const TOOL_NAME_KO: Record<string, string> = {
  WEATHER: "기상청 날씨",
  CAFETERIA: "학식 메뉴",
  BUS: "실시간 셔틀/버스",
  TIMETABLE: "시간표 및 강의실",
  TIMETABLE_GAP: "공강 시간 분석",
  SCHEDULE: "학사일정",
  NOTICE: "대학 공지사항",
  DIRECTORY: "교내 교직원 연락처",
  ACADEMIC: "학적 및 취득학점",
  LIBRARY: "학산도서관 좌석/열람실",
  LMS: "사이버캠퍼스(LMS) 과제",
  ACTION_CHAT_PUSH: "채팅 푸시 알림",
  ACTION_DAILY_BRIEF: "아침 데일리 브리프",
  ACTION_NOTICE_KEYWORD: "공지 키워드 알림",
  ACTION_MY_SETTINGS: "내 설정 조회",
  ACADEMIC_SSO: "모바일 학사 SSO",
  LIBRARY_SEATS: "도서관 좌석 관제",
  LMS_CALENDAR: "사이버캠퍼스 일정",
  LMS_ASSIGNMENTS: "LMS 과제",
};

export const AgentReasoningAccordion: React.FC<AgentReasoningAccordionProps> = ({
  thoughts,
  isStreaming = false,
}) => {
  // 스트리밍 중일 때는 기본으로 펼쳐놓고, 완료 후에는 기본 접힘 상태 (사용자가 클릭 시 펼침)
  const [isOpen, setIsOpen] = useState(isStreaming);

  if (!thoughts || thoughts.length === 0) {
    return null;
  }

  const latestThought = thoughts[thoughts.length - 1];
  const totalHops = Math.max(...thoughts.map((t) => t.hop), thoughts.length);

  return (
    <AccordionWrapper>
      <AccordionHeader
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        $isStreaming={isStreaming}
      >
        <HeaderLeft>
          <IconBox $isStreaming={isStreaming}>
            {isStreaming ? (
              <RotatingLoader size={14} />
            ) : (
              <Brain size={14} />
            )}
          </IconBox>
          <HeaderTextGroup>
            <HeaderTitle>
              {isStreaming ? (
                <>자율 추론 중 <HopBadge>{latestThought.hop}단계</HopBadge></>
              ) : (
                <>추론 과정 확인 <CompletedBadge>{totalHops}단계 완료</CompletedBadge></>
              )}
            </HeaderTitle>
            {isStreaming && (
              <ActiveThoughtPreview>
                {latestThought.thought}
              </ActiveThoughtPreview>
            )}
          </HeaderTextGroup>
        </HeaderLeft>

        <HeaderRight>
          <ToggleText>{isOpen ? "접기" : "자세히"}</ToggleText>
          {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </HeaderRight>
      </AccordionHeader>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <ThoughtTimeline>
              {thoughts.map((item, idx) => {
                const isCurrentItem = isStreaming && idx === thoughts.length - 1;
                return (
                  <TimelineStep key={`${item.hop}-${idx}`}>
                    <StepIndicator>
                      <StepDot $isCurrent={isCurrentItem}>
                        {isCurrentItem ? (
                          <DotPulse />
                        ) : (
                          <CheckCircle2 size={13} color="#0061ff" />
                        )}
                      </StepDot>
                      {idx < thoughts.length - 1 && <StepLine />}
                    </StepIndicator>

                    <StepContent>
                      <StepHeader>
                        <StepHopLabel>
                          <Sparkles size={11} color="#0061ff" /> {item.hop}단계 추론
                        </StepHopLabel>
                        {item.tools && item.tools.length > 0 && (
                          <ToolTagGroup>
                            {item.tools.map((t) => (
                              <ToolTag key={t}>
                                <Wrench size={10} />
                                {TOOL_NAME_KO[t.toUpperCase()] || t}
                              </ToolTag>
                            ))}
                          </ToolTagGroup>
                        )}
                      </StepHeader>
                      <StepThoughtText>{item.thought}</StepThoughtText>
                    </StepContent>
                  </TimelineStep>
                );
              })}
            </ThoughtTimeline>
          </motion.div>
        )}
      </AnimatePresence>
    </AccordionWrapper>
  );
};

// Keyframes
const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0% { transform: scale(0.95); opacity: 0.6; }
  50% { transform: scale(1.15); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.6; }
`;

const AccordionWrapper = styled.div`
  width: 100%;
  max-width: 100%;
  margin-bottom: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  transition: border-color 0.2s;

  &:hover {
    border-color: #cbd5e1;
  }
`;

const AccordionHeader = styled.button<{ $isStreaming: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  gap: 8px;

  &:hover {
    background: rgba(0, 97, 255, 0.03);
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
`;

const IconBox = styled.div<{ $isStreaming: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => (props.$isStreaming ? "#eff6ff" : "#e2e8f0")};
  color: ${(props) => (props.$isStreaming ? "#0061ff" : "#475569")};
  flex-shrink: 0;
`;

const RotatingLoader = styled(Loader2)`
  animation: ${rotate} 1.2s linear infinite;
`;

const HeaderTextGroup = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
`;

const HeaderTitle = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const HopBadge = styled.span`
  font-size: 10px;
  font-weight: 700;
  color: #0061ff;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  padding: 1px 6px;
  border-radius: 9999px;
`;

const CompletedBadge = styled.span`
  font-size: 10px;
  font-weight: 600;
  color: #059669;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  padding: 1px 6px;
  border-radius: 9999px;
`;

const ActiveThoughtPreview = styled.div`
  font-size: 11px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 1px;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #64748b;
  flex-shrink: 0;
`;

const ToggleText = styled.span`
  font-size: 11px;
  font-weight: 500;
`;

const ThoughtTimeline = styled.div`
  padding: 8px 12px 12px 12px;
  border-top: 1px dashed #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const TimelineStep = styled.div`
  display: flex;
  gap: 10px;
  position: relative;
`;

const StepIndicator = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 16px;
  flex-shrink: 0;
  padding-top: 2px;
`;

const StepDot = styled.div<{ $isCurrent: boolean }>`
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DotPulse = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #0061ff;
  animation: ${pulse} 1.2s infinite ease-in-out;
`;

const StepLine = styled.div`
  width: 1.5px;
  flex: 1;
  background: #cbd5e1;
  margin-top: 4px;
  margin-bottom: -4px;
`;

const StepContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const StepHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 3px;
`;

const StepHopLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ToolTagGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const ToolTag = styled.span`
  font-size: 10px;
  font-weight: 600;
  color: #0369a1;
  background: #e0f2fe;
  padding: 1px 6px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 3px;
`;

const StepThoughtText = styled.div`
  font-size: 12px;
  line-height: 1.45;
  color: #475569;
  word-break: break-word;
`;
