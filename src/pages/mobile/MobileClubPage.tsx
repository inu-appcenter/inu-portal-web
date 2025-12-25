import styled from "styled-components";
import { Club } from "@/types/club";
import { getClubs } from "@/apis/club";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useUserStore from "../../stores/useUserStore.ts";
import ClubAdmin from "@/components/mobile/club/ClubAdmin";
import MobileHeader from "../../containers/mobile/common/MobileHeader.tsx";
import { useHeader } from "@/context/HeaderContext";
import Box from "@/components/common/Box.tsx";
import FillButton from "@/components/mobile/common/FillButton";
import Label from "@/components/mobile/common/Label";
import CategorySelectorNew from "@/components/mobile/common/CategorySelectorNew";

export default function MobileClubPage() {
  const location = useLocation();
  const { userInfo } = useUserStore();

  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const category = params.get("category") || "전체";
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isClubAdminOpen, setIsClubAdminOpen] = useState(false);

  // 헤더 설정 주입
  useHeader({
    title: "동아리",
  });

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await getClubs(category);
        setClubs(response.data);
        console.log(response);
      } catch (error) {
        console.error("동아리 가져오기 실패", error);
      }
    };
    fetchClubs();
  }, [category]);

  const handleRecruitingBtn = (clubId: number, clubName: string) => {
    navigate(`/home/recruitdetail?id=${clubId}&name=${clubName}`);
  };

  const clubCategories = [
    "전체",
    "교양학술",
    "문화",
    "봉사",
    "종교",
    "체육",
    "취미·전시",
  ];

  return (
    <MobileClubPageWrapper>
      <StickyHeaderWrapper>
        <MobileHeader />
        <TitleCategorySelectorWrapper>
          <CategorySelectorNew
            categories={clubCategories}
            selectedCategory={category}
          />
        </TitleCategorySelectorWrapper>
      </StickyHeaderWrapper>

      {isClubAdminOpen ? (
        <ClubAdmin setIsClubAdminOpen={setIsClubAdminOpen} />
      ) : (
        <>
          <ClubList>
            {clubs.map((club) => (
              // <ClubCard key={club.name}>
              <Box>
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
                            <strong>모집중🔥</strong>
                          </Label>
                        )}
                        <Label>{club.category}</Label>
                      </span>
                    </FirstLine>
                    <ButtonsWrapper>
                      {club.url && (
                        <FillButton
                          onClick={() => window.open(club.url, "_blank")}
                        >
                          소개 페이지
                        </FillButton>
                      )}
                      {club.homeUrl && (
                        <FillButton
                          onClick={() => window.open(club.homeUrl, "_blank")}
                        >
                          동아리 홈페이지
                        </FillButton>
                      )}
                      {club.isRecruiting && (
                        <FillButton
                          onClick={() =>
                            handleRecruitingBtn(club.id, club.name)
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
        </>
      )}
      <StickyBottomWrapper>
        {userInfo.role == "admin" && !isClubAdminOpen && (
          <button
            className="upload-button"
            onClick={() => setIsClubAdminOpen(true)}
          >
            관리자-모집공고
          </button>
        )}
      </StickyBottomWrapper>
    </MobileClubPageWrapper>
  );
}

const MobileClubPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;

  //padding-bottom: 32px;
  box-sizing: border-box;

  width: 100%;

  .upload-button {
    position: sticky;
    right: 20px;
    bottom: 100px;
    z-index: 999999;
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

    img {
      height: 24px;
    }

    font-size: 12px;
  }
`;

const StickyHeaderWrapper = styled.div`
  position: sticky;
  top: 0;
  z-index: 100;
  //background-color: #fff;
  width: 100%;
`;

const StickyBottomWrapper = styled.div`
  position: sticky;
  bottom: 0;
  z-index: 100;
  //background-color: #fff;
  width: 100%;
`;

const TitleCategorySelectorWrapper = styled.div`
  //width: 100%;
  padding: 4px 16px;
  margin: 0 16px;
  border-radius: 50px;
  box-sizing: border-box;
  //background-color: #fff;
  border-bottom: 1px solid #f2f2f2;

  background: rgba(255, 255, 255, 0.7);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
  -webkit-backdrop-filter: blur("5px");
  backdrop-filter: blur("5px");
`;

const ClubList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 8px;
  padding: 0 16px;
  box-sizing: border-box;
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
    max-width: 80px;
    border-radius: 10px;
  }
`;
const RightArea = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
  height: 100%;
  width: 100%;
`;

const FirstLine = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  h3 {
    margin: 0;
    font-weight: 500;
    font-size: 16px;
  }

  .label-wrapper {
    display: flex;
    flex-direction: row;
    gap: 4px;
  }
`;

const ButtonsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 4px;
  flex-wrap: wrap;
`;
