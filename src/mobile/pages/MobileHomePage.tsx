import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

export default function MobileHomePage() {
  const navigate = useNavigate();

  return(
    <MobileHomePageWrapper>
      <button onClick={() => navigate('/m/home/tips')}>tips</button>
      <button onClick={() => navigate('/m/home/tips/notice')}>notice</button>
    </MobileHomePageWrapper>
  );
}

const MobileHomePageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin: 16px 32px 0 32px;
  height: 92%;
`;
