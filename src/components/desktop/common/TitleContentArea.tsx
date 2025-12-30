import styled from "styled-components";
import TitleLine from "./TitleLine.tsx";
import { CSSProperties } from "react";

interface TitleContentAreaProps {
  title: string | React.ReactNode;
  link?: string;
  externalLink?: string;
  description?: string;
  children: React.ReactNode;
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
      <TitleLine title={title} link={link} externalLink={externalLink} />
      {description && <DescriptionText>{description}</DescriptionText>}
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

  //width: 100%;
  height: fit-content;

  gap: 8px;
`;

const DescriptionText = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0 8px;
  text-align: start;
  width: 100%;
`;
