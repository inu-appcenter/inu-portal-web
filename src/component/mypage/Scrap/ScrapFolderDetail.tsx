import React, { useEffect, useState } from 'react'; // React import 추가
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import deleteFolderPost from '../../../utils/deleefolderpost';

interface PostInfo {
  id: number;
  title: string;
  category: string;
}

interface ScrapFolderPostProps {
  postScrapFolderInfo: PostInfo[];
  folderId: number | undefined;
}

export const ScrapFolderPost: React.FC<ScrapFolderPostProps> = ({ postScrapFolderInfo, folderId }) => { 
  const [updatedPostScrapFolderInfo, setUpdatedPostScrapFolderInfo] = useState<PostInfo[]>(postScrapFolderInfo);
  useEffect(() => {
    setUpdatedPostScrapFolderInfo(postScrapFolderInfo);
  }, [postScrapFolderInfo]);

  
  const handleRemoveClick = async (postId:number) => {
    if(folderId !== undefined) {
      try {
        const response = await deleteFolderPost(postId, folderId);
        if(response === 200) {
          const filteredPostScrapFolderInfo = updatedPostScrapFolderInfo.filter(item => item.id !== postId);
          setUpdatedPostScrapFolderInfo(filteredPostScrapFolderInfo);
        }
      } catch (error) {
        console.error("폴더 이름을 가져오지 못했습니다.", error);
      }
    }
  }

  return (
    <ScrapWrapper>
      {updatedPostScrapFolderInfo.length !== 0 &&
      <CountWrapper>
        <ScrapText>All scraps</ScrapText>
        <ScrapCount>{updatedPostScrapFolderInfo.length}</ScrapCount>
      </CountWrapper>}
      <Items>
        {updatedPostScrapFolderInfo.map((item) => (
          <PostScrapItem  key={item.id}> 
            <PostLink to={`/tips/${item.id}`}>
              <PostScrapItem>
                <p className='category'>{item.category}</p>
                <p className='title'>{item.title}</p>
              </PostScrapItem>
            </PostLink>
            <TipDropDownBox onClick={() => handleRemoveClick(item.id)}>-</TipDropDownBox>
          </PostScrapItem>
        ))}
      </Items>
    </ScrapWrapper>
  );
};



const ScrapWrapper = styled.div`
  width: 100%;
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
  max-height: 150px; 
  overflow-y: auto; 
`;

const PostScrapItem = styled.div`
  display: flex;
  gap:2px;
  background-color:white;
  align-items: center;
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


const TipDropDownBox = styled.div`
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0em;

  font-size: 50px;
  line-height: 30px;
  color:gray;
`;