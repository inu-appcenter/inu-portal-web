import { useState, useEffect } from 'react';
import styled from 'styled-components';
import TipsTitle from './TipsTitle';
import getDocuments from '../../utils/getDocuments';
import { useNavigate } from 'react-router-dom';

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
      <TipsTitle selectedCategory={selectedCategory} />
      <Table>
        <thead>
          <tr>
            <th>제목</th>
            <th>작성자</th>
            <th>좋아요</th>
            <th>스크랩</th>
            <th>작성일</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((document) => (
            <tr key={document.id} onClick={() => handleDocumentClick(document.id)}>
              <td>{document.title}</td>
              <td>{document.writer}</td>
              <td>{document.like}</td>
              <td>{document.scrap}</td>
              <td>{document.createDate}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TipsDocumentsWrapper>
  );
}

const TipsDocumentsWrapper = styled.div`
  padding: 20px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }

  th {
    background-color: #f2f2f2;
  }

  tr:hover {
    background-color: #f0f0f0;
  }

`;
