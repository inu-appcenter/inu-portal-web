import MobileUtilHeader from "mobile/components/util/MobileUtilHeader";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import UploadBook from "mobile/components/util/UploadBook";
import BookList from "mobile/components/util/BookList";
import { useState } from "react";
import useUserStore from "stores/useUserStore";

export default function MobileUtilPage() {
  const { userInfo } = useUserStore();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  let type = params.get("type") || "book";

  const [reloadKey, setReloadKey] = useState(0);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const handleBookUploaded = () => {
    setReloadKey((prevKey) => prevKey + 1);
    setIsUploadOpen(false); // 책 등록 후 창 닫기
  };

  const handleOpenUpload = () => {
    setIsUploadOpen(true);
  };

  const handleCloseUpload = () => {
    setIsUploadOpen(false);
  };

  return (
    <MobileUtilPageWrapper>
      <MobileUtilHeader selectedType={type} />
      {type === "book" && (
        <>
          {userInfo.role == "admin" && (
            <button onClick={handleOpenUpload}>책 등록</button>
          )}
          <UploadBook
            isOpen={isUploadOpen}
            onClose={handleCloseUpload}
            onBookUploaded={handleBookUploaded}
          />{" "}
          <BookList reloadKey={reloadKey} />
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
