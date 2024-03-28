import React, { useEffect, useState } from 'react'; // React import 추가
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import deleteFolderPost from '../../../utils/deleefolderpost';
import { useSelector } from 'react-redux';
import Pagination from './Pagination';
import ReturnScrapButton from './ReturnButton';


interface Document{
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

interface ScrapFolderPostProps {
  postScrapFolderInfo: Document[];
  folderId: number | undefined;
  totalPages:number;
  postsort: string;
  page: number;
  setPostSort: (sort: string) => void;
  setPage: (page: number) => void;
  setIsScrap:(scrap:boolean) => void;
  setIsScrapFolderPost: (scrapfolder:boolean) => void;
  setIsSearch:(search:boolean) => void;
}



interface loginInfo {
  user: {
    token: string;
  };
}

export const ScrapFolderPost: React.FC<ScrapFolderPostProps> = ({ postScrapFolderInfo, folderId,totalPages,postsort,page,setPostSort,setPage,setIsScrap,setIsScrapFolderPost,setIsSearch }) => { 
  const [updatedPostScrapFolderInfo, setUpdatedPostScrapFolderInfo] = useState<Document[]>(postScrapFolderInfo);
  const token = useSelector((state: loginInfo) => state.user.token);
  useEffect(() => {
    setUpdatedPostScrapFolderInfo(postScrapFolderInfo);
  }, [postScrapFolderInfo]);

  
  const handleRemoveClick = async (postId:number) => {
    if(folderId !== undefined) {
      try {
        const response = await deleteFolderPost(token,postId, folderId);
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
    <FolderWrapper>
      <FolderDetailWrapper>
      <CountWrapper>
            <p className='title'>All scraps</p>
            <p className='length'>{updatedPostScrapFolderInfo.length}</p>
          </CountWrapper>
          <ReturnScrapButton setIsScrap={setIsScrap} setIsScrapFolderPost={setIsScrapFolderPost} setIsSearch={setIsSearch}/>
                <DropBoxWrapper>
                <span className='title'>sort by</span>
                <div className='SortDropdown'>
                  <div className='dropdown'>
                    <button className='dropbtn'>{postsort === 'date' ? 'date' : 'like'}</button>
                    <div className='dropdown-content'>
                      <span onClick={() => setPostSort('date')}>date</span>
                      <span onClick={() => setPostSort('like')}>like</span>
                    </div>
                  </div>
                </div>
        </DropBoxWrapper>
        </FolderDetailWrapper>
      <PostWrapper>
        {updatedPostScrapFolderInfo.map((item) => (
          <PostDetailWrapper>
          <PostScrapItem  key={item.id}> 
            <PostLink to={`/tips/${item.id}`}>
              <PostScrapItem>
                <p className='category'>{item.category}</p>
                <p className='title'>{item.title}</p>
              </PostScrapItem>
            </PostLink>
            <TipDropDownBox onClick={() => handleRemoveClick(item.id)}>-</TipDropDownBox>
          </PostScrapItem>
          </PostDetailWrapper>
        ))}
      </PostWrapper>
      <Pagination totalPages={totalPages} currentPage={page} setPage={setPage} />
    </FolderWrapper>
  );
};



const FolderWrapper = styled.div`
  box-sizing: border-box;
    width: 100%;
    border-style: solid;
    border-width: 5px 0 0 5px;
    border-color: #EAEAEA;
    background-color: white;
    padding: 5px 49px;
`;
const FolderDetailWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  .title {
    color: #969696;
    margin-right:10px;
  }

  .length {
    color: #0E4D9D;
    margin-left:10px;
  }
`


const DropBoxWrapper = styled.div`
    display: flex;

  align-items: center;
  font-family: Inter;
  font-size: 15px;
  font-weight: 600;
  line-height: 20px;
  letter-spacing: 0px;


  .dropdown .dropbtn{
    background-color:white;
    font-family: Inter;
  font-size: 15px;
  font-weight: 600;
  line-height: 20px;
  letter-spacing: 0px;
  text-align: left;
  color: #0E4D9D;
  border:none;

  }

  .dropdown .dropdown-content span {
    background-color:white;
    font-family: Inter;
  font-size: 15px;
  font-weight: 600;
  line-height: 20px;
  letter-spacing: 0px;
  text-align: left;
  color: #0E4D9D;
  border:none;
}
`

const CountWrapper = styled.div`
  display: flex;

  align-items: center;
  font-family: Inter;
font-size: 15px;
font-weight: 600;
line-height: 20px;
letter-spacing: 0px;


`;


const PostWrapper = styled.div`
  height: 400px;
  margin-top: 21px;
`
const PostDetailWrapper = styled.div`
border:1px solid #AAC9EE;
margin-bottom: 20px;
`
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