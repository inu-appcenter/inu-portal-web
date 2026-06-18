import styled from "styled-components";
import { ChevronRight } from "lucide-react";
import React from "react";

interface LinkCardButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

const LinkCardButton = ({ label, ...props }: LinkCardButtonProps) => {
  return (
    <ButtonWrapper {...props}>
      <ContentRow>
        <LabelText>{label}</LabelText>
        <ChevronIcon size={18} />
      </ContentRow>
    </ButtonWrapper>
  );
};

export default LinkCardButton;

const ButtonWrapper = styled.button`
  display: flex;
  padding: 12px 8px 12px 20px;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-3, 12px);
  flex: 1 0 0;
  border-radius: 16px;
  border: 1px solid var(--border-default, #e5e8eb);
  background: var(--bg-base, #fff);
  color: var(--text-secondary, #333d4b);
  cursor: pointer;
  box-sizing: border-box;
  width: 100%;
  transition: all 0.15s ease-in-out;

  &:hover {
    background-color: var(--bg-muted, #f1f3f5);
  }

  &:active {
    transform: scale(0.99);
  }
`;

const ContentRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const LabelText = styled.span`
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 24px;
  color: var(--text-secondary, #333d4b);
`;

const ChevronIcon = styled(ChevronRight)`
  stroke-width: 2px;
  stroke: var(--text-secondary, #333d4b);
  color: var(--text-secondary, #333d4b);
  flex-shrink: 0;
`;
