import TipsCategories from '../../component/Tips/TipsCategories';
import styled from 'styled-components';

interface TipsCatContainerProps {
  docState: DocState;
  setDocState: (docState: DocState) => void;
}

export default function TipsCatContainer({ docState, setDocState }: TipsCatContainerProps) {
  return (
    <TipsContainerWraaper>
      <TipsCategories docState={docState} setDocState={setDocState} />
    </TipsContainerWraaper>
  );
}

const TipsContainerWraaper = styled.div`
  display: flex;
  flex-direction: column;
  @media (max-width: 768px) { /* 모바일 */
    align-items: center;
    width: 100%;
    margin: 0;
  }
`
