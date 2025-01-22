import MobileCouncilHeader from "mobile/components/council/MobileCouncilHeader";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import UploadNotice from "mobile/components/council/UploadNotice";
import NoticeList from "mobile/components/council/NoticeList";
import UploadPetition from "mobile/components/council/UploadPetition";
import PetitionList from "mobile/components/council/PetitionList";
import { useState } from "react";
import useUserStore from "stores/useUserStore";

export default function MobileCouncilPage() {
  const { userInfo } = useUserStore();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  let type = params.get("type") || "notice";

  const [reloadKey, setReloadKey] = useState(0);
  const [isNoticeUploadOpen, setIsNoticeUploadOpen] = useState(false);
  const [isPetitionUploadOpen, setIsPetitionUploadOpen] = useState(false);

  const handleNoticeUploaded = () => {
    setReloadKey((prevKey) => prevKey + 1);
    setIsNoticeUploadOpen(false);
  };

  const handlePatitionUploaded = () => {
    setReloadKey((prevKey) => prevKey + 1);
    setIsPetitionUploadOpen(false);
  };

  return (
    <MobileCouncilPageWrapper>
      <MobileCouncilHeader selectedType={type} />
      {type === "notice" && (
        <>
          {userInfo.role == "admin" && (
            <button onClick={() => setIsNoticeUploadOpen(true)}>
              공지 등록
            </button>
          )}
          <UploadNotice
            isOpen={isNoticeUploadOpen}
            onClose={() => {
              setIsNoticeUploadOpen(false);
            }}
            onUploaded={handleNoticeUploaded}
          />
          <NoticeList reloadKey={reloadKey} />
        </>
      )}
      {type === "petition" && (
        <>
          <button onClick={() => setIsPetitionUploadOpen(true)}>
            청원 등록
          </button>
          <UploadPetition
            isOpen={isPetitionUploadOpen}
            onClose={() => {
              setIsPetitionUploadOpen(false);
            }}
            onUploaded={handlePatitionUploaded}
          />
          <PetitionList reloadKey={reloadKey} />
        </>
      )}
    </MobileCouncilPageWrapper>
  );
}

const MobileCouncilPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;
`;
