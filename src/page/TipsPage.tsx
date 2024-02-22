// TipsPage.tsx
import styled from 'styled-components';
import { Routes, Route, Outlet } from 'react-router-dom';
import TipsCatContainer from '../container/tips/TipsCatContainer';
import TipsDocuments from '../component/Tips/TipsDocuments';
import PostDetail from "./PostDetailPage";
import { useState } from 'react';
import PostBotton from '../component/Tips/PostButton';


export default function TipsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  return (
    <TipsPageWrapper>
      <div>
        <TipsCatContainer selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}/>
      </div>
      <Routes>
        <Route index element={<TipsDocuments selectedCategory={selectedCategory} />} />
        <Route path=":id" element={<PostDetail />} />
      </Routes>
      <PostBotton />
    </TipsPageWrapper>
  )
}


const TipsPageWrapper = styled.div`
  display: flex;
  flex-dicrection: row;
`