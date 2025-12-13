import CategorySelector from "@/components/mobile/club/ClubCategorySelector";
// import TipsPageTitle from "@/components/mobile/tips/TipsPageTitle";
import styled from "styled-components";
import { Club } from "@/types/club";
import { getClubs } from "@/apis/club";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Title from "@/containers/mobile/common/MobileTitleHeader.tsx";
import ManageClubRecruit from "./ManageClubRecruit.tsx";
// import UploadBook from "../util/book/UploadBook.tsx";

export default function ClubAdmin({
  setIsClubAdminOpen,
}: {
  setIsClubAdminOpen: (arg0: boolean) => void;
}) {
  const location = useLocation();
  // const mobileNavigate = useMobileNavigate();

  const params = new URLSearchParams(location.search);
  const category = params.get("category") || "전체";
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isManageRecruitOpen, setIsManageRecruitOpen] =
    useState<boolean>(false);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);

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

  const handleManageBtn = (club: Club) => {
    setIsManageRecruitOpen(true);
    setSelectedClub(club);
    console.log(selectedClub);
  };

  const handleRecruitUploaded = () => {
    // triggerReload();
    setIsManageRecruitOpen(false);
  };

  return (
    <MobileClubPageWrapper>
      <ManageClubRecruit
        isOpen={isManageRecruitOpen}
        onClose={() => {
          setIsManageRecruitOpen(false);
        }}
        onUploaded={handleRecruitUploaded}
        selectedClub={selectedClub}
      />

      <TitleCategorySelectorWrapper>
        {/*<TipsPageTitle value="동아리"/>*/}
        <Title
          title={"동아리 관리자 모드🖥️"}
          onback={() => setIsClubAdminOpen(false)}
        />

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
                </span>{" "}
              </span>
              <span className="buttons-wrapper">
                <button
                  onClick={() => {
                    handleManageBtn(club);
                  }}
                >
                  {" "}
                  모집 공고 등록/수정
                </button>
              </span>
            </div>
          </ClubCard>
        ))}
      </ClubList>
    </MobileClubPageWrapper>
  );
}

const MobileClubPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 0 16px 0 16px;
  width: 100%;
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
`;

const ClubCard = styled.div`
  height: 96px;
  width: 96%;
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
