import styled from 'styled-components';


import MypageCatContainer from '../container/mypage/MyPageCatContainer';
import { useState } from 'react';
import MyPageTitleContainer from '../container/mypage/MyPageTitleContainer';
import { Route, Routes } from 'react-router-dom';
// import TipsDocuments from '../component/Tips/TipsDocuments';
import { MyPageLists } from '../component/mypage/common/MyPageLists';


export default function MyPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('스크랩');
  const [scrapsort, setScrapSort] = useState<string>('date');
  const [likesort, setLikeSort] = useState<string>('date');
  const [commentsort, setCommentSort] = useState<string>('date');
  const [postsort, setPostSort] = useState<string>('date');

  const [page, setPage] = useState<string>('1');
  return (
    <MyPageWrapper>
        <MyPageCatWrapper>
          <MypageCatContainer selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}/>
      </MyPageCatWrapper>
      <MyPageContentWrapper>
            <MyPageTitleContainer />
      <BorderWrapper>
          <Routes>
            <Route index element={<MyPageLists selectedCategory={selectedCategory} scrapsort={scrapsort} likesort={likesort} commentsort={commentsort} postsort={postsort} page={page} setScrapSort={setScrapSort} setLikeSort={setLikeSort} setCommentSort={setCommentSort} setPostSort={setPostSort}  setPage={setPage}/>} />

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
 background: linear-gradient(to bottom, #DBEBFF 70%, #FFFFFF );
  flex-grow: 1;
`
