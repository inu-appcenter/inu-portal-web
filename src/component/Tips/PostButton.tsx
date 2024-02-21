import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import pencilImg from '../../resource/assets/Pencil.png';

export default function RegisterInput() {
  const navigate = useNavigate();

  return (
    <PostButtonWrapper onClick={() => {navigate('/write')}}>
      <img src={pencilImg} alt='pencilImg'></img>
    </PostButtonWrapper>
  )
}

const PostButtonWrapper = styled.div`
  position: absolute;
  bottom: 50px;
  right: 50px;

  width: 65px;
  height: 65px;
  border-radius: 100px;

  background: linear-gradient(90deg, rgba(111, 132, 226, 0.6) 0%, rgba(123, 171, 229, 0.6) 100%);
  
  display: flex;
  justify-content: center;
  align-items: center;

  cursor: pointer;
  `