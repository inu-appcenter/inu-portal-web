import  { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';


import ScrapTitle from './ScrapTitle';

import getScrap from '../../../utils/getScrap';

import ScrapPost from './Scrapdetail';
import ScrapFolder from './ScrapFolder';
// import getFolder from '../../../utils/getFolder';
// import { addFolder } from '../../../reducer/folderSlice';


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
  scrapsort: string;
  page: number;
  setScrapSort: (sort: string) => void;
  setPage: (page: number) => void;
}




export default function ScrapInfo({ scrapsort, page, setScrapSort, setPage }: ScrapDocumentsProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [scrap,setIsScrap] = useState(true);
  // const [folderData, setFolderData] = useState<{ [key: number]: string }>({ 0: "내 폴더" });
  const token = useSelector((state: loginInfo) => state.user.token);

  // const dispatch = useDispatch();
  useEffect(() => {
    const fetchScrapInfo = async () => {
      try {
        const docs = await getScrap(token, scrapsort,page);
        setTotalPages(docs['pages']);
        setDocuments(docs['posts']);
      } catch (error) {
        console.error('에러가 발생했습니다.', error);
      }
    };
  
    fetchScrapInfo(); 
  }, [token, scrapsort,page]);

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
      </ScrapInfoWrapper>
       <ScrapFolder setIsScrap={setIsScrap} scrap={scrap}/>
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

