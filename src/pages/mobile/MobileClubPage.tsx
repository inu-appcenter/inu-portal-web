import styled from "styled-components";
import { Club } from "@/types/club";
import { getClubs } from "@/apis/club";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useUserStore from "../../stores/useUserStore.ts";
import ClubAdmin from "@/components/mobile/club/ClubAdmin";
import { useHeader } from "@/context/HeaderContext";
import Box from "@/components/common/Box.tsx";
import FillButton from "@/components/mobile/common/FillButton";
import Label from "@/components/mobile/common/Label";
import Skeleton from "@/components/common/Skeleton";
import CategorySelectorNew from "@/components/mobile/common/CategorySelectorNew";
import SwipeChevronGuides from "@/components/mobile/common/SwipeChevronGuides";
import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperClass } from "swiper";
import "swiper/css";
import {
  DESKTOP_CONTENT_MAX_WIDTH,
  DESKTOP_MEDIA,
  MOBILE_PAGE_GUTTER,
} from "@/styles/responsive";
import { mixpanelTrack } from "@/utils/mixpanel";
import { resetScrollToTop } from "@/utils/scroll";

interface ClubListSectionProps {
  category: string;
  onRecruitClick: (clubId: number, clubName: string) => void;
}

const ClubListSection = ({ category, onRecruitClick }: ClubListSectionProps) => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchClubs = async () => {
      mixpanelTrack.clubCategorySelected(category);
      setIsLoading(true);
      try {
        const response = await getClubs(category);
        setClubs(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("동아리 가져오기 실패", error);
      }
    };
    fetchClubs();
  }, [category]);

  // 카테고리 로딩 및 변경 시 강건하게 최상단 스크롤 리셋
  useEffect(() => {
    resetScrollToTop();
  }, [category, isLoading]);

  return (
    <ClubList>
      {isLoading && clubs.length === 0
        ? Array.from({ length: 6 }).map((_, i) => (
            <Box key={`club-skeleton-${i}`}>
              <ContentWrapper>
                <Skeleton width={100} height={80} />
                <RightArea>
                  <FirstLine>
                    <Skeleton width="40%" height={20} />
                    <div style={{ display: "flex", gap: "4px" }}>
                      <Skeleton width={40} height={22} />
                      <Skeleton width={40} height={22} />
                    </div>
                  </FirstLine>
                  <ButtonsWrapper>
                    <Skeleton width={70} height={30} />
                    <Skeleton width={70} height={30} />
                  </ButtonsWrapper>
                </RightArea>
              </ContentWrapper>
            </Box>
          ))
        : clubs.map((club) => (
            <Box key={club.id}>
              <ContentWrapper>
                <img
                  src={club.imageUrl}
                  alt={club.name}
                  className="club-logo"
                />
                <RightArea>
                  <FirstLine>
                    <h3>{club.name}</h3>
                    <span className="label-wrapper">
                      {club.isRecruiting && (
                        <Label>
                          <strong>모집 중🔥</strong>
                        </Label>
                      )}
                      <Label>{club.category}</Label>
                    </span>
                  </FirstLine>
                  <ButtonsWrapper>
                    {club.url && (
                      <FillButton
                        onClick={() => {
                          mixpanelTrack.clubExternalLinkClicked(
                            club.name,
                            "Intro",
                          );
                          window.open(club.url, "_blank");
                        }}
                        isExternalLink={true}
                      >
                        소개 페이지
                      </FillButton>
                    )}
                    {club.homeUrl && (
                      <FillButton
                        onClick={() => {
                          mixpanelTrack.clubExternalLinkClicked(
                            club.name,
                            "Homepage",
                          );
                          window.open(club.homeUrl, "_blank");
                        }}
                        isExternalLink={true}
                      >
                        동아리 홈페이지
                      </FillButton>
                    )}
                    {club.isRecruiting && (
                      <FillButton
                        onClick={() =>
                          onRecruitClick(club.id, club.name)
                        }
                      >
                        모집 공고
                      </FillButton>
                    )}
                  </ButtonsWrapper>
                </RightArea>
              </ContentWrapper>
            </Box>
          ))}
    </ClubList>
  );
};

