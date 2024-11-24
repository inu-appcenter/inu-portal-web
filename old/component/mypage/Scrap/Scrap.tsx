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
import { getFolders, getFoldersPosts, postFolders } from '../../../utils/API/Folders';
import SearchScrapBar from './searchScrapBar';
import SearchFolderScrapBar from './searchFolderScrapBar';
import MakeModal from './ScrapFolderModal';

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
  const [total, setTotal] = useState<number>(0);
  const [isScrap, setIsScrap] = useState(true);
  const [folderData, setFolderData] = useState<{ [key: number]: string }>({ 0: "내 폴더" });
  const [isOpenModal, setOpenModal] = useState<boolean>(false);
  const currentId = useSelector((state: SearchInfo) => state.folderId.folderId);
  const { id } = useParams<{ id: string }>();
  const token = useSelector((state: loginInfo) => state.user.token);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchScrapInfo = async () => {
      if (isScrap) {
        if (selectedCategory === '스크랩') {
          try {
            const response = await getMembersScraps(token, scrapsort, page);
            const docs = response.body.data;
            setTotalPages(docs.pages);
            setTotal(docs.total);
            setDocuments(docs.posts);
          } catch (error) {
            console.error("스크랩 정보를 가져오지 못했습니다.", error);
          }
        } else if (selectedCategory === '검색결과') {
          const query = (queryString.parse(location.search).query as string) || '';
          const docs = await searchScrap(token, query, scrapsort, page);
          setTotalPages(docs.body.data.pages);
          setTotal(docs.body.data.total);
          setDocuments(docs.body.data.posts);
        } else if (selectedCategory === '폴더내검색결과') {
          const query = (queryString.parse(location.search).query as string) || '';
          if (currentId === 0) {
            const docs = await searchScrap(token, query, scrapsort, page);
            setTotalPages(docs.body.data.pages);
            setTotal(docs.body.data.total);
            setDocuments(docs.body.data.posts);
          } else {
            const docs = await searchFolder(token, currentId, query, scrapsort, page);
            setTotalPages(docs.body.data.pages);
            setTotal(docs.body.data.total);
            setDocuments(docs.body.data.posts);
          }
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
        if (Number(id) === 0) {
          const response = await getMembersScraps(token, scrapsort, page);
          setDocuments(response.body.data.posts);
          setTotalPages(response.body.data.pages);
          setTotal(response.body.data.total);
        } else {
          const response = await getFoldersPosts(token, Number(id), scrapsort, page);
          setDocuments(response.body.data.posts);
          setTotalPages(response.body.data.pages);
          setTotal(response.body.data.total);
        }
      };
      fetchPost();
    }
  }, [token, id, scrapsort, page]);

  const handleFolderClick = (folderId: number) => {
    dispatch(SearchFolderId({ folderId: folderId }));
    navigate(`/mypage/${folderId}`);
  };

  const handleMakeFolder = () => {
    setOpenModal(true);
  };

  const closeModal = () => {
    setOpenModal(false);
  };

  const handleFolderCreate = async (folderName: string) => {
    try {
      const response = await postFolders(token, folderName);
      if (response.status === 201) {
        const newFolderId = response.body.data;
        setFolderData({ ...folderData, [newFolderId]: folderName });
        dispatch(addFolder({ [newFolderId]: folderName }));
        console.log('폴더 생성 성공:', response.body);
      } else {
        console.error('폴더 생성 실패:', response.status);
      }
    } catch (error) {
      console.error("폴더를 생성하지 못했습니다.", error);
    }
  };

  return (
    <ScrapWrapper>
      <BackgrounWrapper>
        <ScrapInfoWrapper>
          <ScrapTitle />
          {id === undefined && <SearchScrapBar />}
          {id !== undefined && <SearchFolderScrapBar />}
        </ScrapInfoWrapper>
        <ScrapFolder
          folderData={folderData}
          handleFolderClick={handleFolderClick}
          setFolderData={setFolderData}
          setIsScrap={setIsScrap}
          onMakeFolder={handleMakeFolder}
        />
      </BackgrounWrapper>
      <ScrapPost
        selectedCategory={selectedCategory}
        setDocuments={setDocuments}
        documents={documents}
        totalPages={totalPages}
        total={total}
        scrapsort={scrapsort}
        page={page}
        setScrapSort={setScrapSort}
        setPage={setPage}
        handleCreateListClick={handleMakeFolder}
      />
      {isOpenModal && <MakeModal closeModal={closeModal} onChange={handleFolderCreate} />}
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
