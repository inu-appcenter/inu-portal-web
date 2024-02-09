import { useState } from 'react';

import TipsCategories from '../../component/tips/TipsCategories';
import TipsDocuments from '../../component/tips/TipsDocuments'
import styled from 'styled-components';

export default function TipsCatContainer() {
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  return (
    <TipsContainerWraaper>
      <TipsCategories setSelectedCategory={setSelectedCategory} />
      <TipsDocuments selectedCategory={selectedCategory} />
    </TipsContainerWraaper>
  );
}

const TipsContainerWraaper = styled.div`
  display: flex;
  flex-direction: row;
`
