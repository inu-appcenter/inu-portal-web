import { useState, useEffect } from 'react';
import styled from 'styled-components';
import getDocuments from '../../utils/getDocuments';
import search from '../../utils/search';
import { useLocation, useNavigate } from 'react-router-dom';
import './TipsDocuments.css'
import Heart from '../../resource/assets/heart.png';
import queryString from 'query-string';
import Pagination from './Pagination';

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

interface TipsDocumentsProps {
  selectedCategory: string;
  sort: string;
  page: string;
  setSort: (sort: string) => void;
  setPage: (page: string) => void;
}

export default function TipsDocuments({ selectedCategory, sort, page, setSort, setPage }: TipsDocumentsProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [totalPages, setTotalPages] = useState<number>(1);
  useEffect(() => {
    console.log('UseEffect', selectedCategory);
    const fetchDocuments = async () => {
      if (selectedCategory == '검색결과') {
        const query = queryString.parse(location.search).query;
        console.log('query sort page : ', query, sort, page);
        const docs = await search(query, sort, page);
        setDocuments(docs['posts']);
        setTotalPages(docs['pages']);
      }
      else if (selectedCategory) {
        console.log('sort page : ', sort, page);
        const docs = await getDocuments(selectedCategory, sort, page);
        setTotalPages(docs['pages']);
        setDocuments(docs['posts']);
      }
    };

    fetchDocuments();
  }, [selectedCategory, location.search, sort, page]);

  const handleDocumentClick = (id: number) => {
    navigate(`/tips/${id}`);
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
              <div className='document-card' key={document.id} onClick={() => handleDocumentClick(document.id)}>
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
