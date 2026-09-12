import React, { useState, useEffect } from "react";
import styled, { keyframes, css } from "styled-components";
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Loader2,
  Wrench,
  BrainCircuit,
  BookOpen,
  Bus,
  Utensils,
  Calendar,
  Clock,
  CloudSun,
  ShieldCheck,
  FileText,
} from "lucide-react";

export interface AgentProcessStep {
  status: "ROUTING" | "EXECUTING" | "CHAINING" | "STREAMING" | "DONE" | string;
  message?: string;
  thought?: string;
  tools?: string[];
  hop?: number;
}

const pulseGlow = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(9, 88, 217, 0.2); }
  70% { box-shadow: 0 0 0 6px rgba(9, 88, 217, 0); }
  100% { box-shadow: 0 0 0 0 rgba(9, 88, 217, 0); }
`;

const rotateAnim = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const AccordionContainer = styled.div<{ $isDone: boolean }>`
  width: 100%;
  margin-bottom: 12px;
  border-radius: 12px;
  background: ${(props) => (props.$isDone ? "#f8fafc" : "#f0f7ff")};
  border: 1px solid ${(props) => (props.$isDone ? "#e2e8f0" : "#bae0ff")};
  font-size: 13px;
  color: #334155;
  transition: all 0.2s ease;
  overflow: hidden;
  ${(props) =>
    !props.$isDone &&
    css`
      animation: ${pulseGlow} 2s infinite;
    `}
`;

const AccordionHeader = styled.div<{ $isDone: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  cursor: pointer;
  user-select: none;
  background: transparent;

  &:hover {
    background: rgba(0, 0, 0, 0.02);
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
`;

const StatusIconWrapper = styled.div<{ $status: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => (props.$status === "DONE" ? "#10b981" : "#0958d9")};

  .spinner {
    animation: ${rotateAnim} 1.2s linear infinite;
  }
`;

const StatusLabel = styled.span`
  color: #1e293b;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #64748b;
  font-size: 12px;
`;

const ToolBadgeList = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
`;

const ToolBadge = styled.span<{ $tool: string }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 7px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  background: ${(props) => {
    if (props.$tool.includes("INU_AI")) return "#eff6ff";
    if (props.$tool.includes("BUS")) return "#ecfdf5";
    if (props.$tool.includes("CAFETERIA")) return "#fff7ed";
    return "#f1f5f9";
  }};
  color: ${(props) => {
    if (props.$tool.includes("INU_AI")) return "#1d4ed8";
    if (props.$tool.includes("BUS")) return "#047857";
    if (props.$tool.includes("CAFETERIA")) return "#c2410c";
    return "#475569";
  }};
  border: 1px solid
    ${(props) => {
      if (props.$tool.includes("INU_AI")) return "#bfdbfe";
      if (props.$tool.includes("BUS")) return "#a7f3d0";
      if (props.$tool.includes("CAFETERIA")) return "#ffedd5";
      return "#e2e8f0";
    }};
`;

const AccordionContent = styled.div`
  padding: 10px 14px 12px;
  border-top: 1px dashed #e2e8f0;
  font-size: 12px;
  line-height: 1.5;
  background: #ffffff;
`;

const ThoughtBox = styled.div`
  padding: 8px 10px;
  border-radius: 8px;
  background: #f8fafc;
  border-left: 3px solid #0958d9;
  color: #475569;
  margin-top: 6px;
  white-space: pre-wrap;
  word-break: keep-all;
