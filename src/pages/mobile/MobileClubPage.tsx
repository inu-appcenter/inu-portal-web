import CategorySelector from "@/components/mobile/club/ClubCategorySelector";
import styled from "styled-components";
import { Club } from "@/types/club";
import { getClubs } from "@/apis/club";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useUserStore from "../../stores/useUserStore.ts";
import ClubAdmin from "@/components/mobile/club/ClubAdmin";
import MobileHeader from "../../containers/mobile/common/MobileHeader.tsx";

export default function MobileClubPage() {
  const location = useLocation();
  const { userInfo } = useUserStore();

  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const category = params.get("category") || "전체";
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isClubAdminOpen, setIsClubAdminOpen] = useState(false);

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

  return (
    <MobileClubPageWrapper>
      <MobileHeader title={"동아리"} />

      {isClubAdminOpen ? (
        <ClubAdmin setIsClubAdminOpen={setIsClubAdminOpen} />
      ) : (
        <>
          {userInfo.role == "admin" && !isClubAdminOpen && (
            <button
              className="upload-button"
              onClick={() => setIsClubAdminOpen(true)}
            >
              관리자-모집공고
            </button>
          )}

          <TitleCategorySelectorWrapper>
            <CategorySelectorWrapper>
              <CategorySelector />
            </CategorySelectorWrapper>
          </TitleCategorySelectorWrapper>
          <ClubList>
            {clubs.map((club) => (
              <ClubCard key={club.name}>
                <img src={club.imageUrl} alt={club.name} />
                <div>
                  <span className="wrapper">
                    <h3>{club.name}</h3>
                    <span className="tag">
                      {club.isRecruiting && (
                        <h4 className="club-category">
                          <strong>모집중🔥</strong>
                        </h4>
                      )}
                      <h4 className="club-category">{club.category}</h4>
                    </span>
                  </span>
                  <span className="buttons-wrapper">
                    {club.url && (
                      <button onClick={() => window.open(club.url, "_blank")}>
                        소개 페이지
                      </button>
                    )}
                    {club.homeUrl && (
                      <button
                        onClick={() => window.open(club.homeUrl, "_blank")}
                      >
                        동아리 홈페이지
                      </button>
                    )}
                    {club.isRecruiting && (
                      <button
                        onClick={() => handleRecruitingBtn(club.id, club.name)}
                      >
                        모집 공고
                      </button>
                    )}
                  </span>
                </div>
              </ClubCard>
            ))}
          </ClubList>
        </>
      )}
    </MobileClubPageWrapper>
  );
}

const MobileClubPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;

  padding-bottom: 32px;
  box-sizing: border-box;

  width: 100%;

  .upload-button {
    position: fixed;
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

const TitleCategorySelectorWrapper = styled.div`
  width: 100%;
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
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

const ClubCard = styled.div`
  min-height: 90px;
  height: fit-content;
  padding: 10px 0 10px 0;
  width: 100%;
  border: 2px solid #7aa7e5;
  border-radius: 10px;
  display: flex;
  gap: 16px;
  align-items: center;

  img {
    margin-left: 4px;
    max-width: 96px;
    border-radius: 10px;
  }

  div {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-right: 16px;

    .tag {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-end;
      width: fit-content;
      height: fit-content;
      gap: 5px;
    }

    .club-category {
      margin: 0;
      font-weight: 500;
      border-radius: 6px;
      padding: 4px 8px;
      font-size: 12px;
      background-color: rgba(236, 244, 255, 1);
      min-width: fit-content;
    }

    h3 {
      margin: 0;
      font-weight: 500;
      font-size: 16px;
    }
  }

  .buttons-wrapper {
    display: flex;
    flex-wrap: wrap;

    align-items: center;
    gap: 8px;
  }

  button {
    border: 2px solid #7aa7e5;
    background-color: #7aa7e5;
    border-radius: 12px;
    padding: 4px 8px;
    color: white;
  }
`;

const CategorySelectorWrapper = styled.div`
  position: absolute;
  right: 20px;
`;
