import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { ArrowRight, Square } from "lucide-react";
import { COLORS } from "./colors";

const InputWrapper = styled.div`
  position: absolute;
  bottom: max(20px, env(safe-area-inset-bottom));
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 40px);
  max-width: 800px;
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
    rgba(255, 255, 255, 0.56) 0%,
    rgba(253, 253, 253, 0.56) 81.73%,
    rgba(235, 235, 235, 0.56) 100%
  );
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 1px solid
    ${(props) =>
      props.$isFocused ? "rgba(9, 88, 217, 0.4)" : "rgba(255, 255, 255, 0.8)"};
`;

const InputForm = styled.form`
  display: flex;
  align-items: center;
  background: transparent;
  border-radius: 24px;
  padding: 6px 8px 6px 20px;
  border: none;
  width: 100%;
  position: relative;
  z-index: 1;
  min-height: 53px;
  box-sizing: border-box;
`;

const TextInput = styled.textarea`
  flex: 1;
  border: none;
  background: transparent;
  padding: 0;
  font-size: 16px;
  font-weight: 500;
  resize: none;
  outline: none;
  max-height: 120px;
  font-family:
    "Pretendard",
    -apple-system,
    sans-serif;
  color: #1c1e1e;
  line-height: 1.4;
  margin-right: 10px;
  align-self: center;

  &::placeholder {
    color: ${COLORS.textPlaceholder};
    font-weight: 500;
  }

  &::-webkit-scrollbar {
    width: 0;
  }
`;

const ActionButton = styled.button<{ $isActive: boolean; $isStop?: boolean }>`
  background-color: ${(props) => {
    if (props.$isStop) return "#ff4d4f";
    return props.$isActive ? COLORS.figmaBlue : "#c4c4c6";
  }};
  color: #ffffff;
  border: none;
  border-radius: 60px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${(props) =>
    props.$isActive || props.$isStop ? "pointer" : "default"};
  transition: all 0.2s ease;
  flex-shrink: 0;

  box-shadow: ${(props) =>
    props.$isActive && !props.$isStop
      ? "0px 0px 10px 0px rgba(145, 206, 255, 0.6)"
      : "none"};

  &:hover {
    transform: ${(props) =>
      props.$isActive || props.$isStop ? "scale(1.04)" : "none"};
  }

  &:active {
    transform: scale(0.98);
  }
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
  placeholder = "궁금한 점을 물어보세요!",
}) => {
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isLoading) {
      textareaRef.current?.blur();
      setIsFocused(false);
    }
  }, [isLoading]);

  const handleInputResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isLoading) {
      onStopGeneration?.();
      return;
    }
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      if (e.nativeEvent.isComposing) return;
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <InputWrapper>
      <GlowContainer $isFocused={isFocused} $isLoading={isLoading}>
        <InputForm onSubmit={handleSubmit}>
          <TextInput
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              handleInputResize();
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={isLoading ? "답변을 생성하고 있습니다..." : placeholder}
            disabled={isLoading}
          />
          <ActionButton
            type="submit"
            $isActive={input.trim().length > 0 || isLoading}
            $isStop={isLoading}
            disabled={!isLoading && !input.trim()}
            title={isLoading ? "응답 중지" : "전송"}
          >
            {isLoading ? (
              <Square size={16} fill="currentColor" />
            ) : (
              <ArrowRight size={20} strokeWidth={2.5} />
            )}
          </ActionButton>
        </InputForm>
      </GlowContainer>
    </InputWrapper>
  );
};
