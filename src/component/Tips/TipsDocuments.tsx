import { useState, useEffect } from 'react';
import styled from 'styled-components';
import getDocuments from '../../utils/getDocuments';
import search from '../../utils/search';
import { useLocation, useNavigate } from 'react-router-dom';
import './TipsDocuments.css'
import Heart from '../../resource/assets/heart.png';
import queryString from 'query-string';  
import Pagination from './Pagination';
import getNotices from '../../utils/getNotices';

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
  docType: string;
  selectedCategory: string;
  sort: string;
  page: string;
  setSort: (sort: string) => void;
  setPage: (page: string) => void;
}

export default function TipsDocuments({ docType, selectedCategory, sort, page, setSort, setPage }: TipsDocumentsProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [totalPages, setTotalPages] = useState<number>(1);
  useEffect(() => {
    const fetchDocuments = async () => {
      if (docType === 'NOTICE') {
        const docs = await getNotices(selectedCategory, sort, page);
        setTotalPages(docs['pages']);
        setDocuments(docs['notices']);
      }
      else if (docType === 'TIPS') {
        if (selectedCategory == '검색결과') {
          const query = queryString.parse(location.search).query;
          const docs = await search(query, sort, page);
          setTotalPages(docs['pages']);
          setDocuments(docs['posts']);
        }
        else if (selectedCategory) {
          const docs = await getDocuments(selectedCategory, sort, page);
          setTotalPages(docs['pages']);
          setDocuments(docs['posts']);
        }
      }
    };

    fetchDocuments();
  }, [docType, selectedCategory, location.search, sort, page]);

  const handleDocumentClick = (id: number, url: string) => {
    if (docType == 'NOTICE') {
      window.open('https://'+ url, '_blank');
    }
    else {
      navigate(`/tips/${id}`);
    }
  };

  return (
    <TipsDocumentsWrapper>
      <div>
        <span className='SortDropdown'>
          <span className='dropdown'>
            <button className='dropbtn'>{sort === 'date' ? '최신순' : '인기순'}</button>
            <span className='dropdown-content'>
              <span onClick={() => setSort('date')}>최신순</span>
              <span onClick={() => setSort('like')}>인기순</span>
            </span>
          </span>
        </span>
        {documents && (
          <div className='grid-container'>
          {documents.map((document) => (
              <div className='document-card' key={document.id} onClick={() => handleDocumentClick(document.id, document.url)}>
                <div className='card-1'>
                  <div className='document-category'>
                    <div className='category-text'>{document.category}</div>
                    <div className='category-underbar'></div>
                  </div>
                  <span className='document-like'>
                    <img src={Heart}></img>
                    <div className='like-num'>{document.like}</div>
                  </span>
                </div>
                <h3>{document.title}</h3>
                <div className='document-content'>{document.content}</div>
                <div className='document-date'>{document.createDate}</div>
              </div>
          ))}
          </div>
        )}
      </div>
      <Pagination totalPages={totalPages} currentPage={parseInt(page)} setPage={setPage} />
    </TipsDocumentsWrapper>
  );
}

const TipsDocumentsWrapper = styled.div`
  flex-grow: 1;

`;
