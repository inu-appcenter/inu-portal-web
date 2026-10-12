import styled from "styled-components";
import { useHeader } from "@/context/HeaderContext";
import Box from "@/components/common/Box";
import Divider from "@/components/common/Divider";
import Ripple from "@/components/common/Ripple";
import { labsBanner as 실험실배너 } from "@/resources/assets/illustrations/features";
import TitleContentArea from "@/components/desktop/common/TitleContentArea";
import { DESKTOP_MEDIA, MOBILE_PAGE_GUTTER } from "@/styles/responsive";
import ImageWithSkeleton from "@/components/common/ImageWithSkeleton";
import { ROUTES } from "@/constants/routes";
import { useNavigate } from "react-router-dom";
import { useFeatureFlag } from "@/hooks/useFeatureFlags";
import useUserStore from "@/stores/useUserStore";
import { useEffect } from "react";
import { postApiLogs } from "@/apis/members";
import { FEATURE_FLAG_KEYS } from "@/types/featureFlags";
import { typography } from "@/styles/typography";
import { BookOpen, GraduationCap, Radar, Sparkles } from "lucide-react";
import useAIChatStore from "@/stores/useAIChatStore";
import React from "react";

interface AppItemProps {
  iconSrc?: string | null;
  iconElement?: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
}

const AppItem = ({ iconSrc, iconElement, title, description, onClick }: AppItemProps) => {
  return (
    <AppItemWrapper
      role="button"
      tabIndex={0}
      aria-label={`${title} - ${description}`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <Ripple />
      <InnerContent>
        {iconElement ? (
          <IconWrapper>{iconElement}</IconWrapper>
        ) : (
          <Icon src={iconSrc || "/default-icon.png"} alt="" />
        )}
        <ContentArea>
          <span className="title">{title}</span>
          <span className="description">{description}</span>
        </ContentArea>
      </InnerContent>
    </AppItemWrapper>
  );
};

const LabsPage = () => {
  const { tokenInfo } = useUserStore();
  const { enabled: isLabsEnabled, isFetched: isLabsFlagFetched } = useFeatureFlag(
    FEATURE_FLAG_KEYS.LABS,
  );
  useHeader({ title: "실험실" });

  const navigate = useNavigate();
  const { openAgent } = useAIChatStore();

  useEffect(() => {
    if (isLabsFlagFetched && !isLabsEnabled) {
      navigate(ROUTES.HOME, { replace: true });
    }
  }, [isLabsEnabled, isLabsFlagFetched, navigate]);

  useEffect(() => {
    if (!isLabsFlagFetched || !isLabsEnabled) {
      return;
    }

    const logApi = async () => {
      await postApiLogs("/api/labs");
    };

    void logApi();
  }, [isLabsEnabled, isLabsFlagFetched]);

  if (isLabsFlagFetched && !isLabsEnabled) {
    return null;
  }

  return (
    <MoreAppsPageWrapper as="main">
      <MainLayoutGrid>
        {/* 상단/좌측 배너 영역 */}
        <HeroSection as="section">
          <HeroBannerColumn>
            <BannerImageWrapper
              role="link"
              tabIndex={0}
              aria-label="앱센터 홈페이지 바로가기"
              onClick={() => window.open("https://home.inuappcenter.kr", "_blank")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  window.open("https://home.inuappcenter.kr", "_blank");
                }
              }}
            >
              <ImageWithSkeleton
                src={실험실배너}
                alt="Appcenter Banner"
                skeletonHeight="180px"
                skeletonWidth="100%"
                borderRadius="var(--radius-lg)"
              />
            </BannerImageWrapper>
          </HeroBannerColumn>
        </HeroSection>

        {/* 콘텐츠 및 기능 리스트 영역 */}
        <ContentSection as="section">
          <TitleContentArea description="실험 기능을 사용해 보세요. 실험실 기능은 바람처럼 나타났다 소리 없이 사라질 수 있어요." />

          <TitleContentArea title="캠퍼스 편의 기능">
            <Box>
              <ItemListContainer>
                <AppItem
                  iconElement={<Sparkles size={22} color="var(--interactive-primary)" />}
                  title="챗불이 에이전트"
                  description="학식 · 버스 · 시간표 · 공지 통합 캠퍼스 에이전트"
                  onClick={() => openAgent()}
                />
                <Divider margin="0" />
                <AppItem
                  iconElement={<BookOpen size={22} color="var(--text-brand)" />}
                  title="학산도서관 좌석 및 스터디룸"
                  description="열람실 잔여 좌석 조회 및 스터디룸 예약, 빈자리 알림 신청"
                  onClick={() => navigate(ROUTES.SERVICES.LIBRARY)}
                />
                <Divider margin="0" />
                <AppItem
                  iconElement={<GraduationCap size={22} color="var(--border-success)" />}
                  title="이러닝 (LMS)"
                  description="수강 강좌 및 주차별 강의 출석, 과제 마감 일정 확인"
                  onClick={() => navigate(ROUTES.SERVICES.LMS)}
                />
                <Divider margin="0" />
                <AppItem
                  iconElement={<Radar size={22} color="var(--interactive-primary)" />}
                  title="빈자리 및 마감 알림 관리"
                  description="신청한 열람실 빈자리 알림 및 과제 마감 리마인더 목록"
                  onClick={() => navigate(ROUTES.MYPAGE.SMART_WATCH)}
                />
              </ItemListContainer>
            </Box>
          </TitleContentArea>

          <TitleContentArea title="포털 관련 기능">
            <Box>
              <ItemListContainer>
                <AppItem
                  title="내 기본 학적 정보 가져오기"
                  description="인천대학교 포털 사이트에서 내 기본 학적 정보를 가져와요."
                  onClick={() => {
                    if (!tokenInfo.accessToken) {
                      if (
                        window.confirm(
                          "INTIP 로그인이 필요해요. 로그인 페이지로 이동할까요?",
                        )
                      ) {
                        navigate(ROUTES.LOGIN);
                      }
                    } else {
                      navigate(ROUTES.LABS.PORTAL.BASIC_INFO);
                    }
                  }}
                />
                <Divider margin="0" />
                <AppItem
                  title="포털 시간표 및 성적 종합 가져오기"
                  description="포털 개인학적조회에서 수강 시간표, 학기·과목별 성적, 이수학점, 장학금을 한 번에 가져와요."
                  onClick={() => {
                    if (!tokenInfo.accessToken) {
                      if (
                        window.confirm(
                          "INTIP 로그인이 필요해요. 로그인 페이지로 이동할까요?",
                        )
                      ) {
                        navigate(ROUTES.LOGIN);
                      }
                    } else {
                      navigate(ROUTES.LABS.PORTAL.TIMETABLE);
                    }
                  }}
                />
                <Divider margin="0" />
                <AppItem
                  title="생활원 사생정보 조회"
                  description="포털 생활원 시스템에서 배정 호실, 침대, 입·퇴사일, 상벌점 내역 및 식수 현황을 가져와요."
                  onClick={() => {
                    if (!tokenInfo.accessToken) {
                      if (
                        window.confirm(
                          "INTIP 로그인이 필요해요. 로그인 페이지로 이동할까요?",
                        )
                      ) {
                        navigate(ROUTES.LOGIN);
                      }
                    } else {
                      navigate(ROUTES.LABS.PORTAL.DORMITORY);
                    }
                  }}
                />
              </ItemListContainer>
            </Box>
          </TitleContentArea>
        </ContentSection>
      </MainLayoutGrid>
    </MoreAppsPageWrapper>
  );
};

