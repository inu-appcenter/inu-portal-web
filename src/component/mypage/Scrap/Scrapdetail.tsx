import styled from 'styled-components';
import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { deleteFoldersPosts } from '../../../utils/API/Folders';
import FolderListDropDowns from './FolderListDropDowns';

import ListImg from "../../../resource/assets/list-logo.svg";
import HeartImg from "../../../resource/assets/heart-logo.svg";
import CalendarImg from "../../../resource/assets/bx_calendar.svg";
import arrowImg from "../../../resource/assets/arrow.svg";
import deleteImg from "../../../resource/assets/deletebtn.svg";
import Pagination from './Pagination';
import SortDropBox from '../../common/SortDropBox';
import ReturnScrapButton from './ReturnButton';

interface loginInfo {
  user: {
    token: string;
  };
}

interface folderInfo {
  folder: {
    folders: { [key: number]: string };
  };
}

interface Document {
  id: number;
  title: string;
  category: string;
  writer: string;
  content: string;
  like: number;
  scrap: number;
  createDate: string;
  modifiedDate: string;
}

interface ScrapPostProps {
  selectedCategory: string;
  documents: Document[];
  setDocuments: (document: Document[]) => void;
  totalPages: number;
  total: number;
  scrapsort: string;
  page: number;
  setScrapSort: (sort: string) => void;
  setPage: (page: number) => void;
  handleCreateListClick: () => void;
}

export default function ScrapPost({ selectedCategory, setDocuments, documents, totalPages, total, scrapsort, page, setScrapSort, setPage, handleCreateListClick }: ScrapPostProps) {
  const token = useSelector((state: loginInfo) => state.user.token);
  const folders = useSelector((state: folderInfo) => state.folder.folders);
  const [showDropdown, setShowDropdown] = useState<number | null>(null);
  const { id } = useParams<{ id: string }>();

  const handleSearchTypeClick = (index: number) => {
    setShowDropdown(prevIndex => (prevIndex === index ? null : index));
  };

  const handleRemoveClick = async (postId: number) => {
    if (id !== undefined) {
      try {
        const response = await deleteFoldersPosts(token, postId, id);
        if (response.status === 200) {
          const filteredPostScrapFolderInfo = documents.filter(item => item.id !== postId);
          setDocuments(filteredPostScrapFolderInfo);
        } else {
          console.error("폴더에서 삭제 실패:", response.status);
        }
      } catch (error) {
        console.error("폴더에서 게시글을 삭제하지 못했습니다.", error);
      }
    }
  };

  // Folder object를 Folder[] 타입으로 변환
  const folderArray = Object.entries(folders).map(([id, name]) => ({ id: Number(id), name }));

  return (
    <ScrapWrapper>
      <ScrapDetailWrapper>
        <CountWrapper>
          <p className='title'>All scraps</p>
          <p className='length'>{total}</p>
        </CountWrapper>
        <BackSortWrapper>
          {selectedCategory === '폴더' && <ReturnScrapButton />}
          <SortDropBox sort={scrapsort} setSort={setScrapSort} />
        </BackSortWrapper>
      </ScrapDetailWrapper>
      <PostWrapper>
        {documents.map((item, index) => (
          <PostDetailWrapper key={item.id}>
            <PostScrapItem>
              <PostLink to={`/tips/${item.id}`}>
                <PostScrapItem>
                  <p className='category'>{item.category}</p>
                  <p className='title'>{`[${item.content}`}</p>
                  <p className='close-title'>{`]`}</p>
                </PostScrapItem>
              </PostLink>
              <PostListWrapper>
                {selectedCategory === '폴더' &&
                  <RemoveButton onClick={() => handleRemoveClick(item.id)}>
                    <img src={deleteImg} alt="" />
                    <span>삭제</span>
                  </RemoveButton>}
                <FolderListDropDownWrapper>
                  <FolderListDropDownBox onClick={() => handleSearchTypeClick(index)}>
                    <img src={ListImg} className='list-img' />
                    <span>List</span>
                    <img src={arrowImg} alt="" className='arrow-img' />
                  </FolderListDropDownBox>
                  {showDropdown === index && (
                    <FolderListDropDowns
                      folders={folderArray}
                      postId={item.id}
                      token={token}
                      handleCreateListClick={() => handleCreateListClick()}
                      onClose={() => setShowDropdown(null)}
                    />
                  )}
                </FolderListDropDownWrapper>
                <PostInfoWrapper>
                  <img src={CalendarImg} alt="" className='calender-image' />
                  <p className='createdate'>{item.createDate}</p>
                  <img src={HeartImg} alt="" className='heart-image' />
                  <p className='like'>{item.like}</p>
                </PostInfoWrapper>
              </PostListWrapper>
            </PostScrapItem>
          </PostDetailWrapper>
        ))}
      </PostWrapper>
      <Pagination totalPages={totalPages} currentPage={page} setPage={setPage} />
    </ScrapWrapper>
  );
}

