import styled from "styled-components";
import { ClubRecruit } from "@/types/club.ts";
import { getClubRecruit } from "@/apis/club.ts";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
// import ManageClubRecruit from "../components/club/ManageClubRecruit.tsx";
import MobileHeader from "../../containers/mobile/common/MobileHeader.tsx";
import ClubContent from "@/components/mobile/club/clubcontent.tsx";
// import UploadBook from "../util/book/UploadBook.tsx";

export default function MobileClubRecruitDetailPage() {
  const location = useLocation();

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
      <MobileHeader title={clubName + " 모집 공고" || ""} />
      {clubRecruitDetail ? (
        <ClubContent
          id={clubId || "0"}
          content={clubRecruitDetail.recruit}
          imageCount={clubRecruitDetail.imageCount}
          modifiedDate={clubRecruitDetail.modifiedDate}
        />
      ) : (
        <>게시글을 불러오는 중 오류가 발생하였습니다.</>
      )}
    </MobileClubPageWrapper>
  );
}

const MobileClubPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 0 16px;
  box-sizing: border-box;

  width: 100%;
`;
