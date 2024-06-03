import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useParams } from "react-router-dom";
import { getFires } from '../../utils/API/Fires';
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
        const response = await getFires(imageId);
        if (response.status === 200) {
          const imageURL = URL.createObjectURL(response.body);
          setImageUrl(imageURL);
        } else if (response.status === 404) {
          alert('존재하지 않는 이미지 번호입니다.');
        } else {
          alert('이미지 불러오기 실패');
        }
      } catch (error) {
        console.error('Error fetching image', error);
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

const AiResultContainerWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-content:center;
  overflow: auto;
`;
