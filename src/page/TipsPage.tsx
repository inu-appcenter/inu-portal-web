// TipsPage.tsx
import styled from 'styled-components';
import { Routes, Route, useLocation } from 'react-router-dom';
import TipsCatContainer from '../container/tips/TipsCatContainer';
import TipsDocuments from '../component/Tips/TipsDocuments';
import PostDetail from "./PostDetailPage";
import { useEffect, useState } from 'react';
import PostBotton from '../component/Tips/PostButton';
import TipsTitle from '../component/tips/TipsTitle';
import queryString from 'query-string';
import PopularPosts from '../component/Tips/PopularPosts';


export default function TipsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const location = useLocation();
  const queryParameters = queryString.parse(location.search);

  useEffect(() => {
    if (location.pathname.includes('/tips/search')) {
      setSelectedCategory('검색결과');
    }
  })
  return (
    <TipsPageWrapper>
      <TipsCatWrapper>
        <TipsCatContainer selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}/>
      </TipsCatWrapper>
      <div>
        <TipsTitle selectedCategory={selectedCategory} />
        <PopularPosts/>
        <Routes>
          <Route index element={<TipsDocuments selectedCategory={selectedCategory} />} />
          <Route path='search' element={<TipsDocuments selectedCategory={'검색결과'} queryParameters={queryParameters}/>} />
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

  height: calc(100vh - 120px);
  margin-bottom: 120px;
`
const TipsCatWrapper = styled.div`
 padding: 40px;
`