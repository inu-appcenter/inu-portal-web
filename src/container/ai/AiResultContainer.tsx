import { useEffect } from 'react';
import './AiResultContainer.css';
import { useNavigate, useParams } from "react-router-dom";
import AiImgViewer from '../../component/ai/AiImgViewer';
import AiImgRetry from '../../component/ai/AiImgRetry';
import styled from 'styled-components';
import AiImgScore from '../../component/ai/AiImgScore';

export default function AiResultContainer() {
  const { imageId } = useParams<{imageId: string }>();
  const navigate = useNavigate();
  useEffect(() => {
    // api 호출로 img src 가져오기 구현 필요
  }, [imageId]);

  return (
    <AiResultContainerWrapper>
     <AiImgViewer imageUrl={`imageUrl`}/>
     <AiImgScore/>
     <AiImgRetry/>
     </AiResultContainerWrapper>
  )
}

const AiResultContainerWrapper=styled.div`
  display: flex;
  justify-content: center;
  align-content:center;
`