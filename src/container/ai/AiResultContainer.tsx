import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useParams } from "react-router-dom";
import getFires from '../../utils/getFires';
import AiImgViewer from '../../component/ai/AiImgViewer';
import AiImgRetry from '../../component/ai/AiImgRetry';
import AiImgScore from '../../component/ai/AiImgScore';
import AiImgSubmit from '../../component/ai/AiImgSubmit';

export default function AiResultContainer() {
  const { imageId } = useParams<{imageId: string }>();
  const [imageUrl, setImageUrl] = useState<string>('');
  const [rating, setRating] = useState<number>(0);

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

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };

  return (
    <AiResultContainerWrapper>
     {imageUrl && <AiImgViewer imageUrl={imageUrl}/> }
     {imageId && <AiImgRetry rating={rating} id={imageId}/> }
     <AiImgScore rating={rating} onRatingChange={handleRatingChange}/>
     {imageId && <AiImgSubmit rating={rating} id={imageId} /> }
    </AiResultContainerWrapper>
  )
}

const AiResultContainerWrapper=styled.div`
  display: flex;
  justify-content: center;
  align-content:center;
  overflow: auto;
`;
