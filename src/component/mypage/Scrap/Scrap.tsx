import  { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';


import ScrapTitle from './ScrapTitle';

import getScrap from '../../../utils/getScrap';

import ScrapPost from './Scrapdetail';
import ScrapFolder from './ScrapFolder';



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
  page: string;
  setScrapSort: (sort: string) => void;
  setPage: (page: string) => void;
}




export default function ScrapInfo({ scrapsort, page, setScrapSort, setPage }: ScrapDocumentsProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isscrap,setIsScrap] = useState(true);
  const [isscrapfolderpost,setIsScrapFolderPost] = useState(false);
  const token = useSelector((state: loginInfo) => state.user.token);


  useEffect(() => {
    const fetchScrapInfo = async () => {
      try {
        const docs = await getScrap(token, scrapsort,page);
        setTotalPages(docs['pages']);
        setDocuments(docs['posts']);
      } catch (error) {
        console.error('에러가 발생했습니다.', error);
        // alert('게시에 실패하였습니다.');
      }
    };
  
    fetchScrapInfo(); 
  }, [token, scrapsort,page]);



  return (
    <ScrapWrapper>
      <ScrapInfoWrapper>
        <ScrapTitle/>
      </ScrapInfoWrapper>
              <ScrapFolder />
      {isscrap && 
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
