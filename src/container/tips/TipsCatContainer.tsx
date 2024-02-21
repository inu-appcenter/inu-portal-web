import TipsCategories from '../../component/tips/TipsCategories';
import styled from 'styled-components';

interface TipsCatContainerProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

export default function TipsCatContainer( { selectedCategory, setSelectedCategory }: TipsCatContainerProps) {
  return (
    <TipsContainerWraaper>
      <TipsCategories selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
    </TipsContainerWraaper>
  );
}

const TipsContainerWraaper = styled.div`
  display: flex;
  flex-direction: row;
`