export default function MobileClubPage() {
  const location = useLocation();
  const { userInfo } = useUserStore();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const selectedCategory = params.get("category") || "전체";

  const [isClubAdminOpen, setIsClubAdminOpen] = useState(false);

  // 카테고리 변경 시 스크롤 상단 이동
  useEffect(() => {
    resetScrollToTop();
  }, [selectedCategory]);

  const handleRecruitingBtn = (clubId: number, clubName: string) => {
    navigate(`/home/recruitdetail?id=${clubId}&name=${clubName}`);
  };

  const [clubCategories] = useState([
    "전체",
    "교양학술",
    "문화",
    "봉사",
    "종교",
    "체육",
    "취미·전시",
  ]);

  const [swiperRef, setSwiperRef] = useState<SwiperClass | null>(null);
  const [hasSwiped, setHasSwiped] = useState(() => {
    return localStorage.getItem("has_swiped") === "true";
  });

  const currentIndex = useMemo(() => {
    const idx = clubCategories.indexOf(selectedCategory);
    return idx === -1 ? 0 : idx;
  }, [selectedCategory, clubCategories]);

  useEffect(() => {
    if (swiperRef && swiperRef.activeIndex !== currentIndex) {
      swiperRef.slideTo(currentIndex);
    }
  }, [currentIndex, swiperRef]);

  // 데이터 로딩 완료 시점을 대비한 스위퍼 리사이징 수동 업데이트 트리거
  useEffect(() => {
    if (swiperRef) {
      setTimeout(() => {
        swiperRef.update();
        swiperRef.updateAutoHeight();
      }, 100);
      setTimeout(() => {
        swiperRef.update();
        swiperRef.updateAutoHeight();
      }, 350);
    }
  }, [selectedCategory, swiperRef]);

  const handleSlideChange = (s: SwiperClass) => {
    const nextCategory = clubCategories[s.activeIndex];

    if (!hasSwiped) {
      setHasSwiped(true);
      localStorage.setItem("has_swiped", "true");
    }

    resetScrollToTop();

    if (nextCategory && nextCategory !== selectedCategory) {
      const nextParams = new URLSearchParams(location.search);
      nextParams.set("category", nextCategory);
      navigate(`${location.pathname}?${nextParams.toString()}`, { replace: true });
    }
  };

  const subHeader = useMemo(
    () => (
      <CategorySelectorNew
        categories={clubCategories}
        selectedCategory={selectedCategory}
      />
    ),
    [clubCategories, selectedCategory],
  ); // 의존성 배열 관리

  useHeader({
    title: "동아리",
    hasback: true,
    subHeader: subHeader,
    floatingSubHeader: true,
  });

  return (
    <MobileClubPageWrapper>
      {isClubAdminOpen ? (
        <ClubAdmin setIsClubAdminOpen={setIsClubAdminOpen} />
      ) : (
        <div style={{ width: "100%" }}>
          <Swiper
            onSwiper={setSwiperRef}
            initialSlide={currentIndex}
            onSlideChange={handleSlideChange}
            speed={320}
            autoHeight={true}
            observer={true}
            observeParents={true}
            style={{ width: "100%" }}
          >
            {clubCategories.map((category) => (
              <SwiperSlide key={category} style={{ height: "auto" }}>
                <ClubListSection
                  category={category}
                  onRecruitClick={handleRecruitingBtn}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

      <StickyBottomWrapper>
        {userInfo.role === "admin" && !isClubAdminOpen && (
          <button
            className="upload-button"
            onClick={() => setIsClubAdminOpen(true)}
          >
            관리자-모집공고
          </button>
        )}
      </StickyBottomWrapper>

      {/* 가로 스와이프 안내 시각 가이드 (스와이프 조작을 한 번도 안 한 최초 진입 시에만 노출) */}
      {!isClubAdminOpen && (
        <SwipeChevronGuides
          hasSwiped={hasSwiped}
          currentIndex={currentIndex}
          totalSlides={clubCategories.length}
        />
      )}
    </MobileClubPageWrapper>
  );
}

const MobileClubPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  box-sizing: border-box;
  width: 100%;
  padding-top: 12px;

  .swiper-autoheight {
    transition: height 0ms !important;
  }

  .upload-button {
    position: sticky;
    right: 20px;
    bottom: 100px;
    z-index: 9999;
    color: white;
    background-color: rgba(64, 113, 185, 1);
    border-radius: 100%;
    width: 64px;
    height: 64px;
    border: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-evenly;
    font-size: 12px;
  }

  @media ${DESKTOP_MEDIA} {
    width: min(100%, ${DESKTOP_CONTENT_MAX_WIDTH});
    margin: 0 auto;
    padding-top: 16px;
  }
`;

const StickyBottomWrapper = styled.div`
  position: sticky;
  bottom: 0;
  z-index: 100;
  width: 100%;
`;

const ClubList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 8px;
  padding: 0 ${MOBILE_PAGE_GUTTER};
  box-sizing: border-box;

  > * {
    width: 100%;
  }

  @media ${DESKTOP_MEDIA} {
    width: 100%;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: stretch;
    gap: 16px;
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 100%;
  min-height: 80px;
  width: 100%;
  gap: 16px;

  .club-logo {
    margin-left: 4px;
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 10px;
  }

  @media ${DESKTOP_MEDIA} {
    align-items: flex-start;
  }
`;

const RightArea = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
  height: 100%;
  width: 100%;
  min-width: 0;
`;

const FirstLine = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
  gap: 8px 12px;

  h3 {
    margin: 0;
    font-weight: 500;
    font-size: 16px;
    flex: 1 1 180px;
    min-width: 0;
    word-break: keep-all;
  }

  .label-wrapper {
    display: flex;
    flex-direction: row;
    gap: 4px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
`;

const ButtonsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 4px;
  flex-wrap: wrap;
  align-items: center;
`;


