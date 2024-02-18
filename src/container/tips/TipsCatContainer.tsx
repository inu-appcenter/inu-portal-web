import TipsCategories from '../../component/tips/TipsCategories';
import styled from 'styled-components';

interface TipsCatContainerProps {
  setSelectedCategory: (category: string) => void;
}

export default function TipsCatContainer( { setSelectedCategory }: TipsCatContainerProps) {
  return (
    <TipsContainerWraaper>
      <TipsCategories setSelectedCategory={setSelectedCategory} />
    </TipsContainerWraaper>
  );
}

const TipsContainerWraaper = styled.div`
  display: flex;
  flex-direction: row;
`
