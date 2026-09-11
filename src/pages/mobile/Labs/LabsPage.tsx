import styled from "styled-components";
import { useHeader } from "@/context/HeaderContext";
import Box from "@/components/common/Box";

import { labsBanner as 실험실배너 } from "@/resources/assets/illustrations/features";
import TitleContentArea from "@/components/desktop/common/TitleContentArea";
import { DESKTOP_MEDIA } from "@/styles/responsive";
import ImageWithSkeleton from "@/components/common/ImageWithSkeleton";
import { ROUTES } from "@/constants/routes";
import { useNavigate } from "react-router-dom";
import { useFeatureFlag } from "@/hooks/useFeatureFlags";
import useUserStore from "@/stores/useUserStore";
import { useEffect } from "react";
import { postApiLogs } from "@/apis/members";
import { FEATURE_FLAG_KEYS } from "@/types/featureFlags";
import { BookOpen, GraduationCap, Radar } from "lucide-react";
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
    <AppItemWrapper onClick={onClick}>
      {iconElement ? (
        <IconWrapper>{iconElement}</IconWrapper>
      ) : (
        iconSrc && <Icon src={iconSrc || "/default-icon.png"} alt={title} />
      )}
      <ContentArea>
        <div className="title">{title}</div>
        <div className="description">{description}</div>
      </ContentArea>
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
    <MoreAppsPageWrapper>
      <MainLayoutGrid>
        {/* 좌측 영역: 이미지 배너 */}
        <HeroSection>
          <HeroBannerColumn>
            <ImageWithSkeleton
              src={실험실배너}
              alt="Appcenter Banner"
              skeletonHeight="200px"
              skeletonWidth="100%"
              borderRadius="20px"
              style={{ maxWidth: DESKTOP_MEDIA, cursor: "pointer" }}
              onClick={() =>
                window.open("https://home.inuappcenter.kr", "_blank")
              }
            />
          </HeroBannerColumn>
        </HeroSection>

        {/* 우측 영역: 타이틀 및 앱 리스트 */}
        <ContentSection>
          <TitleContentArea description="실험 기능을 사용해 보세요. 실험실 기능은 바람처럼 나타났다 소리 없이 사라질 수 있어요." />

          <TitleContentArea title={"캠퍼스 스마트 서비스"}>
            <Box>
              <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
                <AppItem
                  iconElement={<BookOpen size={24} color="#2563eb" />}
                  title={"학산도서관 스마트 허브"}
                  description={
                    "실시간 열람실·스터디룸 현황 조회 및 빈자리/취소표 스나이퍼 알림"
                  }
                  onClick={() => navigate(ROUTES.SERVICES.LIBRARY)}
                />
                <Divider />
                <AppItem
                  iconElement={<GraduationCap size={24} color="#16a34a" />}
                  title={"사이버캠퍼스 LMS 스마트 허브"}
                  description={
                    "이번 학기 수강 강좌 확인 및 과제·퀴즈 마감 전 정시 리마인더 예약"
                  }
                  onClick={() => navigate(ROUTES.SERVICES.LMS)}
                />
                <Divider />
                <AppItem
                  iconElement={<Radar size={24} color="#9333ea" />}
                  title={"실시간 스마트 감시 관리"}
                  description={
                    "현재 백그라운드에서 실행 중인 좌석·스터디룸 실시간 감시 목록 확인 및 관리"
                  }
                  onClick={() => navigate(ROUTES.MYPAGE.SMART_WATCH)}
                />
              </div>
            </Box>
          </TitleContentArea>

          <TitleContentArea title={"포털 관련 기능"}>
            <Box>
              <div style={{ width: "100%" }}>
                <AppItem
                  title={"내 기본 학적 정보 가져오기"}
                  description={
                    "인천대학교 포털 사이트에서 내 기본 학적 정보를 가져옵니다."
                  }
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
              </div>
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

  gap: 24px;

  padding: 0 16px;
`;

const AppItemWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 12px;
  align-items: center;
  justify-content: start;
  box-sizing: border-box;
  text-align: start;
  //padding: 8px 0;
  cursor: pointer;

  width: 100%;
`;

const Icon = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
  background-color: #f0f0f0;
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background-color: #f8fafc;
  border: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background-color: #f1f5f9;
`;

const ContentArea = styled.div`
  display: flex;
  flex-direction: column;
  //gap: 4px;

  .title {
    color: #000;
    font-size: 16px;
    font-weight: 600;
  }
  .description {
    color: #969696;
    font-size: 12px;
    font-weight: 500;
    //white-space: nowrap;
    text-overflow: ellipsis;
  }
`;

const MainLayoutGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;

  /* 데스크탑 환경 그리드 설정 */
  @media ${DESKTOP_MEDIA} {
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    //grid-template-columns: 1fr 1fr; // 좌우 1:1 비율
    //align-items: center;
    gap: 40px;
  }
`;

const HeroSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;

  justify-content: center;
`;

const ContentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
`;

const HeroBannerColumn = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;

  img {
    width: 100%;
    height: auto;
    object-fit: cover;
  }
`;
