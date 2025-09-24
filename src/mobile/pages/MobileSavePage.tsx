import styled from "styled-components";
import { useEffect, useState } from "react";
import ScrapFolders from "mobile/containers/save/ScrapFolders";
import ScrapContents from "mobile/containers/save/ScrapContents";
import ManageFolder from "mobile/containers/save/ManageFolder";
import { getFolders } from "apis/folders";
import loginImg from "resources/assets/login/login-modal-logo.svg";
import { Folder } from "types/folders";
import axios, { AxiosError } from "axios";
import useUserStore from "stores/useUserStore";
import MobileHeader from "../containers/common/MobileHeader.tsx";
import MobileNav from "../containers/common/MobileNav.tsx";

export default function MobileSavePage() {
  const { tokenInfo } = useUserStore();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>({
    id: 0,
    name: "전체",
  });
  const [isManagingFolders, setIsManagingFolders] = useState(false); // 폴더 관리 상태
  const [manageMode, setManageMode] = useState<"add" | "manage">("manage"); // 폴더 관리 모드

  const fetchFolders = async () => {
    try {
      const response = await getFolders();
      setFolders([...[{ id: 0, name: "전체" }], ...response.data]);
    } catch (error) {
      console.error("회원의 모든 스크랩폴더 가져오기 실패", error);
      // refreshError가 아닌 경우 처리
      if (
        axios.isAxiosError(error) &&
        !(error as AxiosError & { isRefreshError?: boolean }).isRefreshError &&
        error.response
      ) {
        alert("회원의 모든 스크랩폴더 가져오기 실패");
      }
    }
  };

  useEffect(() => {
    if (tokenInfo.accessToken) {
      fetchFolders();
    }
  }, [tokenInfo]);

  const handleManageFoldersClick = (mode: "add" | "manage") => {
    setManageMode(mode);
    setIsManagingFolders(true);
    setSelectedFolder(null);
  };

  const handleFolderManaged = async () => {
    await fetchFolders();
    setSelectedFolder(null);
  };

  const handleSelectFolder = (folder: Folder) => {
    setSelectedFolder(folder);
    setIsManagingFolders(false);
  };

  return (
    <MobileSavePageWrapper>
      <MobileHeader showAlarm={true} />
      {tokenInfo.accessToken ? (
        <>
          <ScrapFolders
            folders={folders}
            selectedFolder={selectedFolder}
            onSelectFolder={handleSelectFolder}
            onManageFoldersClick={handleManageFoldersClick} // 폴더 관리 버튼 클릭 핸들러
            isManagingFolders={isManagingFolders}
          />
          {isManagingFolders ? (
            <ManageFolder
              folders={folders}
              onFolderManaged={handleFolderManaged}
              mode={manageMode}
            />
          ) : (
            <ScrapContents folders={folders} folder={selectedFolder} />
          )}
        </>
      ) : (
        <ErrorWrapper>
          <LoginImg src={loginImg} alt="횃불이 로그인 이미지" />
          <div className="error">로그인이 필요합니다!</div>
        </ErrorWrapper>
      )}
      <MobileNav />
    </MobileSavePageWrapper>
  );
}

const MobileSavePageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  height: 100%;
  width: 100%;
`;

const ErrorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
  align-items: center;
  margin-top: 100px;
  div {
    font-size: 20px;
  }
`;

const LoginImg = styled.img`
  width: 150px;
`;
