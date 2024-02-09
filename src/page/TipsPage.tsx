import styled from 'styled-components';
import TipsCatContainer from '../container/tips/TipsCatContainer';
import PostButton from '../component/tips/PostButton';

export default function TipsPage() {
  return (
    <TipsPageWrapper>
      <PostButton />
      <TipsCatContainer/>
    </TipsPageWrapper>
  )
}


const TipsPageWrapper = styled.div`

  padding-top: 200px; // 임시 (나중에 MainPage에서 위치 조절 필요)
`