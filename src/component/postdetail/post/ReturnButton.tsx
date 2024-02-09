import { useNavigate } from "react-router-dom";

export default function ReturnButton () {
  const navigate = useNavigate();
  return (
      <button onClick={() => navigate('/tips')}>글 목록으로 돌아가기</button>
  );
};