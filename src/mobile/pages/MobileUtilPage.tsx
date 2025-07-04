import MobileUtilHeader from "mobile/components/util/MobileUtilHeader";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import UploadBook from "mobile/components/util/book/UploadBook.tsx";
import BookList from "mobile/components/util/book/BookList.tsx";
import UploadLost from "mobile/components/util/Lost/UploadLost.tsx";
import LostList from "mobile/components/util/Lost/LostList.tsx";
import { useState } from "react";
import useUserStore from "stores/useUserStore";
import Title from "mobile/containers/common/MobileTitleHeader.tsx";
import useMobileNavigate from "../../hooks/useMobileNavigate.ts";

import useReloadKeyStore from "stores/useReloadKeyStore";
import Rental from "../../components/rental/Rental.tsx";

export default function MobileUtilPage() {
  const { userInfo } = useUserStore();
  const mobileNavigate = useMobileNavigate();

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  let type = params.get("type") || "book";

  const { reloadKey, triggerReload } = useReloadKeyStore();
  const [isBookUploadOpen, setIsBookUploadOpen] = useState(false);
  const [isLostUploadOpen, setIsLostUploadOpen] = useState(false);
  const [isRentalAdminOpen, setIsRentalAdminOpen] = useState(false);

  const handleBookUploaded = () => {
    triggerReload();
    setIsBookUploadOpen(false);
  };

  const handleLostUploaded = () => {
    triggerReload();
    setIsLostUploadOpen(false);
  };

  return (
    <MobileUtilPageWrapper>
      <Title title={"편의"} onback={() => mobileNavigate("/home")} />

      <MobileUtilHeader
        selectedType={type}
        setIsRentalAdminOpen={setIsRentalAdminOpen}
      />
      <Wrapper>
        {type === "book" && (
          <>
            {userInfo.role == "admin" && !isBookUploadOpen && (
              <button
                className="upload-button"
                onClick={() => setIsBookUploadOpen(true)}
              >
                관리자-책 등록
              </button>
            )}
            <UploadBook
              isOpen={isBookUploadOpen}
              onClose={() => {
                setIsBookUploadOpen(false);
              }}
              onUploaded={handleBookUploaded}
            />
            <BookList reloadKey={reloadKey} />
          </>
        )}
        {type === "lost" && (
          <>
            {userInfo.role == "admin" && !isLostUploadOpen && (
              <button
                className="upload-button"
                onClick={() => setIsLostUploadOpen(true)}
              >
                관리자-분실물 등록
              </button>
            )}
            <UploadLost
              isOpen={isLostUploadOpen}
              onClose={() => {
                setIsLostUploadOpen(false);
              }}
              onUploaded={handleLostUploaded}
            />
            <LostList reloadKey={reloadKey} />
          </>
        )}
        {type === "rental" && (
          <>
            {userInfo.role == "admin" && (
              <button
                className="upload-button"
                onClick={() => setIsRentalAdminOpen(!isRentalAdminOpen)}
              >
                관리자
                <br />
                열기/닫기
              </button>
            )}
            <Rental isOpen={isRentalAdminOpen} />
          </>
        )}
      </Wrapper>
    </MobileUtilPageWrapper>
  );
}

const MobileUtilPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
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

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 0 16px;
`;
