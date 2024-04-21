import { useEffect } from 'react';
import './AiResultContainer.css';
import { useNavigate, useParams } from "react-router-dom";

export default function AiResultContainer() {
  const { imageId } = useParams<{imageId: string }>();
  const navigate = useNavigate();
  useEffect(() => {
    // api 호출로 img src 가져오기 구현 필요
  }, [imageId]);

  return (
    <div>
      <div>
        <span>생성완료!</span>
        <span>이미지 저장</span>
        <span>공유</span>
        <img src='' alt={imageId}/>
      </div>
      <div onClick={ () => navigate('/ai') }>다시 그리기</div>
      <div>제출</div>
    </div>
  )
}