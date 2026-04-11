import styled from "styled-components";
import { useHeader } from "@/context/HeaderContext";
import Box from "@/components/common/Box";
import Divider from "@/components/common/Divider";

import 실험실배너 from "@/resources/assets/labs/실험실배너.webp";
import TitleContentArea from "@/components/desktop/common/TitleContentArea";
import { DESKTOP_MEDIA } from "@/styles/responsive";
import ImageWithSkeleton from "@/components/common/ImageWithSkeleton";

interface AppItemProps {
  iconSrc?: string | null;
  title: string;
  description: string;
  onClick?: () => void;
}

const AppItem = ({ iconSrc, title, description, onClick }: AppItemProps) => {
  return (
    <AppItemWrapper onClick={onClick}>
      {iconSrc && <Icon src={iconSrc || "/default-icon.png"} alt={title} />}
      <ContentArea>
        <div className="title">{title}</div>
        <div className="description">{description}</div>
      </ContentArea>
    </AppItemWrapper>
  );
};

const LabsPage = () => {
  useHeader({ title: "실험실" });

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
          <TitleContentArea description="실험 기능을 사용해 보세요. 안정적이지 않을 수 있으며, 오류가 발생할 수 있습니다." />
          <TitleContentArea title={"포털 관련 기능"}>
            <Box>
              <div style={{ width: "100%" }}>
                <AppItem
                  title={"내 학적 정보 가져오기"}
                  description={"포털에서 내 학적 정보를 가져옵니다."}
                  onClick={() => {}}
                />
                <Divider />
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
    align-items: center;
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