`;

const getToolMeta = (toolName: string) => {
  const upper = toolName.toUpperCase();
  if (upper.includes("INU_AI")) return { label: "inuai 학칙 RAG", icon: <BookOpen size={12} /> };
  if (upper.includes("BUS")) return { label: "버스", icon: <Bus size={12} /> };
  if (upper.includes("CAFETERIA")) return { label: "학식", icon: <Utensils size={12} /> };
  if (upper.includes("TIMETABLE")) return { label: "시간표", icon: <Clock size={12} /> };
  if (upper.includes("SCHEDULE")) return { label: "학사일정", icon: <Calendar size={12} /> };
  if (upper.includes("WEATHER")) return { label: "날씨", icon: <CloudSun size={12} /> };
  if (upper.includes("ACADEMIC")) return { label: "학적조회", icon: <ShieldCheck size={12} /> };
  if (upper.includes("NOTICE")) return { label: "공지검색", icon: <FileText size={12} /> };
  return { label: toolName, icon: <Wrench size={12} /> };
};

interface AgentProcessAccordionProps {
  process: AgentProcessStep;
  isStreaming: boolean;
}

export const AgentProcessAccordion: React.FC<AgentProcessAccordionProps> = ({
  process,
  isStreaming,
}) => {
  const isDone = !isStreaming || process.status === "DONE" || process.status === "STREAMING";
  const [isOpen, setIsOpen] = useState(!isDone);

  // 스트리밍 중에는 자동으로 열어두고, 스트리밍이 끝나면 축약 모드로 전환
  useEffect(() => {
    if (!isDone) {
      setIsOpen(true);
    }
  }, [isDone]);

  const tools = process.tools || [];

  const getStatusText = () => {
    switch (process.status) {
      case "ROUTING":
        return "질문 의도를 분석하고 캠퍼스 도구를 선별하고 있습니다...";
      case "EXECUTING":
        return "선택된 캠퍼스 도구와 학사 지식베이스를 조회하고 있습니다...";
      case "CHAINING":
        return `연계 정보(${process.hop || 2}단계)를 추가로 자율 탐색하고 있습니다...`;
      case "STREAMING":
      case "DONE":
        return tools.length > 0
          ? `${tools.length}개의 캠퍼스 도구를 참조하여 답변을 작성했습니다.`
          : "캠퍼스 지식을 기반으로 답변을 작성했습니다.";
      default:
        return process.message || "캠퍼스 비서가 추론 중입니다...";
    }
  };

  return (
    <AccordionContainer $isDone={isDone}>
      <AccordionHeader $isDone={isDone} onClick={() => setIsOpen((prev) => !prev)}>
        <HeaderLeft>
          <StatusIconWrapper $status={isDone ? "DONE" : process.status}>
            {isDone ? (
              <CheckCircle2 size={15} />
            ) : process.status === "ROUTING" ? (
              <BrainCircuit size={15} className="spinner" />
            ) : (
              <Loader2 size={15} className="spinner" />
            )}
          </StatusIconWrapper>
          <StatusLabel>
            <Sparkles size={13} color="#0958d9" />
            {getStatusText()}
          </StatusLabel>
        </HeaderLeft>

        <HeaderRight>
          {tools.length > 0 && (
            <ToolBadgeList>
              {tools.map((tool, idx) => {
                const meta = getToolMeta(tool);
                return (
                  <ToolBadge key={idx} $tool={tool}>
                    {meta.icon}
                    {meta.label}
                  </ToolBadge>
                );
              })}
            </ToolBadgeList>
          )}
          {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </HeaderRight>
      </AccordionHeader>

      {isOpen && (
        <AccordionContent>
          <div style={{ fontWeight: 600, color: "#1e293b", marginBottom: "4px" }}>
            [에이전트 추론 및 도구 계획]
          </div>
          {process.thought ? (
            <ThoughtBox>{process.thought}</ThoughtBox>
          ) : (
            <div style={{ color: "#94a3b8" }}>
              사용자의 질문 맥락에 맞춰 필요한 도구를 호출하고 결과를 검증했습니다.
            </div>
          )}

          {tools.length > 0 && (
            <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ color: "#64748b" }}>실행된 에이전트:</span>
              <div style={{ display: "flex", gap: "4px" }}>
                {tools.map((tool, idx) => {
                  const meta = getToolMeta(tool);
                  return (
                    <ToolBadge key={idx} $tool={tool}>
                      {meta.icon}
                      {meta.label}
                    </ToolBadge>
                  );
                })}
              </div>
            </div>
          )}
        </AccordionContent>
      )}
    </AccordionContainer>
  );
};
