import styled from 'styled-components';

import MyPageContainer from '../container/mypage/MyPageContainer';



export default function MyPage() {
  return (
    <MyPageWrapper>
        <MyPageContainer />
    </MyPageWrapper>
  );
}

const MyPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 200px;
`;
