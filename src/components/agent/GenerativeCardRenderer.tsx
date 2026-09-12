import React from "react";
import styled from "styled-components";
import {
  ExternalLink,
  BookOpen,
  Bus,
  Utensils,
  Calendar,
  Smartphone,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { UiComponent } from "@/apis/agent";

const CardsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  margin: 10px 0;
`;

const CardBase = styled.div`
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
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
  border-bottom: 1px solid #f1f5f9;
`;

const CardTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: #1e293b;
`;

const CardLinkButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #0958d9;
  text-decoration: none;
  font-size: 12px;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
`;

/* 옵션 A: 모바일 앱 연동 안내 카드 */
const AuthWarningCard = styled(CardBase)`
  background: #fffbeb;
  border: 1px solid #fef3c7;
`;

const WarningContent = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
  color: #92400e;
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
  background: #0958d9;
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.15s ease;

  &:hover {
    background: #003eb3;
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
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #334155;
  text-decoration: none;
  font-size: 12px;
  transition: all 0.15s ease;

  &:hover {
    background: #eff6ff;
    border-color: #bfdbfe;
    color: #1d4ed8;
  }
`;

interface GenerativeCardRendererProps {
  uiComponents?: UiComponent[];
}

export const GenerativeCardRenderer: React.FC<GenerativeCardRendererProps> = ({
  uiComponents,
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
          return (
            <AuthWarningCard key={idx}>
              <CardHeader>
                <CardTitle style={{ color: "#b45309" }}>
                  <ShieldAlert size={16} color="#d97706" />
                  포털 보안 계정 연동 안내 (모바일 앱 전용)
                </CardTitle>
                <span style={{ fontSize: "11px", color: "#b45309" }}>Zero-Knowledge 보안</span>
              </CardHeader>
              <WarningContent>
                <Smartphone size={28} color="#d97706" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontWeight: 500 }}>
                    개인 학적·출결·LMS 연동은 모바일 환경에서만 지원됩니다.
                  </div>
                  <div style={{ fontSize: "12px", color: "#78350f", marginTop: "4px" }}>
                    학생의 비밀번호와 학적 데이터를 서버에 저장하지 않는 보안(Zero-Knowledge) 원칙에 따라,
                    학교 시스템 실시간 조작은 <strong>INTIP 모바일 앱</strong>의 보안 영역에서 직접 수행됩니다.
                  </div>
                  <AppBadgeGroup>
                    <AppDownloadButton
                      href="https://apps.apple.com/kr/app/intip/id6478953139"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Smartphone size={14} /> INTIP 앱 열기 / 설치
                    </AppDownloadButton>
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
                  <BookOpen size={16} color="#0958d9" />
                  inuai 학사 지식베이스 출처 (Citations)
                </CardTitle>
                {component.link && (
                  <CardLinkButton href={component.link.route} target="_blank" rel="noopener noreferrer">
                    {component.link.label} <ExternalLink size={12} />
                  </CardLinkButton>
                )}
              </CardHeader>
              <div style={{ fontSize: "12px", color: "#64748b" }}>
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
                      <ExternalLink size={12} color="#94a3b8" />
                    </CitationItem>
                  ))}
                </CitationList>
              ) : (
                <div style={{ marginTop: "6px", fontSize: "12px", color: "#0958d9" }}>
                  공식 학칙 조항에 근거하여 작성된 답변입니다.
                </div>
              )}
            </CardBase>
          );
        }

        // 3. 버스 정보 카드
        if (type.includes("BUS")) {
          return (
            <CardBase key={idx}>
              <CardHeader>
                <CardTitle>
                  <Bus size={16} color="#059669" />
                  실시간 셔틀 및 시내버스 도착 정보
                </CardTitle>
                <CardLinkButton href="/home/bus">
                  전체 노선 보기 <ExternalLink size={12} />
                </CardLinkButton>
              </CardHeader>
              <div style={{ color: "#334155" }}>
                정문/공대/자연대 정류장 실시간 버스 도착 데이터가 조회되었습니다.
              </div>
            </CardBase>
          );
        }

        // 4. 학식 정보 카드
        if (type.includes("CAFETERIA")) {
          return (
            <CardBase key={idx}>
              <CardHeader>
                <CardTitle>
                  <Utensils size={16} color="#d97706" />
                  캠퍼스 식당 메뉴 안내
                </CardTitle>
                <CardLinkButton href="/home/cafeteria">
                  주간 식단표 <ExternalLink size={12} />
                </CardLinkButton>
              </CardHeader>
              <div style={{ color: "#334155" }}>
                학생식당 및 기숙사 식당의 최신 식단 정보가 반영되었습니다.
              </div>
            </CardBase>
          );
        }

        // 5. 시간표 / 학사일정 카드
        if (type.includes("TIMETABLE") || type.includes("SCHEDULE")) {
          return (
            <CardBase key={idx}>
              <CardHeader>
                <CardTitle>
                  <Calendar size={16} color="#7c3aed" />
                  학사일정 및 시간표 정보
                </CardTitle>
                <CardLinkButton href="/home/calendar">
                  캘린더 열기 <ExternalLink size={12} />
                </CardLinkButton>
              </CardHeader>
              <div style={{ color: "#334155" }}>
                공식 학사일정 및 사용자 시간표 조회가 연동되었습니다.
              </div>
            </CardBase>
          );
        }

        // 6. 기본 링크 카드
        return (
          <CardBase key={idx}>
            <CardHeader>
              <CardTitle>
                <Sparkles size={16} color="#0958d9" />
                캠퍼스 연계 정보 ({type})
              </CardTitle>
              {component.link && (
                <CardLinkButton href={component.link.route}>
                  {component.link.label} <ExternalLink size={12} />
                </CardLinkButton>
              )}
            </CardHeader>
          </CardBase>
        );
      })}
    </CardsContainer>
  );
};
