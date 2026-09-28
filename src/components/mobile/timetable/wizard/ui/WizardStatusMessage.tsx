import styled from "styled-components";
import { typo } from "./tokens";

interface WizardStatusMessageProps {
  /** 횃불이 일러스트 (240×246) */
  illustration?: string;
  title: string;
  description?: React.ReactNode;
  /** 설명 아래 내용 — 실패_겹침의 충돌 강의 카드 등 */
  children?: React.ReactNode;
}

/** 생성 실패·결과 없음 안내 (Figma 실패_겹침/지정공강/학점범위 Content) */
const WizardStatusMessage = ({
  illustration,
  title,
  description,
  children,
}: WizardStatusMessageProps) => (
  <Wrapper>
    {illustration && <Illustration src={illustration} alt="" />}
    <Texts>
      <Title>{title}</Title>
      {description && <Description>{description}</Description>}
    </Texts>
    {children}
  </Wrapper>
);

export default WizardStatusMessage;

const Wrapper = styled.div`
  width: 100%;
  box-sizing: border-box;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
`;

const Illustration = styled.img`
  width: 240px;
  height: 246px;
  object-fit: contain;
`;

const Texts = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: center;
  word-break: keep-all;
`;

const Title = styled.h2`
  margin: 0;
  color: var(--text-primary, #191f28);
  ${typo.heading1}
`;

const Description = styled.p`
  margin: 0;
  color: var(--text-secondary, #333d4b);
  ${typo.body2}
`;
