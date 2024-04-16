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
  flex-direction: row;
  margin: 30px 0 0 0;
`
