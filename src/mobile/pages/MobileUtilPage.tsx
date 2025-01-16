import MobileUtilHeader from "mobile/components/util/MobileUtilHeader";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import UploadBook from "mobile/components/util/UploadBook";
import BookList from "mobile/components/util/BookList";
import UploadPetition from "mobile/components/util/UploadPetition";
import PetitionList from "mobile/components/util/PetitionList";
import { useState } from "react";
import useUserStore from "stores/useUserStore";

export default function MobileUtilPage() {
  const { userInfo } = useUserStore();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  let type = params.get("type") || "book";

  const [reloadKey, setReloadKey] = useState(0);
  const [isBookUploadOpen, setIsBookUploadOpen] = useState(false);
  const [isPetitionUploadOpen, setIsPetitionUploadOpen] = useState(false);

  const handleBookUploaded = () => {
    setReloadKey((prevKey) => prevKey + 1);
    setIsBookUploadOpen(false);
  };

  const handlePatitionUploaded = () => {
    setReloadKey((prevKey) => prevKey + 1);
    setIsPetitionUploadOpen(false);
  };

  return (
    <MobileUtilPageWrapper>
      <MobileUtilHeader selectedType={type} />
      {type === "book" && (
        <>
          {userInfo.role == "admin" && (
            <button
              onClick={() => {
                setIsBookUploadOpen(true);
              }}
            >
              책 등록
            </button>
          )}
          <UploadBook
            isOpen={isBookUploadOpen}
            onClose={() => {
              setIsBookUploadOpen(false);
            }}
            onBookUploaded={handleBookUploaded}
          />
          <BookList reloadKey={reloadKey} />
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
            onPetitionUpload={handlePatitionUploaded}
          />
          <PetitionList reloadKey={reloadKey} />
        </>
      )}
    </MobileUtilPageWrapper>
  );
}

const MobileUtilPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;
`;
