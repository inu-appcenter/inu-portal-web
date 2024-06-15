import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';

import ScrapTitle from './ScrapTitle';
import { getMembersScraps } from '../../../utils/API/Members';
import ScrapPost from './Scrapdetail';
import ScrapFolder from './ScrapFolder';
import queryString from 'query-string';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { searchScrap, searchFolder } from '../../../utils/API/Search';
import { SearchFolderId } from '../../../reducer/folderId';
import { addFolder } from '../../../reducer/folderSlice';
import { getFolders, getFoldersPosts } from '../../../utils/API/Folders';
import SearchScrapBar from './searchScrapBar';
import SearchFolderScrapBar from './searchFolderScrapBar';

interface loginInfo {
  user: {
    token: string;
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

interface ScrapDocumentsProps {
  selectedCategory: string;
  scrapsort: string;
  page: number;
  setScrapSort: (sort: string) => void;
  setPage: (page: number) => void;
}

interface SearchInfo {
  folderId: {
    folderId: number;
  };
}

export default function ScrapInfo({ selectedCategory, scrapsort, page, setScrapSort, setPage }: ScrapDocumentsProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isScrap, setIsScrap] = useState(true);
  const [folderData, setFolderData] = useState<{ [key: number]: string }>({ 0: "내 폴더" });
  const [isFolderScrap, setIsFolderScrap] = useState(false);
  const currentId = useSelector((state: SearchInfo) => state.folderId.folderId);
  const { id } = useParams<{ id: string }>();
  const token = useSelector((state: loginInfo) => state.user.token);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchScrapInfo = async () => {
      console.log("지금 여기온거맞니1?", isFolderScrap);
      if (isScrap) {
        if (selectedCategory === '스크랩') {
          try {
            console.log(location, "gmgmgm");
            const response = await getMembersScraps(token, scrapsort, page);
            const docs = response.body.data;
            console.log(docs, "어케되있노");
            setTotalPages(docs.pages);
            setDocuments(docs.posts);
          } catch (error) {
            console.error("스크랩 정보를 가져오지 못했습니다.", error);
          }
        } else if (selectedCategory === '검색결과') {
          console.log("여기로 온거야", selectedCategory);
          const query = (queryString.parse(location.search).query as string) || '';
          console.log('query sort page : ', query, scrapsort, page);
          const docs = await searchScrap(token, query, scrapsort, page);
          console.log(docs, "결과는>>");
          setTotalPages(docs.body.data.pages);
          setDocuments(docs.body.data.posts);
        } else if (selectedCategory === '폴더내검색결과') {
          console.log("여기여기여기");
          const query = (queryString.parse(location.search).query as string) || '';
          console.log('query sort page : ', query, scrapsort, page);
          const docs = await searchFolder(token, currentId, query, scrapsort, page);
          setTotalPages(docs.body.data.pages);
          setDocuments(docs.body.data.posts);
        }
      }
    };
    fetchScrapInfo();
  }, [token, isScrap, scrapsort, page, queryString.parse(location.search).query]);

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const response = await getFolders(token);
        const data = response.body.data as { id: number; name: string }[];
        const folderData: { [key: number]: string } = {};
        data.forEach(item => {
          folderData[item.id] = item.name;
        });
        console.log("data형태", folderData);
        setFolderData(prevFolderData => ({ ...prevFolderData, ...folderData }));
        dispatch(addFolder(folderData));
      } catch (error) {
        console.error("폴더 이름을 가져오지 못했습니다.", error);
      }
    };
    fetchFolders();
  }, [token]);

  useEffect(() => {
    if (id) {
      const fetchPost = async () => {
        const response = await getFoldersPosts(token, Number(id), scrapsort, page);
        setDocuments(response.body.data.posts);
        setTotalPages(response.body.data.pages);
      };
      fetchPost();
    }
  }, [token, id, scrapsort, page]);

  const handleFolderClick = (folderId: number) => {
    dispatch(SearchFolderId({ folderId: folderId }));
    navigate(`/mypage/${folderId}`);
  };

  return (
    <ScrapWrapper>
      <BackgrounWrapper>
        <ScrapInfoWrapper>
          <ScrapTitle />
          {id === undefined && <SearchScrapBar />}
          {id !== undefined && <SearchFolderScrapBar />}
        </ScrapInfoWrapper>
        <ScrapFolder folderData={folderData} handleFolderClick={handleFolderClick} setFolderData={setFolderData} setIsScrap={setIsScrap} setIsFolderScrap={setIsFolderScrap} />
      </BackgrounWrapper>
      <ScrapPost selectedCategory={selectedCategory} setDocuments={setDocuments} documents={documents} totalPages={totalPages} scrapsort={scrapsort} page={page} setScrapSort={setScrapSort} setPage={setPage} />
    </ScrapWrapper>
  );
}

const ScrapWrapper = styled.div`
  flex-grow: 1;
`;

const BackgrounWrapper = styled.div`
  background: #DBEBFF;
`;

const ScrapInfoWrapper = styled.div`
  padding: 19px 77px;
`;
