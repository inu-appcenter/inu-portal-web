import { useEffect, useState } from 'react';
import './AiResultContainer.css';
import { useParams } from "react-router-dom";
import AiImgViewer from '../../component/ai/AiImgViewer';
import AiImgRetry from '../../component/ai/AiImgRetry';
import styled from 'styled-components';
import AiImgScore from '../../component/ai/AiImgScore';
import getFires from '../../utils/getFires';

export default function AiResultContainer() {
  const { imageId } = useParams<{imageId: string }>();
  const [imageUrl, setImageUrl] = useState<string>('');
  useEffect(() => {
    if (!imageId) return;
    const fetchImage = async () => {
      try {
        const imageUrl = await getFires(imageId);
        setImageUrl(imageUrl);
      } catch (error) {
        console.error(`Error fetching image`);
      }
    };
    fetchImage();
  }, [imageId]);
 
  return (
    <AiResultContainerWrapper>
     {imageUrl && <AiImgViewer imageUrl={imageUrl}/> }
     <AiImgRetry/>
     <AiImgScore/>
     </AiResultContainerWrapper>
  )
}
 
const AiResultContainerWrapper=styled.div`
  display: flex;
  justify-content: center;
  align-content:center;
`