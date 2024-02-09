import { useNavigate } from 'react-router-dom';

export default function RegisterInput() {
  const navigate = useNavigate();

  return (
    <button onClick={() => {navigate('/write')}}>
      글쓰기
    </button>
  )
}
