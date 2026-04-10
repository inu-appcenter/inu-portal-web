import { useEffect, useState } from "react";
import styled from "styled-components";
import { useHeader } from "@/context/HeaderContext";
import Box from "@/components/common/Box";
import Divider from "@/components/common/Divider";
import { BoardContent } from "@/types/appcenter";
import { getAllBoardsContents } from "@/apis/appcenter";
import appcenterBanner from "@/resources/assets/banner/앱센터배너.webp";
import TitleContentArea from "@/components/desktop/common/TitleContentArea";
import { DESKTOP_MEDIA } from "@/styles/responsive";
import ImageWithSkeleton from "@/components/common/ImageWithSkeleton";
import Skeleton from "@/components/common/Skeleton";

interface AppItemProps {
  iconSrc: string | null;
  title: string;
  description: string;
  onClick?: () => void;
}

const AppItem = ({ iconSrc, title, description, onClick }: AppItemProps) => {
  return (
    <AppItemWrapper onClick={onClick}>
      <Icon src={iconSrc || "/default-icon.png"} alt={title} />
      <ContentArea>
        <div className="title">{title}</div>
        <div className="description">{description}</div>
      </ContentArea>
    </AppItemWrapper>
  );
};

const AppItemSkeleton = () => {
  return (
    <AppItemWrapper>
      {/* 아이콘 위치 */}
      <Skeleton width="48px" height="48px" style={{ borderRadius: "8px" }} />
      <ContentArea>
        {/* 타이틀 위치 */}
        <Skeleton width="120px" height="18px" />
        {/* 설명 위치 */}
        <Skeleton width="200px" height="14px" />
      </ContentArea>
    </AppItemWrapper>
  );
};

const MoreAppsPage = () => {
  useHeader({ title: "앱센터의 다른 앱" });

  const [boards, setBoards] = useState<BoardContent[]>([]);
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태 추가

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        setIsLoading(true); // 요청 시작
        const response = await getAllBoardsContents();
        const filteredResponse = response.filter((board) => board.isActive);
        setBoards(filteredResponse);
      } catch (error) {
        console.error("Failed to fetch boards:", error);
      } finally {
        setIsLoading(false); // 요청 완료
      }
    };

    fetchBoards();
  }, []);

  return (
    <MoreAppsPageWrapper>
      <MainLayoutGrid>
        {/* 좌측 영역: 이미지 배너 */}
        <HeroSection>
          <HeroBannerColumn>
            <ImageWithSkeleton
              src={appcenterBanner}
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
          <TitleContentArea description="앱센터의 다른 앱들을 만나보세요. 클릭하면 해당 앱의 소개 페이지로 이동합니다." />
          <Box>
            {isLoading
              ? // 로딩 중일 때 스켈레톤 5개 표시
                Array.from({ length: 5 }).map((_, index) => (
                  <div key={`skeleton-${index}`} style={{ width: "100%" }}>
                    <AppItemSkeleton />
                    {index !== 4 && <Divider />}
                  </div>
                ))
              : // 데이터 로드 완료 후 실제 리스트 표시
                boards.map((board, index) => (
                  <div key={board.id} style={{ width: "100%" }}>
                    <AppItem
                      title={board.title}
                      description={board.subTitle}
                      iconSrc={Object.values(board.images)[0] || null}
                      onClick={() => {
                        window.open(
                          "https://home.inuappcenter.kr/project/" + board.id,
                          "_blank",
                        );
                      }}
                    />
                    {index !== boards.length - 1 && <Divider />}
                  </div>
                ))}
          </Box>
        </ContentSection>
      </MainLayoutGrid>
    </MoreAppsPageWrapper>
  );
};

export default MoreAppsPage;

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
  padding: 8px 0;
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
  gap: 4px;

  .title {
    color: #000;
    font-size: 14px;
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
