import styled from "styled-components";
import { ClubRecruit } from "types/club.ts";
import { getClubRecruit } from "apis/club.ts";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Title from "mobile/containers/mypage/Title.tsx";
// import ManageClubRecruit from "../components/club/ManageClubRecruit.tsx";
import useMobileNavigate from "../../hooks/useMobileNavigate.ts";
import ClubContentContainer from "../containers/clubdetail/ClubContentContainer.tsx";
// import UploadBook from "../util/book/UploadBook.tsx";

export default function MobileClubRecruitDetailPage() {
  const location = useLocation();
  const mobileNavigate = useMobileNavigate();

  const params = new URLSearchParams(location.search);
  const clubId = params.get("id");
  const clubName = params.get("name");
  const [clubRecruitDetail, setClubRecruitDetail] = useState<ClubRecruit>();

  useEffect(() => {
    const fetchClubRecruit = async () => {
      try {
        if (clubId != null) {
          const response = await getClubRecruit(clubId);
          setClubRecruitDetail(response.data);
          console.log(response);
        }
      } catch (error) {
        console.error("동아리 모집공고 가져오기 실패", error);
      }
    };
    fetchClubRecruit();
  }, [clubId]);

  return (
    <MobileClubPageWrapper>
      <TitleCategorySelectorWrapper>
        <Title
          title={clubName + " 모집 공고" || ""}
          onback={() => mobileNavigate("/home/club")}
        />
      </TitleCategorySelectorWrapper>
      <PostWrapper>
        <ClubContentContainer ClubRecruit={clubRecruitDetail} />
      </PostWrapper>
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

const PostWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100svh - 135px);
  overflow-y: auto;
  position: relative;
  z-index: 1;
`;
