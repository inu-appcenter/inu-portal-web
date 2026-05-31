import styled, { css } from "styled-components";

interface OptionCardProps {
  selected: boolean;
  type?: "radio" | "checkbox";
  title: string;
  description: string;
  onClick?: () => void;
}

export default function OptionCard({
  selected,
  type = "radio",
  title,
  description,
  onClick,
}: OptionCardProps) {
  return (
    <CardWrapper $selected={selected} onClick={onClick}>
      <TextGroup>
        <CardTitle>{title}</CardTitle>
        <CardDesc>{description}</CardDesc>
      </TextGroup>

      <ControlArea>
        {type === "radio" && (
          <RadioCircle $selected={selected}>
            {selected && <RadioDot />}
          </RadioCircle>
        )}
      </ControlArea>
    </CardWrapper>
  );
}

const CardWrapper = styled.div<{ $selected: boolean }>`
  width: 100%;
  box-sizing: border-box;
  border-radius: 12px;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  ${({ $selected }) =>
    $selected
      ? css`
          border: 2px solid var(--border-brand, #0061ff);
          background: var(--bg-brand-subtle, #eff6ff);
          box-shadow: 0 4px 16px 0 rgba(59, 130, 246, 0.08);
        `
      : css`
          border: 1px solid var(--border-default, #e5e8eb);
          background: var(--bg-subtle, #f8f9fb);
        `}

  &:active {
    transform: scale(0.99);
  }
`;

const TextGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
`;

const CardTitle = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary, #191f28);
  line-height: 24px;
`;

const CardDesc = styled.span`
  font-size: 13px;
  font-weight: 400;
  color: var(--text-tertiary, #8b95a1);
  line-height: 18px;
`;

const ControlArea = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-left: 16px;
`;

const RadioCircle = styled.div<{ $selected: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease-in-out;

  ${({ $selected }) =>
    $selected
      ? css`
          background-color: var(--interactive-primary, #3b82f6);
          border: none;
        `
      : css`
          border: 2px solid var(--border-strong, #d1d6db);
          background-color: transparent;
        `}
`;

const RadioDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #ffffff;
`;
