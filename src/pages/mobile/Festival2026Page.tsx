import styled from "styled-components";
import { useHeader } from "@/context/HeaderContext";
import { DESKTOP_MEDIA, MOBILE_PAGE_GUTTER } from "@/styles/responsive";
import { useMemo, useEffect } from "react";
import CategorySelectorNew from "@/components/mobile/common/CategorySelectorNew";
import ImageWithSkeleton from "@/components/common/ImageWithSkeleton";
import { useLocation, useNavigate } from "react-router-dom";
import { festivalPaintTheUnionBanner as 배너이미지 } from "@/resources/assets/illustrations/features";
import Box from "@/components/common/Box";
import TitleContentArea from "@/components/desktop/common/TitleContentArea";
import Divider from "@/components/common/Divider";
import { ROUTES } from "@/constants/routes";
import { FESTIVAL_INFO, FestivalInfoType } from "@/constants/festival";
import { mixpanelTrack, trackPageView } from "@/utils/mixpanel";
import ChatPreviewWidget from "@/components/common/ChatPreviewWidget";
import useUserStore from "@/stores/useUserStore";
import { useFeatureFlag } from "@/hooks/useFeatureFlags";
import { FEATURE_FLAG_KEYS } from "@/types/featureFlags";

function getStoredAccessToken() {
  const storedTokenInfo = localStorage.getItem("tokenInfo");

  if (!storedTokenInfo) {
    return "";
  }

  try {
    const parsedTokenInfo = JSON.parse(storedTokenInfo) as {
      accessToken?: string;
    };

    return parsedTokenInfo.accessToken ?? "";
  } catch (error) {
    console.error("tokenInfo 파싱 실패", error);
    return "";
  }
}

const CATEGORIES = ["홈", "무대", "부스", "이벤트", "기타"];

interface AppItemProps {
  iconSrc?: string | null;
  type: FestivalInfoType | "chat";
  onClick: (type: string) => void;
}

const AppItem = ({ iconSrc, type, onClick }: AppItemProps) => {
  let itemTitle: string;
  let itemDescription: string;

  if (type === "chat") {
    itemTitle = "실시간 채팅방";
    itemDescription = "축제 참가자들과 소통해보세요.";
  } else if (!FESTIVAL_INFO[type]) {
    // console.error(`FESTIVAL_INFO for type '${type}' is undefined.`);
    return null;
  } else {
    itemTitle = FESTIVAL_INFO[type].title;
    itemDescription = FESTIVAL_INFO[type].description;
  }

  const title = itemTitle;
  const description = itemDescription;
  return (
    <AppItemWrapper onClick={() => onClick(type)}>
      {iconSrc && <Icon src={iconSrc || "/default-icon.png"} alt={title} />}
      <ContentArea>
        <div className="title">{title}</div>
        <div className="description">{description}</div>
      </ContentArea>
    </AppItemWrapper>
  );
};

