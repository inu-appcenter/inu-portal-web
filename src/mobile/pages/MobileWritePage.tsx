import styled from 'styled-components';
import WritePageTitle from '../components/write/WritePageTitle';
import CategorySelector from '../components/common/CategorySelector';
import WriteForm from '../containers/write/WriteForm';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function MobileWritePage() {
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [id, setId] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname.includes('update')) {
      setType('update');
      const params = new URLSearchParams(location.search);
      setId(params.get('id') || '');
    } else {
      setType('create');
      setId('');
      setCategory('');
    }
  }, [location.pathname]);

  const handleNewPost = () => {
    navigate('/m/write');
    setType('create');
    setId('');
    setCategory('');
  };

  return (
    <MobileWritePageWrapper>
      <TitleCategorySelectorWrapper>
        <WritePageTitle idProps={id} value={type} />
        {type=='update' && <NewPostButton onClick={handleNewPost}>새 글 쓰기</NewPostButton>}
        <CategorySelector value={category} onChange={setCategory} docType={'TIPS'} />
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
  padding: 0 16px 0 16px;
  height: 96%;
  width: 100%;
`;

const TitleCategorySelectorWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const NewPostButton = styled.div`
  padding: 4px 8px;
  font-size: 12px;
  color: white;
  background-color: #007bff;
  border-radius: 4px;
`;