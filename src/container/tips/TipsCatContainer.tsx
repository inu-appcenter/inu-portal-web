import TipsCategories from '../../component/tips/TipsCategories';
import styled from 'styled-components';

interface TipsCatContainerProps {
  docType: string;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

export default function TipsCatContainer( { docType, selectedCategory, setSelectedCategory }: TipsCatContainerProps) {
  return (
    <TipsContainerWraaper>
      <TipsCategories docType={docType} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
    </TipsContainerWraaper>
  );
}

const TipsContainerWraaper = styled.div`
  display: flex;
  flex-direction: row;
  margin: 30px 0 0 0;
`
