import styled from "styled-components";
import { useHeader } from "@/context/HeaderContext";
import Box from "@/components/common/Box";
import Ripple from "@/components/common/Ripple";

import AiBanner from "@/resources/assets/ai/횃불이ai배너이미지.webp";
import ChatBulButtonImg from "@/resources/assets/ai/chat-bul-button.webp";
import TimetableEvaluateIcon from "@/resources/assets/ai/시간표이미지평가횃불이.svg";
import TitleContentArea from "@/components/desktop/common/TitleContentArea";
import { DESKTOP_MEDIA } from "@/styles/responsive";
import ImageWithSkeleton from "@/components/common/ImageWithSkeleton";
import { ROUTES } from "@/constants/routes";
import { useNavigate } from "react-router-dom";
import {
  LuCalendar,
  LuImage,
  LuLock,
  LuNewspaper,
  LuTable,
} from "react-icons/lu";
import { IconType } from "react-icons";
import Divider from "@/components/common/Divider";
import ExternalLinkIcon from "@/resources/assets/mobile-home/chip/ExternalLink.svg";
import useAIChatStore from "@/stores/useAIChatStore";

interface AppItemProps {
  iconSrc?: string | null;
  iconComponent?: IconType | null;
  title: string;
  description: string;
  isPreparing?: boolean;
  isExternal?: boolean;
  onClick?: () => void;
}

const AppItem = ({
  iconSrc,
  iconComponent: IconComponent,
  title,
  description,
  isPreparing,
  isExternal,
  onClick,
}: AppItemProps) => {
  return (
    <AppItemWrapper onClick={onClick} $isPreparing={isPreparing}>
      {!isPreparing && <Ripple />}
      <InnerContent>
        {iconSrc ? (
          <Icon src={iconSrc} alt={title} />
        ) : IconComponent ? (
          <IconWrapper $isPreparing={isPreparing}>
            <IconComponent
              size={24}
              color={isPreparing ? "#a0a0a0" : "#6d4dc7"}
            />
          </IconWrapper>
        ) : null}
        <ContentArea>
          <TitleRow>
            <div
              className="title"
              style={{ color: isPreparing ? "#8e8e93" : "#000" }}
            >
              {title}
            </div>
            {isPreparing && (
              <LuLock size={13} color="#8e8e93" style={{ flexShrink: 0 }} />
            )}
            {isExternal && (
              <ExternalIconImg src={ExternalLinkIcon} alt="외부 서비스" />
            )}
          </TitleRow>
          <div className="description">{description}</div>
        </ContentArea>
      </InnerContent>
    </AppItemWrapper>
  );
};

interface ServiceItem {
  title: string;
  description: string;
  iconSrc?: string | null;
  iconComponent?: IconType | null;
  isPreparing?: boolean;
  isExternal?: boolean;
  onClick: () => void;
}

interface ServiceCategory {
  categoryName: string;
  items: ServiceItem[];
}

