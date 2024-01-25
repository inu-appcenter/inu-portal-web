import React from 'react';

interface Document {
  title: string;
  author: string;
  date: string;
}

interface TipsDocumentDetailProps {
  document: Document;
}

const TipsDocumentDetail: React.FC<TipsDocumentDetailProps> = ({ document }) => {
  // document 이용해서 백엔드에서 글 세부내용 가져오는 코드 작성
  
  return (
    <div>
      <h1>제목, 내용, 댓글, 추천 구현</h1>
      <h3>제목: {document.title}</h3>
    </div>
  );
};

export default TipsDocumentDetail;
