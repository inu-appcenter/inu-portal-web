import styled from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import backbtn from '../../resource/assets/backbtn.svg';

export default function MobileUserActivePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [docType, setDocType] = useState<'내가 쓴 글' | '좋아요 한 글' | '작성한 댓글' | ''>('');

  useEffect(() => {
    if (location.pathname.includes('/active')) {
      if (location.pathname.includes('/active/posts')) {
        setDocType('내가 쓴 글');
      } else if (location.pathname.includes('/active/likes')) {
        setDocType('좋아요 한 글');
      } else if (location.pathname.includes('/active/replies')) {
        setDocType('작성한 댓글');
      }
    } 
  }, [location.pathname]);

  return(
    <MobileUserActivePageWrapper>
      <TitleWrapper>
        <img src={backbtn} onClick={() => navigate('/m/mypage')}/>
        <span>{docType}</span>
      </TitleWrapper>
    </MobileUserActivePageWrapper>
  );
}

const MobileUserActivePageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
`

const TitleWrapper = styled.div`
  padding-left: 16px;
  width: calc(100% - 16px);
  height: 47px;
  display: flex;
  align-items: center;
  gap: 16px;
  border-bottom: 1px solid #D9D9D9;
  img {
    height: 14px;
  }
  span {
    font-size: 15px;
    font-weight: 500;
  }
`