import styled from "styled-components";
import ListImg from "../../../resource/assets/list-logo.svg";
import closeImg from "../../../resource/assets/close-img.svg";
import fileImg from "../../../resource/assets/file-img.svg";
import plusImg from "../../../resource/assets/plus-img.svg";
import { useState } from "react";
import { postFoldersPosts } from "old/utils/API/Folders";

interface FolderListDropDownsProps {
  folders: Folder[];
  postIds?: number[];
  postId?: number;
  token: string;
  handleCreateListClick: () => void;
  handleAddPosts: () => void;
  onClose: () => void;
}

export default function FolderListDropDowns({
  folders,
  postIds,
  postId,
  token,
  handleCreateListClick,
  handleAddPosts,
  onClose,
}: FolderListDropDownsProps) {
  const [selectedFolderIds, setSelectedFolderIds] = useState<number[]>([]);

  const handleOptionClick = (folderId: number) => {
    setSelectedFolderIds((prevIds) =>
      prevIds.includes(folderId)
        ? prevIds.filter((id) => id !== folderId)
        : [...prevIds, folderId],
    );
  };

  const handleAddClick = async () => {
    if (postIds && postIds.length > 0) {
      for (const postId of postIds) {
        for (const folderId of selectedFolderIds) {
          try {
            const response = await postFoldersPosts(token, postId, folderId);
            if (response.status === 200) {
              console.log(
                `폴더에 추가 성공: postId=${postId}, folderId=${folderId}, message=${response.body.msg}`,
              );
            } else {
              console.error(
                `폴더에 추가 실패: postId=${postId}, folderId=${folderId}, message=${response.body.msg}, status=${response.status}`,
              );
            }
          } catch (error) {
            console.error("폴더에 추가하지 못했습니다.", error);
          }
        }
      }
    } else if (postId) {
      for (const folderId of selectedFolderIds) {
        try {
          const response = await postFoldersPosts(token, postId, folderId);
          if (response.status === 200) {
            console.log(
              `폴더에 추가 성공: postId=${postId}, folderId=${folderId}, message=${response.body.msg}`,
            );
          } else {
            console.error(
              `폴더에 추가 실패: postId=${postId}, folderId=${folderId}, message=${response.body.msg}, status=${response.status}`,
            );
          }
        } catch (error) {
          console.error("폴더에 추가하지 못했습니다.", error);
        }
      }
    }
    setSelectedFolderIds([]);
    handleAddPosts();
  };

  return (
    <FolderListDropDownsWrapper className="dropdown-menu">
      <FolderListClose>
        <div>
          <img src={ListImg} className="list-img" />
          <span>List</span>
        </div>
        <img src={closeImg} className="close-img" onClick={onClose} />
      </FolderListClose>
      <FolderListDetail>
        {folders
          .filter((_, index) => index !== 0)
          .map((folder) => (
            <label key={folder.id}>
              <input
                type="checkbox"
                onClick={() => handleOptionClick(folder.id)}
              />
              <img src={fileImg} alt="" />
              <FolderListDropDownDetail>{folder.name}</FolderListDropDownDetail>
            </label>
          ))}
      </FolderListDetail>
      <FolderListButton>
        <div onClick={() => handleCreateListClick()}>
          <img src={plusImg} alt="" />
          <button>Create list</button>
        </div>
        <div onClick={() => handleAddClick()}>
          <button>담기</button>
        </div>
      </FolderListButton>
    </FolderListDropDownsWrapper>
  );
}

const FolderListDropDownsWrapper = styled.div`
  z-index: 1000;
  position: absolute;
  left: 0;
  right: 0;
  top: 30px;
  width: 207px;
  border-radius: 5px;
  border: 0.5px solid #969696;
  background-color: white;

  button {
    background-color: black;
    color: white;
    display: block;
    margin: 0 auto;
    text-align: center;
    border: none;
  }

  label {
    display: flex;
    align-items: center;
  }

  img {
    width: 16px;
    height: 16px;
    margin: 0 3px;
  }
`;

const FolderListClose = styled.div`
  display: flex;
  align-items: center;
  padding: 7px 8px;
  justify-content: space-between;
  border-bottom: 0.5px solid #969696;

  div {
    display: flex;
    align-items: center;
  }
  .list-img {
    width: 13px;
    height: 13px;
    margin-right: 3px;
  }
  span {
    font-size: 10px;
    font-weight: 500;
    line-height: 20px;
    letter-spacing: 0px;
    text-align: left;
  }
`;

const FolderListDropDownDetail = styled.div`
  font-size: 10px;
  font-weight: 800;
  color: #656565;
`;

const FolderListDetail = styled.div`
  padding: 11px;
`;

const FolderListButton = styled.div`
  display: flex;
  flex-direction: column;
  div {
    display: flex;
    align-items: center;
    border-top: 0.5px solid #969696;
    padding: 5px 9px;
  }

  button {
    background-color: white;
    color: black;
    margin: 0;
    font-size: 10px;
    font-weight: 500;
    line-height: 20px;
    letter-spacing: 0px;
    text-align: left;
  }

  img {
  }
`;
