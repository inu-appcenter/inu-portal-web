import styled from 'styled-components';
import WriteTitle from '../components/write/WriteTitle';
import CategorySelector from '../components/write/CategorySelector';
import { useState } from 'react';

export default function MobileWritePage() {
  const [category, setCategory] = useState('');
  return (
    <MoblileWritePageWrapper>
      <TitleCategorySelectorWrapper>
        <WriteTitle />
        <CategorySelector value={category} onChange={(value) => setCategory(value)}/>
      </TitleCategorySelectorWrapper>
    </MoblileWritePageWrapper>
  );
}

const MoblileWritePageWrapper = styled.div`
  margin: 16px 32px 0 32px;
  height: 95%;
`

const TitleCategorySelectorWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`