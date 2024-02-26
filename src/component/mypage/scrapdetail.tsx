// import  { useState, useEffect } from 'react';
import styled from 'styled-components';

import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

import { useSelector } from 'react-redux';
import getFolder from '../../utils/getFolder';
import postInsertFolders from '../../utils/postinsertfolder';
import getFolderPost from '../../utils/getfolderpost';
// import postInsertFolders from '../../utils/postindertfolder';


interface loginInfo {
  user: {
    token: string;
  };
}

interface postinfoProps {
    postScrapInfo: {
        id:number;
        title: string;
        category: string;
    }[];
}

interface PostInfo {
  id: number;
  title: string;
  category: string;
}

type FolderName = string;
export default function ScrapPost({postScrapInfo}:postinfoProps) {
  const [showDropdown, setShowDropdown] = useState<number | null>(null);
  const [folders, setFolders] = useState<FolderName[]>(["내 폴더"]);
  const [folderId, setFolderId] = useState<number[]>([0]);
  const token = useSelector((state: loginInfo) => state.user.token);
  const [selectedFolderIds, setSelectedFolderIds] = useState<number[]>([]); 
  const [folderPosts, setFolderPosts] = useState<PostInfo[]>([]);

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const response = await getFolder(token);
        const names = (Object.values(response) as { name: string }[]).map(item => item.name);
        const folderId = (Object.values(response) as { id: number }[]).map(item => item.id);

        setFolderId(prevFolderId => [...prevFolderId,...folderId]);
        setFolders(prevFolders => [...prevFolders, ...names]);
      } catch (error) {
        console.error("폴더 이름을 가져오지 못했습니다.", error);
      }
    };

    fetchFolders(); 
  }, [token]);

  useEffect(() => {
    const fetchFolderPosts = async () => {
        try {
            // const newFolderPosts: ScrapFolderPostProps[] = [];
            console.log(folderId,"시작전이구");
            for (let id = 1; id < folderId.length; id++) {
                const response = await getFolderPost(folderId[id]) as PostInfo[];
                console.log(response,"결과가 뭔데?");
                // const scrapFolderPost: ScrapFolderPostProps = { postScrapFolderInfo: response };
                // newFolderPosts.push(scrapFolderPost);
                setFolderPosts(response);
            }
            // setFolderPosts(prevPosts => [...prevPosts, ...newFolderPosts]);
            console.log(folderPosts,"처음 렌더링할때 뭐가 있니?")
        } catch (error) {
            console.error("스크랩 폴더의 게시글을 가져오지 못했습니다.", error);
        }
    };

    fetchFolderPosts(); 
}, [folderId]);

  const handleSearchTypeClick = (index: number) => {
    setShowDropdown(prevIndex => (prevIndex === index ? null : index));
};

  const handleOptionClick = (idx:number) => {
    const selectedFolderId = folderId[idx]; 
    if (!selectedFolderIds.includes(selectedFolderId)) {
      setSelectedFolderIds(prevIds => [...prevIds, selectedFolderId]);
    }
  setShowDropdown(null);


  };
  const handleAddClick = async (postId:number) => {
    console.log(selectedFolderIds);
    console.log("postId는",postId);
    try {
      const response = await postInsertFolders(postId,selectedFolderIds);

      console.log(response);
  } catch (error) {
      console.error("폴더 이름을 가져오지 못했습니다.", error);
  }
  }
  return (
    <ScrapWrapper>
      <CountWrapper>
        <ScrapText>All scraps</ScrapText>
        <ScrapCount>{postScrapInfo.length}</ScrapCount>
      </CountWrapper>
      <Items>
        {postScrapInfo.map((item,index) => (
          <PostScrapItem  key={item.id}> 
            <PostLink to={`/tips/${item.id}`}>
              <PostScrapItem>
                <p className='category'>{item.category}</p>
                <p className='title'>{item.title}</p>
              </PostScrapItem>
            </PostLink>
            <TipDropDownWrapper onClick={() => handleSearchTypeClick(index)}>
            <TipDropDownBox>+</TipDropDownBox>
            {showDropdown == index && (
              <TipDropDowns className="dropdown-menu">
                {folders.map((type,idx) => (
                  <label>
                  <input type="checkbox" onClick={() => handleOptionClick(idx)}>
                  </input>
                  <TipDropDownDetail>{type}</TipDropDownDetail>
                  </label>
                ))}
                 <button onClick={() => handleAddClick(item.id)}>추가</button>
              </TipDropDowns>
              
            )}
            </TipDropDownWrapper>
          </PostScrapItem>
        ))}
      </Items>
    </ScrapWrapper>
  );
}

const ScrapWrapper = styled.div`

`;

const CountWrapper = styled.div`
  display: flex;
  margin-top: 26px;
  align-items: center;
  font-family: Inter;
font-size: 15px;
font-weight: 600;
line-height: 20px;
letter-spacing: 0px;
width: 100%;
`
const ScrapText = styled.p`
color: #969696;


`;

const ScrapCount = styled.p`
color: #0E4D9D;
margin-left:10px;
`;

const Items = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  /* max-height: 150px; 
  overflow-y: auto;  */
`;

const PostScrapItem = styled.div`
  display: flex;
  gap:2px;
  background-color:white;
  justify-content: space-between;
  .category {
    background-color: #a4c8e4; 
    padding:10px;
    margin:10px;
    color:white;
    font-weight: 600;
    border-radius: 10px;
  }
  .title {
    padding:10px;
    margin:10px;
    color:black;
    font-weight: 600;
    border-radius: 10px;
  }

`;

const PostLink = styled(Link)`
    text-decoration:none;
  color:black;
  box-sizing: border-box;
`;

const TipDropDownWrapper = styled.div`
  width: 150px;
  height: 30px;
  display: flex;
  padding: 10px;
  box-sizing: border-box;
  justify-content: space-between;
  position: relative;
  background: white;

`;

const TipDropDownBox = styled.div`
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0em;

  font-size: 50px;
  line-height: 30px;
  color:gray;
`;

const TipDropDowns = styled.div`
  z-index: 3000;
  position: absolute;
  left:0;
  right:0;
  top:30px;
  background-color: black;
border-radius: 10px;
color:white;
  padding:20px;
  button {
    background-color: black;
    color:white;
    display: block;
    margin:0 auto;
    text-align: center;
    border: none;
  }

  label {
    display: flex;
  }
`;

const TipDropDownDetail = styled.div`
  width: 81px;
  height: 30px;
  font-size: 10px;
  font-weight: 800;
  line-height: 12px;
  letter-spacing: 0em;
  text-align: center;
  padding:10px;
  box-sizing: border-box;
  
`;
