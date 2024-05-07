import './AiTitleContainer.css';
import { useNavigate } from 'react-router-dom';

export default function AiTitleContainer() {
  const navigate = useNavigate();
  return (
    <div className='Ai-title-wrapper'>
      <div>
        <span className='Ai-title-1'>Hello, </span>
        <span className='Ai-title-2'>AI 횃불이</span>
      </div>
      <div className='Ai-title-logo' onClick={() => {navigate('/')}}>INTIP</div>
    </div>
  )
}