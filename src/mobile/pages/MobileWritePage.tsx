import styled from 'styled-components';
import WriteTitle from '../components/write/WriteTitle';
import CategorySelector from '../components/write/CategorySelector';
import WriteForm from '../containers/write/WriteForm';
import { useState } from 'react';

export default function MobileWritePage() {
  const [category, setCategory] = useState('');

  return (
    <MoblileWritePageWrapper>
      <TitleCategorySelectorWrapper>
        <WriteTitle />
        <CategorySelector value={category} onChange={(value) => setCategory(value)}/>
      </TitleCategorySelectorWrapper>
      <WriteForm categoryProps={category}/>
    </MoblileWritePageWrapper>
  );
}

const MoblileWritePageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin: 16px 32px 0 32px;
  height: 92%;
`

const TitleCategorySelectorWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`