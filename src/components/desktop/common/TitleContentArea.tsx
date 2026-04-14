import styled from "styled-components";
import TitleLine from "./TitleLine.tsx";
import { CSSProperties } from "react";

interface TitleContentAreaProps {
  title?: string | React.ReactNode;
  link?: string;
  externalLink?: string;
  description?: string;
  children?: React.ReactNode;
  style?: CSSProperties;
}

const TitleContentArea = ({
  title,
  link,
  externalLink,
  description,
  children,
  style,
}: TitleContentAreaProps) => {
  return (
    <TitleContentAreaWrapper style={style}>
      {(title || description) && (
        <HeaderWrapper>
          {title && (
            <TitleLine title={title} link={link} externalLink={externalLink} />
          )}
          {description && <DescriptionText>{description}</DescriptionText>}
        </HeaderWrapper>
      )}

      {children}
    </TitleContentAreaWrapper>
  );
};

export default TitleContentArea;

const TitleContentAreaWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  width: 100%;
  height: fit-content;

  gap: 8px;
`;

const HeaderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
`;

const DescriptionText = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0;
  text-align: start;
  width: 100%;
  line-height: normal;

  padding: 0 20px;
`;
