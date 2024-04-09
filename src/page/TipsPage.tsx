// TipsPage.tsx
import styled from 'styled-components';
import { Routes, Route, useLocation } from 'react-router-dom';
import TipsCatContainer from '../container/tips/TipsCatContainer';
import TipsDocuments from '../component/Tips/TipsDocuments';
import PostDetail from "./PostDetailPage";
import { useEffect, useState } from 'react';
import PostBotton from '../component/Tips/PostButton';
import TipsTitle from '../component/Tips/TipsTitle';
import TipsTopPosts from '../component/Tips/TipsTopPosts';
import NoticesTop from '../component/Tips/NoticesTop';


export default function TipsPage() {
  const [docType, setDocType] = useState<string>(''); // TIPS 또는 NOTICE
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const location = useLocation();
  const [sort, setSort] = useState<string>('date');
  const [page, setPage] = useState<string>('1');

  useEffect(() => {
    if (location.pathname.includes('/tips/search')) {
      setSelectedCategory('검색결과');
      setDocType('TIPS');
    }
    else if (location.pathname.includes('/tips/notice')) {
      setDocType('NOTICE');
    }
    else {
      setDocType('TIPS');
    }
  })

  const isWriteOrUpdatePath = location.pathname.includes('/tips/write') || location.pathname.includes('/tips/update');
  
  return (
    <TipsPageWrapper>
      <TipsCatWrapper>
        <TipsCatContainer docType={docType} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}/>
      </TipsCatWrapper>
      <TipsContentWrapper>
        <TipsTitle selectedCategory={selectedCategory} docType={docType} />
        {!isWriteOrUpdatePath && (docType === 'NOTICE' ? <NoticesTop /> : <TipsTopPosts selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />)}
        <BorderWrapper>
          <Routes>
            <Route index element={<TipsDocuments docType={docType} selectedCategory={selectedCategory} sort={sort} page={page} setSort={setSort} setPage={setPage}/>} />
            <Route path='search' element={<TipsDocuments docType={docType} selectedCategory={'검색결과'} sort={sort} page={page} setSort={setSort} setPage={setPage}/>} />
            <Route path='notice' element={<TipsDocuments docType={docType} selectedCategory={selectedCategory} sort={sort} page={page} setSort={setSort} setPage={setPage}/>} />
            <Route path=":id" element={<PostDetail />} />
            {/* <Route path='write' element={<CreatePost />} />
            <Route path='update/:id' element={<EditPost />} /> */}
          </Routes>
        </BorderWrapper >
      </TipsContentWrapper>
      <PostBotton  />
    </TipsPageWrapper>
  )
}


const TipsPageWrapper = styled.div`
  display: flex;
  flex-dicrection: row;

  height: 100%;
`
const TipsCatWrapper = styled.div`
 padding: 30px;
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