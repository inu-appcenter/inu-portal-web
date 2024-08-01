import styled from 'styled-components';
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function MobileUserActivePage() {
  const location = useLocation();
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
    <>
      <h3>{docType}</h3>
    </>
  );
}