const ScrapWrapper = styled.div`
  box-sizing: border-box;
  width: 100%;
  border-style: solid;
  border-width: 5px 0 0 5px;
  border-color: #EAEAEA;
  background-color: white;
  padding: 5px 49px;
`;

const ScrapDetailWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  .title {
    color: #969696;
    margin-right: 10px;
  }

  .length {
    color: #0E4D9D;
    margin-left: 10px;
  }
`;

const CountWrapper = styled.div`
  display: flex;
  align-items: center;
  font-size: 15px;
  font-weight: 600;
  line-height: 20px;
  letter-spacing: 0px;
`;

const BackSortWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const PostWrapper = styled.div`
  height: 400px;
  margin-top: 21px;
`;

const PostDetailWrapper = styled.div`
  border: 1px solid #AAC9EE;
  margin-bottom: 20px;
`;

const PostScrapItem = styled.div`
  display: flex;
  gap: 2px;
  background-color: white;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  .category {
    background-color: #a4c8e4;
    padding: 10px;
    margin: 10px;
    color: white;
    font-weight: 600;
    border-radius: 10px;
    font-size: 15px;
  }
  .title {
    padding: 10px 0 10px 10px;
    margin: 10px 0 10px 10px;
    color: black;
    font-size: 15px;
    font-size: 20px;
    font-weight: 600;
    line-height: 20px;
    letter-spacing: 0px;
    text-align: left;
    color: #656565;
    max-width: 500px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .close-title {
    font-size: 20px;
    font-weight: 600;
    line-height: 20px;
    letter-spacing: 0px;
    text-align: left;
    color: #656565;
  }
`;

const PostListWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const PostLink = styled(Link)`
  text-decoration: none;
  color: black;
  box-sizing: border-box;
`;

const FolderListDropDownWrapper = styled.div`
  position: relative;
`;

const FolderListDropDownBox = styled.div`
  display: flex;
  align-content: center;
  align-items: center;
  padding: 6px 9px;
  border: 0.5px solid #888888;
  border-radius: 5px;
  gap: 6px;

  span {
    font-size: 12px;
    font-weight: 600;
    line-height: 15px;
    letter-spacing: 0em;
    text-align: left;
  }
`;

const PostInfoWrapper = styled.div`
  display: flex;
  align-items: center;

  .createdate {
    font-size: 10px;
    font-weight: 500;
    line-height: 20px;
    letter-spacing: 0px;
    text-align: left;
    color: #969696;
    margin: 0 26px 0 3px;
  }

  .like {
    font-size: 8px;
    font-weight: 600;
    line-height: 20px;
    letter-spacing: 0px;
    text-align: left;
    margin: 0 26px 0 6px;
  }
`;

const RemoveButton = styled.div`
  span {
    font-size: 15px;
    color: #888888;
    margin-left: 5px;
  }
`;