export default function Festival2026Page() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const selectedCategory = params.get("category") || "홈";

  const { enabled: isFestivalEnabled, isFetched } = useFeatureFlag(
    FEATURE_FLAG_KEYS.FESTIVAL,
  );

  useEffect(() => {
    if (isFetched && !isFestivalEnabled) {
      navigate(ROUTES.HOME, { replace: true });
    }
  }, [isFestivalEnabled, isFetched, navigate]);

  useEffect(() => {
    trackPageView("[축제] 홈");
  }, []);

  useEffect(() => {
    if (!params.get("category")) {
      navigate("?category=홈", { replace: true });
    } else {
      mixpanelTrack.festivalCategorySwitched(params.get("category") || "홈");
    }
  }, [navigate, params]);

  const subHeader = useMemo(
    () => (
      <CategorySelectorNew
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
      />
    ),
    [selectedCategory],
  );

  useHeader({
    title: "PAINT THE UNION",
    subHeader: subHeader,
    floatingSubHeader: true,
  });

  const handleItemClick = (type: string) => {
    mixpanelTrack.featureClicked(
      FESTIVAL_INFO[type as FestivalInfoType].title,
      `[축제] - ${selectedCategory} 탭`,
    );
    navigate(`${ROUTES.FESTIVAL2026_DETAIL}?type=${type}`);
  };

  const { tokenInfo } = useUserStore();

  const isLoggedIn =
    Boolean(tokenInfo.accessToken) || Boolean(getStoredAccessToken());
  const handleLinkClick = () => {
    mixpanelTrack.festivalChatEntered(1);

    if (!isLoggedIn) {
      const confirmLogin = window.confirm(
        "로그인 후 채팅방에 입장할 수 있어요.\n로그인 페이지로 이동할까요?",
      );

      if (confirmLogin) {
        navigate(ROUTES.LOGIN); // 로그인 페이지 경로
      }
    } else {
      navigate("/chat/1");
    }
  };

  return (
    <Container>
      {selectedCategory === "홈" ? (
        <MainLayoutGrid>
          <HeroSection>
            <HeroBannerColumn>
              <ImageWithSkeleton
                src={배너이미지}
                alt="Festival Banner"
                skeletonHeight="200px"
                skeletonWidth="100%"
                borderRadius="20px"
                style={{ maxWidth: DESKTOP_MEDIA }}
              />
              <TitleContentArea
                title={"PAINT THE UNION 오픈채팅방"}
                description={"여기를 눌러 다른 UNI와 함께 축제를 공유해보세요!"}
                style={{ marginTop: "16px" }}
                onClick={handleLinkClick}
              >
                <ChatPreviewWidget roomId={1} />
              </TitleContentArea>
            </HeroBannerColumn>
          </HeroSection>
          <ContentSection>
            <TitleContentArea title="주요 안내 사항">
              <Box>
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <AppItem type="timetable" onClick={handleItemClick} />
                  <Divider />
                  <AppItem type="booth_map" onClick={handleItemClick} />
                  <Divider />
                  <AppItem type="weather_guide" onClick={handleItemClick} />
                  <Divider />
                  <AppItem type="anti_scalping" onClick={handleItemClick} />
                  <Divider />
                  <AppItem type="faq" onClick={handleItemClick} />
                </div>
              </Box>
            </TitleContentArea>

            <TitleContentArea title="교통 및 편의">
              <Box>
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <AppItem type="night_bus" onClick={handleItemClick} />
                </div>
              </Box>
            </TitleContentArea>
          </ContentSection>
        </MainLayoutGrid>
      ) : (
        <ContentSection>
          {selectedCategory === "무대" && (
            <>
              <TitleContentArea title="무대 및 공연 안내">
                <Box>
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <AppItem type="timetable" onClick={handleItemClick} />
                    <Divider />
                    <AppItem type="stage_location" onClick={handleItemClick} />
                    <Divider />
                    <AppItem type="busking" onClick={handleItemClick} />
                  </div>
                </Box>
              </TitleContentArea>
              <TitleContentArea title="입장 및 유의사항">
                <Box>
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <AppItem type="wristband" onClick={handleItemClick} />
                    <Divider />
                    <AppItem type="entrance_guide" onClick={handleItemClick} />
                    <Divider />
                    <AppItem type="forbidden_items" onClick={handleItemClick} />
                  </div>
                </Box>
              </TitleContentArea>
            </>
          )}

          {selectedCategory === "부스" && (
            <>
              <TitleContentArea title="부스 안내">
                <Box>
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <AppItem type="booth_map" onClick={handleItemClick} />
                    <Divider />
                    <AppItem
                      type="student_council_booth"
                      onClick={handleItemClick}
                    />
                    <Divider />
                    <AppItem
                      type="photo_promotion_booth"
                      onClick={handleItemClick}
                    />
                    <Divider />
                    <AppItem
                      type="goods_distribution"
                      onClick={handleItemClick}
                    />
                    <Divider />
                    <AppItem
                      type="food_truck_booth"
                      onClick={handleItemClick}
                    />
                  </div>
                </Box>
              </TitleContentArea>
            </>
          )}

          {selectedCategory === "이벤트" && (
            <>
              <TitleContentArea title="축제 이벤트">
                <Box>
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <AppItem type="raffle_ticket" onClick={handleItemClick} />
                    <Divider />
                    <AppItem type="dresscode" onClick={handleItemClick} />
                  </div>
                </Box>
              </TitleContentArea>
            </>
          )}

          {selectedCategory === "기타" && (
            <>
              <TitleContentArea title="편의 시설">
                <Box>
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <AppItem type="picnic_zone" onClick={handleItemClick} />
                    <Divider />
                    <AppItem
                      type="food_truck_booth"
                      onClick={handleItemClick}
                    />
                  </div>
                </Box>
              </TitleContentArea>
              <TitleContentArea title="자주 묻는 질문">
                <Box>
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <AppItem type="faq" onClick={handleItemClick} />
                  </div>
                </Box>
              </TitleContentArea>
            </>
          )}
        </ContentSection>
      )}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 24px ${MOBILE_PAGE_GUTTER};
  gap: 24px;
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
    gap: 40px;
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
  flex-direction: column;
  justify-content: center;
  width: 100%;

  img {
    width: 100%;
    height: auto;
    object-fit: cover;
  }
`;

const ContentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
`;

const AppItemWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 12px;
  align-items: center;
  justify-content: start;
  box-sizing: border-box;
  text-align: start;
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

  .title {
    color: #000;
    font-size: 16px;
    font-weight: 600;
  }
  .description {
    color: #969696;
    font-size: 12px;
    font-weight: 500;
    text-overflow: ellipsis;
  }
`;
