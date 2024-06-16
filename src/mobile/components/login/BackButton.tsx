import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import backIcon from '../../../resource/assets/mobile/login/back-icon.svg';

export default function BackButton() {
  const navigate = useNavigate();
  return <Button onClick={() => navigate(-1)} src={backIcon} alt="backIcon"/>
};

const Button = styled.img`
  height: 16px;
`;
