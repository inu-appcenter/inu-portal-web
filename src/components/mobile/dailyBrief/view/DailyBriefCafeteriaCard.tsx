import { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { getCafeterias } from "@/apis/cafeterias";
import { ROUTES } from "@/constants/routes";

export default function DailyBriefCafeteriaCard() {
  const navigate = useNavigate();
  const [menus, setMenus] = useState<string[]>([]);
  const [cafeteriaName, setCafeteriaName] = useState("제1학생식당");

  const todayDay = new Date().getDay(); // 0(일) ~ 6(토)
  // 주말이면 월요일(1) 기준
  const apiDay = todayDay >= 1 && todayDay <= 5 ? todayDay : 1;

  useEffect(() => {
    let isMounted = true;
    void getCafeterias("제1학생식당", apiDay)
      .then((res) => {
        if (isMounted && res.data) {
          const parsed = res.data.filter(Boolean) as string[];
          if (parsed.length > 0) {
            setMenus(parsed);
          } else {
            // 다른 식당 시도
            void getCafeterias("제2학생식당", apiDay).then((res2) => {
              if (isMounted && res2.data) {
                setCafeteriaName("제2학생식당");
                setMenus(res2.data.filter(Boolean) as string[]);
              }
            });
          }
        }
      })
      .catch((err) => {
        console.warn("학식 메뉴 조회 실패:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [apiDay]);

  const representativeMenu =
    menus[0] || "등심돈까스 & 미니우동 · 제육볶음정식";

  return (
    <SectionWrapper>
      <ContextIntro>
        맛있는 식사와 함께 활기찬 캠퍼스 라이프를 즐겨보세요.
      </ContextIntro>
      <CardContainer onClick={() => navigate(ROUTES.BOARD.MENU)}>
        <CardHeader>
          <CardBrandTitle>학식 메뉴</CardBrandTitle>
          <CafeteriaIconBadge>🍴</CafeteriaIconBadge>
        </CardHeader>

        <MediaContentRow>
          <ThumbnailBox>
            <ThumbnailArt>🍱</ThumbnailArt>
            <ThumbnailTag>{cafeteriaName}</ThumbnailTag>
          </ThumbnailBox>
          <MenuMetaCol>
            <MenuTitle>{representativeMenu}</MenuTitle>
            <MenuSubtitle>{cafeteriaName} 오늘의 추천</MenuSubtitle>
          </MenuMetaCol>
        </MediaContentRow>

        <BlackActionButton
          onClick={(e) => {
            e.stopPropagation();
            navigate(ROUTES.BOARD.MENU);
          }}
        >
          식단표 전체보기
        </BlackActionButton>
      </CardContainer>
    </SectionWrapper>
  );
}

const SectionWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
`;

const ContextIntro = styled.p`
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  padding: 0 4px;
  letter-spacing: -0.3px;
  line-height: 1.35;
`;

const CardContainer = styled.div`
  background: #ffffff;
  border-radius: 28px;
  padding: 22px 20px;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.04),
    0 1px 3px rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.8);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 18px;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;

  &:active {
    transform: scale(0.985);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CardBrandTitle = styled.h2`
  font-size: 20px;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.5px;
  margin: 0;
`;

const CafeteriaIconBadge = styled.span`
  font-size: 22px;
`;

const MediaContentRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ThumbnailBox = styled.div`
  width: 105px;
  height: 105px;
  border-radius: 18px;
  background: linear-gradient(135deg, #312e81 0%, #1e1b4b 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(30, 27, 75, 0.25);
`;

const ThumbnailArt = styled.span`
  font-size: 36px;
`;

const ThumbnailTag = styled.span`
  font-size: 10px;
  font-weight: 700;
  color: #c7d2fe;
  letter-spacing: -0.2px;
`;

const MenuMetaCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
`;

const MenuTitle = styled.h3`
  font-size: 17px;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.4px;
  line-height: 1.35;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const MenuSubtitle = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
`;

const BlackActionButton = styled.button`
  width: 100%;
  height: 48px;
  border-radius: 24px;
  background: #000000;
  border: none;
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.2px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;

  &:active {
    background: #27272a;
    transform: scale(0.99);
  }
`;
