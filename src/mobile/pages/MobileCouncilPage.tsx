import MobileCouncilHeader from "mobile/components/council/MobileCouncilHeader";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import UploadNotice from "mobile/components/council/UploadNotice";
import NoticeList from "mobile/components/council/NoticeList";
import UploadPetition from "mobile/components/council/UploadPetition";
import PetitionList from "mobile/components/council/PetitionList";
import { useState } from "react";
import useUserStore from "stores/useUserStore";
import PencilImg from "resources/assets/posts/pencil-white.svg";
import useReloadKeyStore from "stores/useReloadKeyStore";
import Title from "mobile/containers/common/MobileTitleHeader.tsx";
import useMobileNavigate from "../../hooks/useMobileNavigate.ts";

export default function MobileCouncilPage() {
  const { userInfo } = useUserStore();
  const mobileNavigate = useMobileNavigate();

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  let type = params.get("type") || "notice";

  const { reloadKey, triggerReload } = useReloadKeyStore();
  const [isNoticeUploadOpen, setIsNoticeUploadOpen] = useState(false);
  const [isPetitionUploadOpen, setIsPetitionUploadOpen] = useState(false);

  const handleNoticeUploaded = () => {
    triggerReload();
    setIsNoticeUploadOpen(false);
  };

  const handlePatitionUploaded = () => {
    triggerReload();
    setIsPetitionUploadOpen(false);
  };

  return (
    <MobileCouncilPageWrapper>
      <Title title={"총학생회"} onback={() => mobileNavigate("/home")} />

      <MobileCouncilHeader selectedType={type} />
      <Wrapper>
        {type === "notice" && (
          <>
            {userInfo.role == "admin" && !isNoticeUploadOpen && (
              <button
                className="upload-button"
                onClick={() => setIsNoticeUploadOpen(true)}
              >
                관리자-공지 등록
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
            {!isPetitionUploadOpen && (
              <button
                className="upload-button"
                onClick={() => setIsPetitionUploadOpen(true)}
              >
                <img src={PencilImg} alt="" />
                글쓰기
              </button>
            )}
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
      </Wrapper>
    </MobileCouncilPageWrapper>
  );
}

const MobileCouncilPageWrapper = styled.div`
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
  padding: 0 16px;
  padding-bottom: 32px;
  box-sizing: border-box;
`;
