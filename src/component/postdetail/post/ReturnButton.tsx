import { useNavigate } from "react-router-dom";

export default function ReturnButton () {
  const navigate = useNavigate();
  return (
    <span>
      <button onClick={() => navigate(-1)}>돌아가기</button>
    </span>
  );
};