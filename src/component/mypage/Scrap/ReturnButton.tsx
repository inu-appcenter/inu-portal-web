import { useNavigate } from "react-router-dom";
  
export default function ReturnScrapButton () {
    const navigate = useNavigate();

  return (
    <span>
      <button onClick={() =>navigate('/mypage') }>돌아가기</button>
    </span>
  );
}