const AiBrandPage = () => {
  useHeader({ title: "횃불이 AI" });
  const navigate = useNavigate();
  const { openChat } = useAIChatStore();

  const categories: ServiceCategory[] = [
    {
      categoryName: "질문하기",
      items: [
        {
          title: "챗불이",
          description:
            "인천대학교 AI 챗봇 챗불이에게 학사 관련 질문을 해보세요. 학칙과 공지사항을 기반으로 궁금증을 해결해드려요.",
          iconSrc: ChatBulButtonImg,
          onClick: () => {
            openChat();
          },
        },
        {
          title: "챗불이 in UNIDorm",
          description:
            "챗불이가 기숙사앱 유니돔에 찾아왔어요! 기숙사 관련 질문을 해결해드릴 수 있어요.",
          iconSrc: ChatBulButtonImg,
          isExternal: true,
          onClick: () => {
            window.open(
              "https://unidorm.inuappcenter.kr",
              "_blank",
              "noopener,noreferrer",
            );
          },
        },
      ],
    },
    {
      categoryName: "어시스트",
      items: [
        {
          title: "횃불이 AI 캘린더",
          description:
            "내 학과 공지사항의 일정 정보를 한 눈에 확인해보세요. 각 날짜를 클릭하면 일정 정보 요약도 확인할 수 있어요.",
          iconComponent: LuCalendar,
          onClick: () => {
            navigate(ROUTES.BOARD.CALENDAR);
          },
        },
        {
          title: "시간표 평가",
          description:
            "내 시간표 평가와 분석을 받아보세요. 횃불이가 놀랄지도 몰라요!",
          iconSrc: TimetableEvaluateIcon,
          onClick: () => {
            navigate(ROUTES.TIMETABLE.ROOT);
          },
        },
        {
          title: "시간표 어시스트",
          description:
            "내가 들은 과목과 교과과정표를 기반으로 시간표를 추천해드려요.",
          iconComponent: LuTable,
          isPreparing: true,
          onClick: () => {
            alert("시간표 어시스트 서비스는 준비 중입니다!");
          },
        },
        {
          title: "Daily Brief",
          description:
            "나만을 위한 맞춤 정보 요약과 꼭 필요한 학교 생활 알림을 매일 아침 전해드려요.",
          iconComponent: LuNewspaper,
          onClick: () => {
            navigate(ROUTES.MYPAGE.DAILY_BRIEF);
          },
        },
      ],
    },
    {
      categoryName: "창의력을 펼치기",
      items: [
        {
          title: "횃불이 스튜디오",
          description: "원하는 모습의 횃불이 이미지를 만들어보세요.",
          iconComponent: LuImage,
          isPreparing: true,
          onClick: () => {
            alert("횃불이 스튜디오 서비스는 준비 중입니다!");
            return;
            navigate(ROUTES.AI.IMAGE_GEN);
          },
        },
      ],
    },
  ];

  return (
    <AiBrandPageWrapper>
      <MainLayoutGrid>
        {/* 좌측 영역: 이미지 배너 */}
        <HeroSection>
          <HeroBannerColumn>
            <Box
              style={{
                padding: 0,
                overflow: "hidden",
                width: "100%",
                borderRadius: "20px",
                aspectRatio: "2 / 1",
              }}
            >
              <ImageWithSkeleton
                src={AiBanner}
                alt="Torch AI Banner"
                skeletonHeight="100%"
                skeletonWidth="100%"
                borderRadius="20px"
                style={{
                  maxWidth: DESKTOP_MEDIA,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </Box>
          </HeroBannerColumn>
        </HeroSection>

        {/* 우측 영역: 타이틀 및 앱 리스트 */}
        <ContentSection>
          <TitleContentArea
            description={
              <>인천대학교 마스코트 횃불이의 다양한 AI 서비스를 만나보세요!</>
            }
          />

          {categories.map((category) => (
            <TitleContentArea
              key={category.categoryName}
              title={category.categoryName}
            >
              <Box>
                {category.items.map((item, index) => (
                  <div
                    key={item.title}
                    style={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <AppItem
                      iconSrc={item.iconSrc}
                      iconComponent={item.iconComponent}
                      title={item.title}
                      description={item.description}
                      isPreparing={item.isPreparing}
                      isExternal={item.isExternal}
                      onClick={item.onClick}
                    />
                    {index < category.items.length - 1 && (
                      <Divider margin="0" />
                    )}
                  </div>
                ))}
              </Box>
            </TitleContentArea>
          ))}

          <TitleContentArea
            description={
              <>
                <strong>횃불이 AI</strong>는 인천대학교
                IT이노베이션랩(앱센터)에서 개발 및 운영하는 AI 서비스입니다.
                <br />
                <strong>횃불이 AI</strong> 기능은 바람처럼 나타났다 소리 없이
                사라질 수 있어요. 서비스의 지속 운영과 기능 추가를 위해 학우
                분들의 많은 관심과 성원을 부탁드립니다!
                <br />
                AI는 실수할 수 있습니다. 정보의 사실 여부를 반드시 확인하세요.
              </>
            }
          />
        </ContentSection>
      </MainLayoutGrid>
    </AiBrandPageWrapper>
  );
};

export default AiBrandPage;

const InnerContent = styled.div`
  display: flex;
  flex-direction: row;
  gap: 12px;
  align-items: center;
  justify-content: start;
  width: 100%;
  position: relative;
  z-index: 1;
  transition: transform 0.12s ease-in-out;
`;

const AiBrandPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 0 16px 40px;
`;

const AppItemWrapper = styled.div<{ $isPreparing?: boolean }>`
  display: flex;
  flex-direction: row;
  box-sizing: border-box;
  text-align: start;
  padding: 16px 20px;
  cursor: ${({ $isPreparing }) => ($isPreparing ? "not-allowed" : "pointer")};
  width: 100%;
  position: relative;
  overflow: hidden;
  opacity: ${({ $isPreparing }) => ($isPreparing ? 0.65 : 1)};
  transition: opacity 0.2s ease;

  &:hover {
    opacity: ${({ $isPreparing }) => ($isPreparing ? 0.65 : 0.85)};
  }

  &.active-touch {
    ${InnerContent} {
      transform: scale(0.98);
    }
  }
`;

const Icon = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: contain;
  flex-shrink: 0;
`;

const IconWrapper = styled.div<{ $isPreparing?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background-color: ${({ $isPreparing }) =>
    $isPreparing ? "#f2f2f7" : "#f0ecfa"};
  flex-shrink: 0;
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

const TitleRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
`;

const ExternalIconImg = styled.img`
  width: 14px;
  height: 14px;
  opacity: 0.55;
  flex-shrink: 0;
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
