import styled from 'styled-components';
import UniversityBuildingImg from '../../resource/assets/university-building.png';
import ElipseImg from '../../resource/assets/Ellipse.png';
import LoginImgContainer from '../../container/login/LoginImgContainer';
import LoginDetailContainer from '../../container/login/LoginDetailContainer';
import './LoginPage.css'

export default function LoginPage() {

  return (
    <>
      <LoginWrapper>
        <LoginImgContainer/>
        <LoginDetailContainer/>
        <img src={ElipseImg} className='ElipseImg' alt='ElipsImg'></img>
        <img src={UniversityBuildingImg} className='UniversityBuildingImg' alt='대학건물이미지'></img>
      </LoginWrapper>
    </>
  )
}
const LoginWrapper = styled.div `
  display: flex;
  flex-direction: row;
  align-items: center;

  padding-left: 32px;
  padding-right: 32px;
  height: 80vh;
`