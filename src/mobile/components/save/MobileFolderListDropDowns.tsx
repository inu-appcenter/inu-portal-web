import styled from 'styled-components';
import ListImg from '../../../resource/assets/list-logo.svg';
import closeImg from '../../../resource/assets/close-img.svg';
import fileImg from '../../../resource/assets/file-img.svg';
import { useState } from 'react';
import { postFoldersPosts } from '../../../utils/API/Folders';

interface MobileFolderListDropDownsProps {
  folders: Folder[];
  postIds?: number[];
  postId?: number;
  token: string;
  handleAddPosts: () => void;
  onClose: () => void;
}

export default function MobileFolderListDropDowns({ folders, postIds, postId, token, handleAddPosts, onClose }: MobileFolderListDropDownsProps) {
  const [selectedFolderIds, setSelectedFolderIds] = useState<number[]>([]);

  const handleOptionClick = (folderId: number) => {
    setSelectedFolderIds(prevIds => prevIds.includes(folderId) ? prevIds.filter(id => id !== folderId) : [...prevIds, folderId]);
  };

  const handleAddClick = async () => {
    if (postIds && postIds.length > 0) {
      for (const postId of postIds) {
        for (const folderId of selectedFolderIds) {
          try {
            const response = await postFoldersPosts(token, postId, folderId);
            if (response.status === 200) {
              console.log(`폴더에 추가 성공: postId=${postId}, folderId=${folderId}, message=${response.body.msg}`);
            } else {
              console.error(`폴더에 추가 실패: postId=${postId}, folderId=${folderId}, message=${response.body.msg}, status=${response.status}`);
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
            console.log(`폴더에 추가 성공: postId=${postId}, folderId=${folderId}, message=${response.body.msg}`);
          } else {
            console.error(`폴더에 추가 실패: postId=${postId}, folderId=${folderId}, message=${response.body.msg}, status=${response.status}`);
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
    <>
      <MobileFolderListDropDownsWrapper className="dropdown-menu">
        <FolderListClose>
          <div>
            <img src={ListImg} className='list-img' />
            <span>List</span>
          </div>
          <img src={closeImg} className='close-img' onClick={onClose} />
        </FolderListClose>
        <FolderListDetail>
          {folders.filter((_, index) => index !== 0).map((folder) => (
            <label key={folder.id}>
              <input type="checkbox" onClick={() => handleOptionClick(folder.id)} />
              <img src={fileImg} alt="" />
              <FolderListDropDownDetail>{folder.name}</FolderListDropDownDetail>
            </label>
          ))}
        </FolderListDetail>
      </MobileFolderListDropDownsWrapper>
      <ConfirmButton onClick={handleAddClick}>확인</ConfirmButton>
      <Overlay />
    </>
  );
}

const Overlay = styled.div`
  z-index: 999;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.75);
`;

const MobileFolderListDropDownsWrapper = styled.div`
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

const ConfirmButton = styled.button`
  z-index: 1001;
  position: fixed;
  background-color: #9CAFE2;
  left: 50%;
  bottom: 10%;
  transform: translateX(-50%);
  width: 102px;
  height: 40px;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 20px;
  font-weight: 700;

  display: flex;
  align-items: center;
  justify-content: center;
`;
