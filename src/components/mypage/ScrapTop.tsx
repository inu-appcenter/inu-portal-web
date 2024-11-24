import { deleteFolders, postFolders } from "apis/folders";
import styled from "styled-components";
import { Folder } from "types/folders";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import plus from "resources/assets/mypage/plus.svg";
import folderImage from "resources/assets/mypage/folder.svg";
import minus from "resources/assets/mypage/minus.svg";
import SearchBar from "components/mypage/SearchBar";
import axios, { AxiosError } from "axios";

interface Props {
  folders: Folder[];
  setFolders: React.Dispatch<React.SetStateAction<Folder[]>>;
}

export default function ScrapTop({ folders, setFolders }: Props) {
  const [isOpenAddFolderModal, setIsOpenAddFolderModal] =
    useState<boolean>(false);
  const [addFolderName, setAddFolderName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleAddFolders();
    }
  };

  const handleDeleteFolders = async (folderId: number) => {
    if (loading) {
      return;
    }
    const confirmDelete = window.confirm("정말 이 폴더를 삭제하시겠습니까?");
    if (!confirmDelete) {
      return;
    }
    try {
      setLoading(true);
      const response = await deleteFolders(folderId);
      setFolders((prevFolders) =>
        prevFolders.filter((folder) => folder.id !== response.data)
      );
    } catch (error) {
      console.error("폴더 삭제 실패", error);
      // refreshError가 아닌 경우 처리
      if (
        axios.isAxiosError(error) &&
        !(error as AxiosError & { isRefreshError?: boolean }).isRefreshError &&
        error.response
      ) {
        alert("폴더 삭제 실패");
      }
    }
    setLoading(false);
  };

  const handleAddFolders = async () => {
    if (loading) {
      return;
    }
    try {
      setLoading(true);
      const response = await postFolders(addFolderName);
      setFolders([...folders, { id: response.data, name: addFolderName }]);
      setAddFolderName("");
      setIsOpenAddFolderModal(false);
    } catch (error) {
      console.error("폴더 생성 실패", error);
      // refreshError가 아닌 경우 처리
      if (
        axios.isAxiosError(error) &&
        !(error as AxiosError & { isRefreshError?: boolean }).isRefreshError &&
        error.response
      ) {
        alert("폴더 생성 실패");
      }
    }
    setLoading(false);
  };

  const handleClickFolder = (folderId: number) => {
    const params = new URLSearchParams(location.search);
    params.set("folderId", String(folderId));
    params.delete("page");
    navigate(`/mypage?${params.toString()}`);
  };
  return (
    <>
      <ScrapTopWrapper>
        <h1>나의 스크랩</h1>
        <SearchBar />
        <div className="folders">
          <div className="folder">
            <div onClick={() => handleClickFolder(0)}>
              <img src={folderImage} alt="" />
              <span>내 폴더</span>
            </div>
          </div>
          {folders.map((folder) => (
            <div key={folder.id} className="folder">
              <img
                className="minus"
                src={minus}
                alt="-"
                onClick={() => handleDeleteFolders(folder.id)}
              />
              <div onClick={() => handleClickFolder(folder.id)}>
                <img src={folderImage} alt="" />
                <span>{folder.name}</span>
              </div>
            </div>
          ))}
          <button
            className="addFolder"
            onClick={() => setIsOpenAddFolderModal(true)}
          >
            <img src={plus} alt="+" />
          </button>
        </div>
      </ScrapTopWrapper>
      {isOpenAddFolderModal && (
        <Modal>
          <button
            className="close"
            onClick={() => setIsOpenAddFolderModal(false)}
          >
            X
          </button>
          <img src={folderImage} alt="" />
          <h3>파일 이름</h3>
          <input
            type="text"
            value={addFolderName}
            onChange={(e) => setAddFolderName(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <button className="add" onClick={handleAddFolders}>
            확인
          </button>
        </Modal>
      )}
    </>
  );
}
const ScrapTopWrapper = styled.div`
  padding-top: 64px;
  background: linear-gradient(to bottom, #dbebff 70%, #ffffff);
  display: flex;
  flex-direction: column;
  gap: 32px;
  h1 {
    padding-left: 64px;
    color: #0e4d9d;
    font-size: 32px;
    font-weight: 600;
    margin: 0;
  }
  .folders {
    display: flex;
    width: 1108px;
    overflow-x: scroll;
    .folder {
      margin: 0 0 32px 64px;
      background: transparent;
      border: none;
      position: relative;
      .minus {
        position: absolute;
        right: 8px;
        width: 16px;
      }
      span {
        width: 92px;
        background-color: white;
        border-radius: 6px;
        text-align: center;
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        bottom: 26px;
        font-weight: 600;
      }
    }
    .addFolder {
      margin: 0 0 32px 64px;
      background: transparent;
      border: none;
      position: relative;
      margin-right: 64px;
    }
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 100;
  transform: translate(-50%, -50%);
  display: flex;
  background-color: white;
  width: 720px;
  height: 320px;
  border-radius: 12px;
  border: 1px solid #aac9ee;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  input {
    width: 248px;
    height: 32px;
    text-align: center;
    background-color: #f3f3f3;
    border-radius: 12px;
    border: none;
    font-size: 20px;
  }
  .close {
    position: absolute;
    top: 16px;
    right: 16px;
    font-size: 20px;
    background-color: transparent;
    border: none;
  }
  .add {
    margin-top: 16px;
    font-size: 20px;
    font-weight: 500;
    background-color: #4071b9;
    color: white;
    border-radius: 8px;
    height: 32px;
    width: 80px;
    border: none;
  }
`;
