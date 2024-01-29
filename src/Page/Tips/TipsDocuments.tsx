import React, { useState, useEffect } from 'react';

interface Document {
  title: string;
  author: string;
  date: string;
}

interface TipsDocumentsProps {
  selectedCategory: string;
}

const TipsDocuments: React.FC<TipsDocumentsProps> = ({ selectedCategory }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const getDocuments = (category: string) => {
    // 현재 더미데이터 이용, 이곳에 백엔드에서 카테고리 가져오는 코드 작성.
    const dummyDocuments: Document[] = [
      { title: `Document 1 for ${category}`, author: "작성자 1", date: "2024-01-01" },
      { title: `Document 2 for ${category}`, author: "작성자 2", date: "2024-01-02" },
      { title: `Document 3 for ${category}`, author: "작성자 3", date: "2024-01-03" }
    ];
    setDocuments(dummyDocuments);
  };

  useEffect(() => {
    getDocuments(selectedCategory);
  }, [selectedCategory]);

  return (
    <div>
      <h2>{selectedCategory} Tips</h2> 
        <div>
          {documents.map((document, index) => (
            <div key={index} onClick={() => setSelectedDocument(document)}>
              제목: {document.title} ====== 작성자: {document.author} ====== 작성일: {document.date}
            </div>
          ))}
        </div>
    </div>
  );
};

export default TipsDocuments;
