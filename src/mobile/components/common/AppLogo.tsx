import styled from 'styled-components';
import intipLogo from '../../../resource/assets/inu-logo-img.svg';
import { useNavigate } from 'react-router-dom';

export default function AppLogo() {
  const navigate = useNavigate();

  return (
    <>
      <Logo onClick={() => {navigate('/m/home')}} data={intipLogo}  />
    </>
  );
}

const Logo = styled.object`
  height: 56px;
`;
