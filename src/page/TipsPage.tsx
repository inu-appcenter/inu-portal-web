// TipsPage.tsx
import styled from 'styled-components';
import { Routes, Route, useLocation } from 'react-router-dom';
import TipsCatContainer from '../container/tips/TipsCatContainer';
import TipsDocuments from '../component/Tips/TipsDocuments';
import PostDetail from "./PostDetailPage";
import { useEffect, useState } from 'react';
import PostBotton from '../component/Tips/PostButton';
import TipsTitle from '../component/tips/TipsTitle';

export default function TipsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const location = useLocation();
  

  useEffect(() => {
    if (location.pathname.includes('/tips/search')) {
      setSelectedCategory('검색결과');
    }
  })
  return (
    <TipsPageWrapper>
      <div>
        <TipsCatContainer selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}/>
      </div>
      <div>
        <TipsTitle selectedCategory={selectedCategory} />
        <Routes>
          <Route index element={<TipsDocuments selectedCategory={selectedCategory} sortParam='date' pageParam='1' />} />
          <Route path='search' element={<TipsDocuments selectedCategory={'검색결과'} sortParam='date' pageParam='1'/>} />
          <Route path=":id" element={<PostDetail />} />
        </Routes>
      </div>
      <PostBotton />
    </TipsPageWrapper>
  )
}


const TipsPageWrapper = styled.div`
  display: flex;
  flex-dicrection: row;

  height: calc(100vh - 240px);
  margin-bottom: 120px;
`