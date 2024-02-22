import styled from 'styled-components';

import MyPageContainer from '../container/mypage/MyPageContainer';
import MyPageHeaderContainer from '../container/mypage/MyPageHeaderContainer';



export default function MyPage() {
  return (
    <MyPageWrapper>
      <MyPageHeaderContainer/>
      <MyPageContainer />
    </MyPageWrapper>
  );
}

const MyPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding-top:  11px;
`;
