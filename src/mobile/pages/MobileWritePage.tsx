import styled from 'styled-components';
import WriteTitle from '../components/write/WriteTitle';
import CategorySelector from '../components/write/CategorySelector';
import WriteForm from '../containers/write/WriteForm';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function MobileWritePage() {
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get('id') || undefined;

  useEffect(() => {
    if (location.pathname.includes('update')) {
      setType('update');
    } else {
      setType('create');
    }
  }, [id]);

  return (
    <MobileWritePageWrapper>
      <TitleCategorySelectorWrapper>
        <WriteTitle idProps={id} value={type} />
        <CategorySelector value={category} onChange={setCategory} />
      </TitleCategorySelectorWrapper>
      <WriteForm idProps={id} category={category} setCategory={setCategory} typeProps={type} />
    </MobileWritePageWrapper>
  );
}

const MobileWritePageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin: 16px 32px 0 32px;
  height: 92%;
`;

const TitleCategorySelectorWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
