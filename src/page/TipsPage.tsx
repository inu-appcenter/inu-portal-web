// TipsPage.tsx
import styled from 'styled-components';
import { Routes, Route, Outlet } from 'react-router-dom';
import TipsCatContainer from '../container/tips/TipsCatContainer';
import TipsDocuments from '../component/Tips/TipsDocuments';
import PostDetail from "../Page/PostDetailPage";
import { useState } from 'react';
import PostBotton from '../component/Tips/PostButton';


export default function TipsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  return (
    <TipsPageWrapper>
      
      <div>
        <PostBotton />
        <TipsCatContainer setSelectedCategory={setSelectedCategory}/>
      </div>
      <Routes>
        <Route index element={<TipsDocuments selectedCategory={selectedCategory} />} />
        <Route path=":id" element={<PostDetail />} />
      </Routes>
    </TipsPageWrapper>
  )
}


const TipsPageWrapper = styled.div`
  padding-top: 200px; // 임시 (나중에 MainPage에서 위치 조절 필요)

  display: flex;
  flex-dicrection: row;
`