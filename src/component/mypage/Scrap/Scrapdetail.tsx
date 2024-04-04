import styled from 'styled-components';
import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import postInsertFolders from '../../../utils/postinsertfolder';



import ListImg from "../../../resource/assets/list-logo.png";
import HeartImg from "../../../resource/assets/heart-logo.png"
import CalendarImg from "../../../resource/assets/bx_calendar.png"
import arrowImg from "../../../resource/assets/arrow.png"
import closeImg from "../../../resource/assets/close-img.png"
import fileImg from "../../../resource/assets/file-img.png"
import plusImg from "../../../resource/assets/plus-img.png"
import Pagination from './Pagination';
import SortDropBox from '../../common/SortDropBox';
import ReturnScrapButton from './ReturnButton';
import deleteFolderPost from '../../../utils/deleefolderpost';

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
  selectedCategory:string;
  documents: Document[];
  setDocuments:(document:Document[]) => void;
  totalPages:number;
  scrapsort: string;
  page: number;
  setScrapSort: (sort: string) => void;
  setPage: (page: number) => void;
}





export default function ScrapPost({selectedCategory,setDocuments,documents,totalPages,scrapsort,page,setScrapSort,setPage}:ScrapPostProps) {

  const token = useSelector((state: loginInfo) => state.user.token);
  const [selectedFolderIds, setSelectedFolderIds] = useState<number[]>([]); 
  const folders = useSelector((state: folderInfo) => state.folder.folders);
  const [showDropdown,setShowDropdown] = useState<number | null>(null);
  const { id } = useParams<{ id: string }>();


  const handleSearchTypeClick = (index: number) => {
    setShowDropdown(prevIndex => (prevIndex === index ? null : index));
  };

  const handleOptionClick = (folderId:number) => {
    if (!selectedFolderIds.includes(folderId)) {
      setSelectedFolderIds(prevIds => [...prevIds, folderId]);
    }
    setShowDropdown(null);
  };

  const hadleCloseModal = () => {
    setShowDropdown(null);
  }

  const handleAddClick = async (postId:number) => {
    try {
      console.log("넣기전",postId,selectedFolderIds);
      const response = await postInsertFolders(token,postId, selectedFolderIds);
      console.log(response);
      setSelectedFolderIds([]);
    } catch (error) {
      console.error("폴더에 추가하지 못했습니다.", error);
    }
  }

  const handleRemoveClick = async (postId:number) => {
    if(id !== undefined) {
      try {
        const response = await deleteFolderPost(token,postId, id);
        if(response === 200) {
          const filteredPostScrapFolderInfo = documents.filter(item => item.id !== postId);
          setDocuments(filteredPostScrapFolderInfo);
        }
      } catch (error) {
        console.error("폴더 이름을 가져오지 못했습니다.", error);
      }
    }
}

  return (
    <ScrapWrapper>
      <ScrapDetailWrapper>
          <CountWrapper>
            <p className='title'>All scraps</p>
            <p className='length'>{documents.length}</p>
          </CountWrapper>
          {selectedCategory === '폴더' && <ReturnScrapButton/> }
          <SortDropBox sort={scrapsort} setSort={setScrapSort} />
      </ScrapDetailWrapper>
      <PostWrapper>
        {documents.map((item,index) => (
          <PostDetailWrapper>
            <PostScrapItem  key={item.id}> 
              <PostLink to={`/tips/${item.id}`}>
                <PostScrapItem>
                  <p className='category'>{item.category}</p>
                  <p className='title'>{`[${item.title}]`}</p>
                </PostScrapItem>
              </PostLink>
              {selectedCategory === '폴더' && <TipDropDownBox onClick={() => handleRemoveClick(item.id)}>-</TipDropDownBox>}
              <PostListWrapper>
              <FolderListDropDownWrapper onClick={() => handleSearchTypeClick(index)}>
                <FolderListDropDownBox>
                    <img src={ListImg} className='list-img'/>
                    <span>List</span>
                  <img src={arrowImg} alt="" className='arrow-img' onClick={hadleCloseModal}/>
                </FolderListDropDownBox>
                {showDropdown === index && (
                  <FolderListDropDowns className="dropdown-menu">
                    <FolderListClose>
                      <div>
                      <img src={ListImg} className='list-img'/>
                      <span>List</span>
                      </div>
                      <img src={closeImg} className='close-img'/>
                    </FolderListClose>
                    <FolderListDetail>
                    {Object.entries(folders).map(([folderId, folderName]) => (
                      <label key={folderId}>
                          <input type="checkbox" onClick={() => handleOptionClick(Number(folderId))} />
                          <img src={fileImg} alt="" />
                          <FolderListDropDownDetail>{folderName as string}</FolderListDropDownDetail>
                      </label>
                  ))}
                     </FolderListDetail>
                    <FolderListButton>
                      <img src={plusImg} alt="" />
                      <button onClick={() => handleAddClick(item.id)}>Create list</button>
                    </FolderListButton>
                  </FolderListDropDowns>
                )}
              </FolderListDropDownWrapper>
              <PostInfoWrapper>
                <img src={CalendarImg} alt="" className='calender-image'/>
                <p className='createdate'>{item.createDate}</p>
                <img src={HeartImg} alt="" className='heart-image'/>
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
  box-sizing:border-box;
  width:100%;
  border-style: solid;
  border-width: 5px 0 0 5px;
  border-color: #EAEAEA;
  background-color:white;
  padding:5px 49px;
`;

const ScrapDetailWrapper = styled.div`
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
  justify-content: space-between;
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
font-size: 15px;

font-family: Inter;
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
gap:16px;
`

const PostLink = styled(Link)`
    text-decoration:none;
  color:black;
  box-sizing: border-box;
`;

const FolderListDropDownWrapper = styled.div`

  position: relative;


`;

const FolderListDropDownBox = styled.div`
display: flex;
align-content: center;
align-items: center;
padding:6px 9px;
border: 0.5px solid #888888;
border-radius:5px;
gap:6px;



span {
  font-family: Inter;
font-size: 12px;
font-weight: 600;
line-height: 15px;
letter-spacing: 0em;
text-align: left;

}
`;

const FolderListDropDowns = styled.div`
  z-index: 1000;
  position: absolute;
  left:0;
  right:0;
  top:30px;

  width: 207px;
border-radius: 5px;   

border: 0.5px solid #969696;
background-color: white;
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
  padding:7px 8px;
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
      font-family: Inter;
      font-size: 10px;
      font-weight: 500;
      line-height: 20px;
      letter-spacing: 0px;
      text-align: left;

  }
`

const FolderListDropDownDetail = styled.div`
 
  font-size: 10px;
  font-weight: 800;
  color: #656565;

  
`;

const FolderListDetail = styled.div`
  padding: 11px;

`

const FolderListButton = styled.div`
  display: flex;
  align-items: center;
  border-top: 0.5px solid #969696;
  padding:5px 9px;

  button {
    background-color: white;
    color:black;
    margin:0;
    font-family: Inter;
font-size: 10px;
font-weight: 500;
line-height: 20px;
letter-spacing: 0px;
text-align: left;

  }

  img {

  }
`
const PostInfoWrapper = styled.div`
display:flex;
align-items: center;

.createdate {
  font-family: Inter;
font-size: 10px;
font-weight: 500;
line-height: 20px;
letter-spacing: 0px;
text-align: left;
color: #969696;
margin: 0 26px 0 3px;
}

.like {
  font-family: Inter;
font-size: 8px;
font-weight: 600;
line-height: 20px;
letter-spacing: 0px;
text-align: left;
margin: 0 26px 0 6px;
}
`


const TipDropDownBox = styled.div`
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0em;

  font-size: 50px;
  line-height: 30px;
  color:gray;
`;