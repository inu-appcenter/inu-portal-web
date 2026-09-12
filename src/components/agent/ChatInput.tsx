import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { ArrowRight, Square } from "lucide-react";

const InputWrapper = styled.div`
  position: absolute;
  bottom: max(20px, env(safe-area-inset-bottom));
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 40px);
  max-width: 820px;
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const GlowContainer = styled.div<{ $isFocused: boolean; $isLoading: boolean }>`
  position: relative;
  border-radius: 24px;
  background: linear-gradient(
    0deg,
    rgba(255, 255, 255, 0.75) 0%,
    rgba(253, 253, 253, 0.75) 81.73%,
    rgba(245, 245, 245, 0.75) 100%
  );
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0px 4px 16px 0px rgba(0, 0, 0, 0.08);
  transition: all 0.25s ease;
  border: 1px solid
    ${(props) =>
      props.$isFocused ? "rgba(9, 88, 217, 0.5)" : "rgba(226, 232, 240, 0.9)"};
`;

const InputForm = styled.form`
  display: flex;
  align-items: center;
  background: transparent;
  border-radius: 24px;
  padding: 6px 10px 6px 20px;
  border: none;
  width: 100%;
  position: relative;
  z-index: 1;
  min-height: 52px;
  box-sizing: border-box;
`;

const TextInput = styled.textarea`
  flex: 1;
  border: none;
  background: transparent;
  padding: 0;
  font-size: 15px;
  font-weight: 500;
  resize: none;
  outline: none;
  max-height: 120px;
  font-family: inherit;
  color: #1e293b;
  line-height: 1.45;
  margin-right: 10px;
  align-self: center;

  &::placeholder {
    color: #94a3b8;
    font-weight: 400;
  }

  &::-webkit-scrollbar {
    width: 0;
  }
`;

const ActionButton = styled.button<{ $isActive: boolean; $isStop?: boolean }>`
  background-color: ${(props) => {
    if (props.$isStop) return "#ef4444";
    return props.$isActive ? "#0958d9" : "#cbd5e1";
  }};
  color: #ffffff;
  border: none;
  border-radius: 50%;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${(props) =>
    props.$isActive || props.$isStop ? "pointer" : "default"};
  transition: all 0.2s ease;
  flex-shrink: 0;

  box-shadow: ${(props) =>
    props.$isActive && !props.$isStop
      ? "0px 2px 8px rgba(9, 88, 217, 0.35)"
      : "none"};

  &:hover {
    ${(props) =>
      props.$isActive &&
      !props.$isStop &&
      `background-color: #003eb3; transform: scale(1.04);`}
    ${(props) =>
      props.$isStop &&
      `background-color: #dc2626; transform: scale(1.04);`}
  }
`;

const Disclaimer = styled.div`
  text-align: center;
  font-size: 11px;
  color: #94a3b8;
  padding: 0 4px;
`;

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onStopGeneration?: () => void;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  onStopGeneration,
  placeholder = "학칙, 규정, 시간표, 학식, 버스 등 캠퍼스 생활을 물어보세요...",
}) => {
  const [text, setText] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [text]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) {
      onStopGeneration?.();
      return;
    }
    if (!text.trim()) return;

    onSendMessage(text.trim());
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      if (e.nativeEvent.isComposing) return;
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <InputWrapper>
      <GlowContainer $isFocused={isFocused} $isLoading={isLoading}>
        <InputForm onSubmit={handleSubmit}>
          <TextInput
            ref={textareaRef}
            rows={1}
            value={text}
            placeholder={placeholder}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
          />
          <ActionButton
            type="submit"
            $isActive={text.trim().length > 0}
            $isStop={isLoading}
            title={isLoading ? "생성 중단" : "전송"}
          >
            {isLoading ? <Square size={16} fill="#fff" /> : <ArrowRight size={18} />}
          </ActionButton>
        </InputForm>
      </GlowContainer>
      <Disclaimer>
        인팁 캠퍼스 비서는 학교 공식 학칙과 실시간 포털 정보를 연계하여 답변합니다.
      </Disclaimer>
    </InputWrapper>
  );
};
