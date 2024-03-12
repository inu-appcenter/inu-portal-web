// TipsPage.tsx
import styled from 'styled-components';
import { Routes, Route, Outlet } from 'react-router-dom';
import TipsCatContainer from '../container/tips/TipsCatContainer';
import TipsDocuments from '../component/Tips/TipsDocuments';
import PostDetail from './PostDetailPage';
import { useState } from 'react';
import PostBotton from '../component/Tips/PostButton';
import TipsTitle from '../component/tips/TipsTitle';
import PopularPosts from '../component/Tips/PopularPosts';

export default function TipsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  return (
    <TipsPageWrapper>
      <TipsCategoryWrapper>
        <TipsCatContainer
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
      </TipsCategoryWrapper>

      <TipsContentWrapper>
        <TipsTitle selectedCategory={selectedCategory} />
        <div>
          <PopularPosts />
        </div>
        <Routes>
          <Route
            index
            element={<TipsDocuments selectedCategory={selectedCategory} />}
          />
          <Route path=':id' element={<PostDetail />} />
        </Routes>
        <PostBotton />
      </TipsContentWrapper>
      
    </TipsPageWrapper>
  );
}

const TipsPageWrapper = styled.div`
  display: flex;
  flex-dicrection: row;
  margin: 20px;
`;

const TipsCategoryWrapper = styled.div`
  display: flex;
  flex-dicrection: row;
  padding: 20px;
  margin: 10px;
`;
const TipsContentWrapper = styled.div`
margin: 10px;

  padding: 20px;
`;
