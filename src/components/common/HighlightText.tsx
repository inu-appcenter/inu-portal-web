import styled from "styled-components";

interface HighlightTextProps {
  text?: string;
  className?: string;
}

export default function HighlightText({ text, className }: HighlightTextProps) {
  if (!text) return null;

  const parts = text.split(/(<mark>.*?<\/mark>)/g);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.startsWith("<mark>") && part.endsWith("</mark>")) {
          const content = part.slice(6, -7);
          return <StyledMark key={index}>{content}</StyledMark>;
        }
        return part;
      })}
    </span>
  );
}

const StyledMark = styled.mark`
  background-color: var(--bg-brand);
  color: var(--text-brand);
  font-weight: 600;
  padding: 0 3px;
  border-radius: 3px;
`;
