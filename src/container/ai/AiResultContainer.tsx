import { useEffect } from 'react';
import './AiResultContainer.css';
import { useNavigate, useParams } from "react-router-dom";
import AiImgViewer from '../../component/ai/AiImgViewer';


export default function AiResultContainer() {
  const { imageId } = useParams<{imageId: string }>();
  const navigate = useNavigate();
  useEffect(() => {
    // api 호출로 img src 가져오기 구현 필요
  }, [imageId]);

  return (
    <div>
     <AiImgViewer imageUrl={`imageUrl`}/>
    </div>
  )
}