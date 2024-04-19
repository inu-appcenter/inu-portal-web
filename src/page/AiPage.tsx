import styled from 'styled-components';
import AiContainer from '../container/ai/AiContainer';

export default function AiPage() {
  return (
    <AiWrapper>
      <AiContainer />
    </AiWrapper>
  )
}

const AiWrapper = styled.div`
  display: flex;
  justify-content: center;
`