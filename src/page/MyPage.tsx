import styled from 'styled-components';


import MypageCatContainer from '../container/mypage/MyPageCatContainer';
import { useEffect, useState } from 'react';
import MyPageTitleContainer from '../container/mypage/MyPageTitleContainer';
import { Route, Routes } from 'react-router-dom';
// import TipsDocuments from '../component/Tips/TipsDocuments';
import { MyPageLists } from '../component/mypage/common/MyPageLists';
import ScrapInfo from '../component/mypage/Scrap/Scrap';



export default function MyPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('스크랩');
  const [scrapsort, setScrapSort] = useState<string>('date');
  const [likesort, setLikeSort] = useState<string>('date');
  const [commentsort, setCommentSort] = useState<string>('date');
  const [postsort, setPostSort] = useState<string>('date');

  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    if (location.pathname.includes('/mypage/search')) {
      setSelectedCategory('검색결과');
    }
    else if (location.pathname.includes('/mypage/searchfolder')) {
      setSelectedCategory('폴더내검색결과');
    }
  })
  
  return (
    <MyPageWrapper>
        <MyPageCatWrapper>
          <MypageCatContainer selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}/>
      </MyPageCatWrapper>
      <MyPageContentWrapper>
            <MyPageTitleContainer selectedCategory={selectedCategory}/>

        <BorderWrapper>
          <Routes>
            <Route index element={<MyPageLists selectedCategory={selectedCategory} scrapsort={scrapsort} likesort={likesort} commentsort={commentsort} postsort={postsort} page={page} setScrapSort={setScrapSort} setLikeSort={setLikeSort} setCommentSort={setCommentSort} setPostSort={setPostSort}  setPage={setPage}/>} />
            <Route path=':id' element={<ScrapInfo  selectedCategory={'폴더'} setSelectedCategory={setSelectedCategory} scrapsort={scrapsort} page={page} setScrapSort={setScrapSort} setPage={setPage}/>} />
            <Route path='search' element={<ScrapInfo  selectedCategory={'검색결과'} setSelectedCategory={setSelectedCategory} scrapsort={scrapsort} page={page} setScrapSort={setScrapSort} setPage={setPage}/>} />
            <Route path='searchfolder' element={<ScrapInfo  selectedCategory={'폴더내검색결과'} setSelectedCategory={setSelectedCategory} scrapsort={scrapsort} page={page} setScrapSort={setScrapSort} setPage={setPage}/>} />
          </Routes>
        </BorderWrapper >
      </MyPageContentWrapper>
    </MyPageWrapper>
  );
}

const MyPageWrapper = styled.div`
    display: flex;
    flex-direction: row;
    height: calc(100vh - 140px);
`;

const MyPageCatWrapper = styled.div`
 padding: 40px;
`

const MyPageContentWrapper = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`

const BorderWrapper = styled.div`
 background: linear-gradient(#DBEBFF 0.1%, #FFFFFF 99.9%);
  flex-grow: 1;
`
