import { useState, useEffect } from 'react';
import styled from 'styled-components';
import getDocuments from '../../utils/getDocuments';
import search from '../../utils/search';
import { useLocation, useNavigate } from 'react-router-dom';
import './TipsDocuments.css'
import Heart from '../../resource/assets/heart.png';
import queryString from 'query-string';

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
  sortParam?: string;
  pageParam?: string;
}

export default function TipsDocuments({ selectedCategory, sortParam, pageParam }: TipsDocumentsProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [sort, setSort] = useState<string>(sortParam || 'date');
  const [page, setPage] = useState<string>(pageParam || '1')

  useEffect(() => {
    console.log('UseEffect', selectedCategory);
    const fetchDocuments = async () => {
      if (selectedCategory == '검색결과') {
        const query = queryString.parse(location.search).query;
        console.log('query sort page : ', query, sort, page);
        const docs = await search(query, sort, page);
        setDocuments(docs);
      }
      else if (selectedCategory) {
        console.log('sort page : ', sort, page);
        const docs = await getDocuments(selectedCategory, sort, page);
        setDocuments(docs);
      }
    };

    fetchDocuments();
  }, [selectedCategory, sort, page]);

  const handleDocumentClick = (id: number) => {
    navigate(`/tips/${id}`);
  };

  return (
    <TipsDocumentsWrapper>
      <div>
        <div className='SortDropdown'>
          <div className='dropdown'>
            <button className='dropbtn'>{sort === 'date' ? '최신순' : '인기순'}</button>
            <div className='dropdown-content'>
              <span onClick={() => setSort('date')}>최신순</span>
              <span onClick={() => setSort('like')}>인기순</span>
            </div>
          </div>
        </div>
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
    </TipsDocumentsWrapper>
  );
}

const TipsDocumentsWrapper = styled.div`
  flex-grow: 1;

`;