export default LabsPage;

const MoreAppsPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  padding: 16px ${MOBILE_PAGE_GUTTER} calc(24px + var(--native-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)));
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;

  @media ${DESKTOP_MEDIA} {
    max-width: 1200px;
    padding: 24px 0 calc(32px + var(--native-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)));
  }
`;

const MainLayoutGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  width: 100%;

  @media ${DESKTOP_MEDIA} {
    gap: var(--space-8);
  }
`;

const HeroSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  justify-content: center;
`;

const HeroBannerColumn = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`;

const BannerImageWrapper = styled.div`
  width: 100%;
  cursor: pointer;
  border-radius: var(--radius-lg);
  overflow: hidden;
  display: block;
  transition: transform 0.15s ease-in-out;

  &:active {
    transform: scale(0.99);
  }

  &:focus-visible {
    outline: 2px solid var(--border-brand);
    outline-offset: 2px;
  }
`;

const ContentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  width: 100%;
`;

const ItemListContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const InnerContent = styled.div`
  display: flex;
  flex-direction: row;
  gap: var(--space-3);
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  transition: transform 0.12s ease-in-out;
`;

const AppItemWrapper = styled.div`
  display: flex;
  flex-direction: row;
  box-sizing: border-box;
  padding: 14px 16px;
  width: 100%;
  border-radius: var(--radius-md);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  user-select: none;

  &:focus-visible {
    outline: 2px solid var(--border-brand);
    outline-offset: -2px;
  }

  &:active,
  &.active-touch {
    ${InnerContent} {
      transform: scale(0.98);
    }
  }
`;

const Icon = styled.img`
  width: 44px;
  height: 44px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  background-color: var(--bg-muted);
  flex-shrink: 0;
`;

const IconWrapper = styled.div`
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background-color: var(--bg-subtle);
  border: 1px solid var(--border-default);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const ContentArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;

  .title {
    ${typography.heading3}
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .description {
    ${typography.caption1}
    color: var(--text-tertiary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;
