import styled from "styled-components";
import Icon from "@/components/common/Icon";
import { typography } from "@/styles/typography";
import type { PortalSyncTerm } from "@/constants/portalSyncTerms";

interface PortalSyncTermDetailProps {
  term: PortalSyncTerm;
  onBack?: () => void;
}

/** 포털 정보 불러오기 동의 항목의 상세 약관. 동의 시트와 포털 계정 관리 화면이 함께 쓴다. */
export default function PortalSyncTermDetail({
  term,
  onBack,
}: PortalSyncTermDetailProps) {
  return (
    <Wrapper>
      <Header $hasBack={Boolean(onBack)}>
        {onBack && (
          <BackButton type="button" onClick={onBack} aria-label="동의 목록으로 돌아가기">
            <Icon name="chevron-left" size={24} />
          </BackButton>
        )}
        <Title>{term.title}</Title>
      </Header>

      <Body>
        <Intro>{term.intro}</Intro>

        <Rows>
          {term.rows.map((row) => (
            <Row key={row.label}>
              <RowLabel>{row.label}</RowLabel>
              <RowLines>
                {row.lines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </RowLines>
            </Row>
          ))}
        </Rows>

        <Footer>{term.footer}</Footer>
      </Body>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

const Header = styled.div<{ $hasBack: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  min-height: 48px;
  padding: 0 16px 0 ${({ $hasBack }) => ($hasBack ? "4px" : "20px")};
`;

const BackButton = styled.button`
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  color: var(--text-primary);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
`;

const Title = styled.h2`
  margin: 0;
  ${typography.heading1}
  color: var(--text-primary);
`;

const Body = styled.div`
  max-height: 60vh;
  overflow-y: auto;
  padding: 8px 20px 4px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  word-break: keep-all;
`;

const Intro = styled.p`
  margin: 0;
  ${typography.body2}
  color: var(--text-secondary);
`;

const Rows = styled.dl`
  margin: 0;
  display: flex;
  flex-direction: column;
`;

const Row = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 0;
  border-top: 1px solid var(--border-default);

  &:last-child {
    border-bottom: 1px solid var(--border-default);
  }
`;

const RowLabel = styled.dt`
  ${typography.label2}
  color: var(--text-tertiary);
`;

const RowLines = styled.dd`
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;

  p {
    margin: 0;
    ${typography.body2}
    color: var(--text-primary);
  }
`;

const Footer = styled.p`
  margin: 0;
  ${typography.caption1}
  color: var(--text-tertiary);
`;
