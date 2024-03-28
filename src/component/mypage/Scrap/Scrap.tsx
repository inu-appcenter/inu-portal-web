import  { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';


import ScrapTitle from './ScrapTitle';

import getScrap from '../../../utils/getScrap';

import ScrapPost from './Scrapdetail';
import ScrapFolder from './ScrapFolder';
import queryString from 'query-string';
import scrapsearch from '../../../utils/scrapsearch';
import { useLocation } from 'react-router-dom'; 


interface loginInfo {
    user: {
      token: string;
    };
  }

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

interface ScrapDocumentsProps {
  selectedCategory:string;
  scrapsort: string;
  page: number;
  setScrapSort: (sort: string) => void;
  setPage: (page: number) => void;
}




export default function ScrapInfo({ selectedCategory,scrapsort, page, setScrapSort, setPage }: ScrapDocumentsProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [scrap,setIsScrap] = useState(true);
  // const [folderData, setFolderData] = useState<{ [key: number]: string }>({ 0: "내 폴더" });
  const token = useSelector((state: loginInfo) => state.user.token);
  const location = useLocation(); 
  // const dispatch = useDispatch();
  useEffect(() => {
    console.log('selectedCategory', location);
    const fetchScrapInfo = async () => {
      if (selectedCategory === '검색결과') {
        const query = queryString.parse(location.search).query;
        console.log('query sort page : ', query, scrapsort, page);
        const docs = await scrapsearch(token,query, scrapsort, page);
        setTotalPages(docs['pages']);
        setDocuments(docs['posts']);
      }
      else {
        const docs = await getScrap(token, scrapsort,page);
        console.log(docs,"어케되있노");
        setTotalPages(docs['pages']);
        setDocuments(docs['posts']);
      }
     
        // const docs = await getScrap(token, scrapsort,page);
        // setTotalPages(docs['pages']);
        // setDocuments(docs['posts']);
    };
  
    fetchScrapInfo(); 
  }, [token,selectedCategory,location.search, scrapsort,page]);


//   useEffect(() => {
//     const fetchFolders = async () => {
//         console.log("음음");
//         try {
//             const response = await getFolder(token) as { id: number; name: string }[];
//             const data: { [key: number]: string } = {};
//             response.forEach(item => {
//                 data[item.id] = item.name;
//             });
//             console.log("data형태",data);
//             setFolderData(prevFolderData => ({ ...prevFolderData, ...data }));
//             dispatch(addFolder(data));
//         } catch (error) {
//             console.error("폴더 이름을 가져오지 못했습니다.", error);
//         }
//     };
//     fetchFolders();
// }, [token]);


  return (
    <ScrapWrapper>
      <ScrapInfoWrapper>
        <ScrapTitle/>
        <ScrapFolder setIsScrap={setIsScrap} scrap={scrap}/>
      </ScrapInfoWrapper>
      {scrap && 
      <ScrapPost documents={documents} totalPages={totalPages} scrapsort={scrapsort} page={page} setScrapSort={setScrapSort} setPage={setPage}/>}

    </ScrapWrapper>
  );
}

const ScrapWrapper = styled.div`

  flex-grow: 1;
  
`

const ScrapInfoWrapper = styled.div`
  padding:19px 77px;
`

