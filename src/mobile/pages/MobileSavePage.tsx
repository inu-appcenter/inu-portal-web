import styled from "styled-components";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import ScrapFolders from "../containers/save/ScrapFolders";
import ScrapContents from "../containers/save/ScrapContents";
import ManageFolder from "../containers/save/ManageFolder";
import { getFolders } from "../../utils/API/Folders";
import loginImg from "../../resource/assets/login-logo.svg";

interface loginInfo {
  user: {
    token: string;
  };
}
interface Folder {
  id: number;
  name: string;
}

export default function MobileSavePage() {
  const token = useSelector((state: loginInfo) => state.user.token);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [isManagingFolders, setIsManagingFolders] = useState(false); // 폴더 관리 상태
  const [manageMode, setManageMode] = useState<"add" | "manage">("manage"); // 폴더 관리 모드

  const fetchFolders = async () => {
    try {
      const response = await getFolders(token);
      if (response.status === 200) {
        const allFolders = [{ id: 0, name: "전체" }, ...response.body.data];
        setFolders(allFolders);
        setSelectedFolder(allFolders[0]); // 기본 선택 폴더는 '전체'
      }
    } catch (error) {
      console.error("error");
    }
  };

  useEffect(() => {
    if (token) {
      fetchFolders();
    }
  }, [token]);

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
      {token ? (
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
              token={token}
              onFolderManaged={handleFolderManaged}
              mode={manageMode}
            />
          ) : (
            <ScrapContents
              folders={folders}
              folder={selectedFolder}
              token={token}
            />
          )}
        </>
      ) : (
        <ErrorWrapper>
          <LoginImg src={loginImg} alt="횃불이 로그인 이미지" />
          <div className="error">로그인이 필요합니다!</div>
        </ErrorWrapper>
      )}
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
