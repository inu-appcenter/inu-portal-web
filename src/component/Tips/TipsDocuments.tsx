import { useState, useEffect } from 'react';
import styled from 'styled-components';
import getDocuments from '../../utils/getDocuments';
import { useNavigate } from 'react-router-dom';
import './TipsDocuments.css'
import Heart from '../../resource/assets/heart.png';

interface Document {
  id: number;
  title: string;
  category: string;
  writer: string;
  like: number;
  scrap: number;
  createDate: string;
  modifiedDate: string;
}

interface TipsDocumentsProps {
  selectedCategory: string;
}

export default function TipsDocuments({ selectedCategory }: TipsDocumentsProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDocuments = async () => {
      const docs = await getDocuments(selectedCategory);
      setDocuments(docs);
    };

    fetchDocuments();
  }, [selectedCategory]);

  const handleDocumentClick = (id: number) => {
    navigate(`/tips/${id}`);
  };

  return (
    <TipsDocumentsWrapper>
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
              <div className='document-content'>api/posts/all에서 내용을 가져와야합니다 내용이 전체가 아니라도 앞부분만이라도 잘라서 가져와야 할 듯 합니다api/posts/all에서 내용을 가져와야합니다 내용이 전체가 아니라도 앞부분만이라도 잘라서 가져와야 할 듯 합니다api/posts/all에서 내용을 가져와야합니다 내용이 전체가 아니라도 앞부분만이라도 잘라서 가져와야 할 듯 합니다</div>
              <div className='document-date'>{document.createDate}</div>
            </div>
        ))}
      </div>
    </TipsDocumentsWrapper>
  );
}

const TipsDocumentsWrapper = styled.div`
  flex-grow: 1;
  padding: 20px;
`;
