import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import getFolder from '../../utils/getFolder';
import postInsertFolders from '../../utils/postinsertfolder';
import getFolderPost from '../../utils/getfolderpost';

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

export default function ScrapPost({postScrapInfo}:postinfoProps) {
  const [showDropdown, setShowDropdown] = useState<number | null>(null);
  const [folderData, setFolderData] = useState<{[key:number]:string}>({0: "내 폴더"});
  const token = useSelector((state: loginInfo) => state.user.token);
  const [selectedFolderIds, setSelectedFolderIds] = useState<number[]>([]); 
  const [folderPosts, setFolderPosts] = useState<PostInfo[]>([]);
  const folders = useSelector((state: any) => state.folder.folders);
  const [showType,setShowType] = useState<string[]>(['sort','like']);
  console.log("folders 뭐야뭐야",folders);
  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const response = await getFolder(token) as { id: number; name: string }[];
        const data:{ [key:number]:string} = {};
        response.forEach(item => {
            data[item.id] = item.name;
        })
        setFolderData(prevFolderData => ({ ...prevFolderData,...data}));

      } catch (error) {
        console.error("폴더 이름을 가져오지 못했습니다.", error);
      }
    };
    fetchFolders(); 
  }, [token]);

  useEffect(() => {
    const fetchFolderPosts = async () => {
      try {
          const newFolderPosts: PostInfo[] = [];
          for (const folderId in folderData) {
              const response = await getFolderPost(Number(folderId));
              newFolderPosts.push(...response);
          }
          setFolderPosts(newFolderPosts);
      } catch (error) {
          console.error("스크랩 폴더의 게시글을 가져오지 못했습니다.", error);
      }
    };
    fetchFolderPosts(); 
  }, [folderData]);

  const handleSearchTypeClick = (index: number) => {
    setShowDropdown(prevIndex => (prevIndex === index ? null : index));
  };

  const handleOptionClick = (folderId:number) => {
    if (!selectedFolderIds.includes(folderId)) {
      setSelectedFolderIds(prevIds => [...prevIds, folderId]);
    }
    setShowDropdown(null);
  };

  const handleAddClick = async (postId:number) => {
    try {
      const response = await postInsertFolders(postId, selectedFolderIds);
      console.log(response);
    } catch (error) {
      console.error("폴더에 추가하지 못했습니다.", error);
    }
  }

  return (
    <ScrapWrapper>
      <CountWrapper>
        <ScrapText>All scraps</ScrapText>
        <ScrapCount>{postScrapInfo.length}</ScrapCount>
      </CountWrapper>
      <DropDownWrapper>
        <ScrapText>All scraps</ScrapText>
        <ScrapCount>{postScrapInfo.length}</ScrapCount>
      </DropDownWrapper>
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
              {showDropdown === index && (
                <TipDropDowns className="dropdown-menu">
                   {Object.entries(folders).map(([folderId, folderName]) => (
                    <label key={folderId}>
                        <input type="checkbox" onClick={() => handleOptionClick(Number(folderId))} />
                        <TipDropDownDetail>{folderName as string}</TipDropDownDetail>
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
