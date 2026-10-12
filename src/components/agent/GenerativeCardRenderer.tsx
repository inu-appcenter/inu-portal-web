import React from "react";
import styled from "styled-components";
import {
  ExternalLink,
  BookOpen,
  Smartphone,
  ShieldAlert,
} from "lucide-react";
import { UiComponent } from "@/apis/agent";
import { isMobileAppEnvironment } from "@/apis/mobileAgentBridge";
import { SingleCardItem } from "@/components/mobile/chat/AgentGenerativeCards";

const CardsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  margin: 10px 0;
`;

const CardBase = styled.div`
  background: var(--bg-base);
  border-radius: 12px;
  border: 1px solid var(--border-default);
  padding: 14px 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
  font-size: 13px;
  line-height: 1.5;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--bg-base);
`;

const CardTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: var(--text-primary);
`;

const CardLinkButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--text-brand);
  text-decoration: none;
  font-size: 12px;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
`;

/* 옵션 A: 모바일 앱 연동 안내 카드 */
const AuthWarningCard = styled(CardBase)`
  background: var(--bg-warn);
  border: 1px solid var(--border-warn-subtle);
`;

const WarningContent = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
  color: var(--text-warn);
`;

const AppBadgeGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 10px;
`;

const AppDownloadButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  background: var(--interactive-primary);
  color: var(--text-inverse);
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.15s ease;

  &:hover {
    background: var(--blue-700);
  }
`;

const ActionModalButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  background: var(--interactive-primary);
  color: var(--text-inverse);
  font-size: 12px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: var(--blue-700);
  }
`;

/* inuai 출처 카드 (Perplexity Citation Card) */
const CitationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
`;

const CitationItem = styled.a`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: 8px;
  background: var(--bg-subtle);
  border: 1px solid var(--border-default);
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 12px;
  transition: all 0.15s ease;

  &:hover {
    background: var(--bg-brand);
    border-color: var(--border-brand-subtle);
    color: var(--text-brand);
  }
`;

interface GenerativeCardRendererProps {
  uiComponents?: UiComponent[];
  onNavigate?: () => void;
}

export const GenerativeCardRenderer: React.FC<GenerativeCardRendererProps> = ({
  uiComponents,
  onNavigate,
}) => {
  if (!uiComponents || uiComponents.length === 0) return null;

  return (
    <CardsContainer>
      {uiComponents.map((component, idx) => {
        const type = component.type?.toUpperCase() || "";

        // 1. 옵션 A: 모바일 앱 포털 연동 안내 카드
        if (
          type.includes("PORTAL_AUTH_REQUIRED") ||
          type.includes("AUTH_REQUIRED") ||
          type.includes("CLIENT_ACTION")
        ) {
          const inApp = isMobileAppEnvironment();
          return (
            <AuthWarningCard key={idx}>
              <CardHeader>
                <CardTitle style={{ color: "var(--text-warn)" }}>
                  <ShieldAlert size={16} color="var(--text-warn)" />
                  {inApp ? "포털 보안 계정 연동 필요" : "포털 보안 계정 연동 안내 (모바일 앱 전용)"}
                </CardTitle>
                <span style={{ fontSize: "11px", color: "var(--text-warn)" }}>Zero-Knowledge 보안</span>
              </CardHeader>
              <WarningContent>
                <Smartphone size={28} color="var(--text-warn)" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontWeight: 500 }}>
                    {inApp
                      ? "학적 정보 및 실시간 학점 조회를 위해 포털 계정 연동이 필요합니다."
                      : "개인 학적·출결·LMS 연동은 모바일 환경에서만 지원됩니다."}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                    {inApp
                      ? "학생의 비밀번호와 학적 데이터를 서버에 저장하지 않고, 기기 내 보안 저장소(SecureStorage)에 1회 안전하게 연동하여 실시간 학점과 학적을 조회합니다."
                      : "학생의 비밀번호와 학적 데이터를 서버에 저장하지 않는 보안(Zero-Knowledge) 원칙에 따라, 학교 시스템 실시간 조작은 INTIP 모바일 앱의 보안 영역에서 직접 수행됩니다."}
                  </div>
                  <AppBadgeGroup>
                    {inApp ? (
                      <ActionModalButton
                        type="button"
                        onClick={() => window.dispatchEvent(new CustomEvent("openPortalAccountModal"))}
                      >
                        <Smartphone size={14} /> 포털 계정 연동하기
                      </ActionModalButton>
                    ) : (
                      <AppDownloadButton
                        href="https://apps.apple.com/kr/app/intip/id6478953139"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Smartphone size={14} /> INTIP 앱 열기 / 설치
                      </AppDownloadButton>
                    )}
                  </AppBadgeGroup>
                </div>
              </WarningContent>
            </AuthWarningCard>
          );
        }

        // 2. inuai 학칙 및 공지 출처 카드 (Perplexity 스타일)
        if (type.includes("INU_AI_CITATION") || type.includes("CITATION")) {
          const citations = component.data?.citations || [];
          return (
            <CardBase key={idx}>
              <CardHeader>
                <CardTitle>
                  <BookOpen size={16} color="var(--interactive-primary)" />
                  inuai 학사 지식베이스 출처 (Citations)
                </CardTitle>
                {component.link && (
                  <CardLinkButton href={component.link.route} target="_blank" rel="noopener noreferrer">
                    {component.link.label} <ExternalLink size={12} />
                  </CardLinkButton>
                )}
              </CardHeader>
              <div style={{ fontSize: "12px", color: "var(--gray-600)" }}>
                인천대학교 공식 규정집 및 학사 공지사항에서 확인된 출처입니다:
              </div>
              {citations.length > 0 ? (
                <CitationList>
                  {citations.map((c: any, cIdx: number) => (
                    <CitationItem
                      key={cIdx}
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span style={{ fontWeight: 500 }}>
                        {c.type === "LAW" ? "📜 " : "🔗 "}
                        {c.title || c.url}
                      </span>
                      <ExternalLink size={12} color="var(--text-disabled)" />
                    </CitationItem>
                  ))}
                </CitationList>
              ) : (
                <div style={{ marginTop: "6px", fontSize: "12px", color: "var(--text-brand)" }}>
                  공식 학칙 조항에 근거하여 작성된 답변입니다.
                </div>
              )}
            </CardBase>
          );
        }

        // 3. 인팁 캠퍼스 도구 카드 (MY_SETTINGS, BUS, CAFETERIA, TIMETABLE, WEATHER, NOTICE_LIST 등 20여 종)
        return <SingleCardItem key={idx} component={component} onNavigate={onNavigate} />;
      })}
    </CardsContainer>
  );
};
