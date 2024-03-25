// TipsPage.tsx
import styled from 'styled-components';
import { Routes, Route, useLocation } from 'react-router-dom';
import TipsCatContainer from '../container/tips/TipsCatContainer';
import TipsDocuments from '../component/Tips/TipsDocuments';
import PostDetail from "./PostDetailPage";
import { useEffect, useState } from 'react';
import PostBotton from '../component/Tips/PostButton';
import TipsTitle from '../component/tips/TipsTitle';
import CreatePost from './CreatePostPage';
import TipsTopPosts from '../component/Tips/TipsTopPosts';
import EditPost from './EditPostPage';


export default function TipsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const location = useLocation();
  const [sort, setSort] = useState<string>('date');
  const [page, setPage] = useState<string>('1');

  useEffect(() => {
    if (location.pathname.includes('/tips/search')) {
      setSelectedCategory('검색결과');
    }
    else if (location.pathname.includes('/tips/notice')) {
      setSelectedCategory('공지사항');
    }
  })
  return (
    <TipsPageWrapper>
      <TipsCatWrapper>
        <TipsCatContainer selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}/>
      </TipsCatWrapper>
      <TipsContentWrapper>
        <TipsTitle selectedCategory={selectedCategory} />
        <TipsTopPosts/>
        <BorderWrapper>
          <Routes>
            <Route index element={<TipsDocuments selectedCategory={selectedCategory} sort={sort} page={page} setSort={setSort} setPage={setPage}/>} />
            <Route path='search' element={<TipsDocuments selectedCategory={'검색결과'} sort={sort} page={page} setSort={setSort} setPage={setPage}/>} />
            <Route path='notice' element={<TipsDocuments selectedCategory={'공지사항'} sort={sort} page={page} setSort={setSort} setPage={setPage}/>} />
            <Route path=":id" element={<PostDetail />} />
            <Route path='/write' element={<CreatePost />} />
            <Route path='update/:id' element={<EditPost />} />
          </Routes>
        </BorderWrapper >
      </TipsContentWrapper>
      <PostBotton />
    </TipsPageWrapper>
  )
}


const TipsPageWrapper = styled.div`
  display: flex;
  flex-dicrection: row;

  height: 100%;
`
const TipsCatWrapper = styled.div`
 padding: 40px;
`

const TipsContentWrapper = styled.div`
  flex-grow: 1;
  overflow-y: auto;

  display: flex;
  flex-direction: column;
`

const BorderWrapper = styled.div`
  margin-right: 25px;
  border-style: solid;
  border-width: 5px 0 0 5px;
  border-color: #EAEAEA;
  flex-grow: 1;
`