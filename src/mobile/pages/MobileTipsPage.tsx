import styled from 'styled-components';
import { useEffect, useState } from 'react';
import TipsPageTitle from '../components/tips/TipsPageTitle';
import CategorySelector from '../components/common/CategorySelector';
import { useLocation } from 'react-router-dom';
import ViewModeButtons from '../components/tips/ViewModeButtons';
import TipsListContainer from '../containers/tips/TipsListContainer';
import SerachForm from '../containers/home/SerachForm';

export default function MobileTipsPage() {
  const location = useLocation();
  const [category, setCategory] = useState('전체');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [docType, setDocType] = useState('');  // TIPS 또는 NOTICE

  useEffect(() => {
    if (location.pathname.includes('/tips')) {
      if (location.pathname.includes('/tips/notice')) {
        setDocType('NOTICE');
      }
      else if (location.pathname.includes('/tips/search')) {
        setDocType('SEARCH');
      }
      else {
        setDocType('TIPS');
      }
    }
  }, [location.pathname]);

  useEffect(() => {
    setCategory('전체');
  }, [docType]);

  return (
    <MobileTipsPageWrapper>
      {(docType != 'NOTICE') && (<SerachForm />)}
      <TitleCategorySelectorWrapper>
        <TipsPageTitle value={docType} />
        <ViewModeButtonCategorySelectorWrapper>
          <ViewModeButtons viewMode={viewMode} setViewMode={setViewMode} />
          {(docType != 'SEARCH') && (<CategorySelector value={category} onChange={setCategory} docType={docType} />)}
        </ViewModeButtonCategorySelectorWrapper>
      </TitleCategorySelectorWrapper>
      <Wrapper>
        <TipsListContainer viewMode={viewMode} docType={docType} category={category} />
      </Wrapper>
    </MobileTipsPageWrapper>
  );
}

const MobileTipsPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 0 16px 0 16px;
  height: 100%;
  width: 100%;
`;

const TitleCategorySelectorWrapper = styled.div`
  width: 100%;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ViewModeButtonCategorySelectorWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const Wrapper = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
`