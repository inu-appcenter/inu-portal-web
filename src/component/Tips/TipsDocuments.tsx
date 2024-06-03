// TipsDocuments.tsx
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import getDocuments from '../../utils/getDocuments';
import search from '../../utils/search';
import { useLocation, useNavigate } from 'react-router-dom';
import './TipsDocuments.css';
import Heart from '../../resource/assets/heart.svg';
import queryString from 'query-string';
import Pagination from './Pagination';
import getNotices from '../../utils/Notices/getNotices';
import SortDropBox from '../common/SortDropBox';

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
  url: string;
}

interface TipsDocumentsProps {
  docState: DocState;
  setDocState: (docState: DocState) => void;
}

export default function TipsDocuments({ docState, setDocState }: TipsDocumentsProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [totalPages, setTotalPages] = useState<number>(1);

  const setSort = (sort: string) => {
    setDocState({ docType: docState.docType, selectedCategory: docState.selectedCategory, sort, page: docState.page });
  }

  const setPage = (page: string) => {
    setDocState({ docType: docState.docType, selectedCategory: docState.selectedCategory, sort: docState.sort, page });
  }

  useEffect(() => {
    const fetchDocuments = async () => {
      console.log('랜');
      if (docState.docType === 'NOTICE') {
        const docs = await getNotices(docState.selectedCategory, docState.sort, docState.page);
        setTotalPages(docs['pages']);
        setDocuments(docs['notices']);
      } else if (docState.docType === 'TIPS') {
        if (docState.selectedCategory == '검색결과') {
          const query = queryString.parse(location.search).query as string;
          const docs = await search(query, docState.sort, docState.page);
          setTotalPages(docs['pages']);
          setDocuments(docs['posts']);
        } else if (docState.selectedCategory) {
          const docs = await getDocuments(docState.selectedCategory, docState.sort, docState.page);
          setTotalPages(docs['pages']);
          setDocuments(docs['posts']);
        }
      }
    };

    fetchDocuments();
  }, [docState, location.search]);

  const handleDocumentClick = (id: number, url: string) => {
    if (docState.docType == 'NOTICE') {
      window.open('https://' + url, '_blank');
    } else {
      navigate(`/tips/${id}`);
    }
  };

  return (
    <TipsDocumentsWrapper>
      <div>
        {documents && (
          <div className='grid-container'>
            {documents.map((document) => (
              <div className='document-card' key={document.id} onClick={() => handleDocumentClick(document.id, document.url)}>
                <div className='card-1'>
                  <div className='document-category'>
                    <div className='category-text'>{document.category}</div>
                    <div className='category-underbar'></div>
                  </div>
                  {docState.docType == 'TIPS' ? (
                    <span className='document-like'>
                      <img src={Heart}></img>
                      <div className='like-num'>{document.like}</div>
                    </span>) : (<></>)}
                </div>
                {docState.docType == 'TIPS' ? (
                  <div className='card-2'>
                    <div className='document-title'>{document.title}</div>
                    <div className='document-content'>{document.content}</div>
                  </div>) : (
                  <div className='card-2'>
                    <div className='document-content'>{document.writer}</div>
                    <div className='document-title'>{document.title}</div>
                  </div>)}
                <div className='document-date'>{document.createDate}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className='bottom'>
        <div style={{ flexGrow: 1, alignSelf: 'center' }}><SortDropBox sort={docState.sort} setSort={setSort} /></div>
        <div style={{ flexGrow: 1, alignSelf: 'center' }}><Pagination totalPages={totalPages} currentPage={parseInt(docState.page)} setPage={setPage} /></div>
        <div style={{ flexGrow: 1 }} />
      </div>
    </TipsDocumentsWrapper>
  );
}

const TipsDocumentsWrapper = styled.div`
  flex-grow: 1;
`;
