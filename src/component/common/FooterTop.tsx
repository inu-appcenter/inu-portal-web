import styled from 'styled-components';
import NavItems from './NavItem';
import InstagramIcon from '../../resource/assets/InstagramIcon.svg';
import FacebookIcon from '../../resource/assets/FacebookIcon.svg';
import XIcon from '../../resource/assets/XIcon.svg';

export default function FooterTop() {
  return (
    <FooterTopWrapper>
      <FooterLogoWrapper>INTIP</FooterLogoWrapper>
      <NavItems isInFooter={true} />
      <SocialLinks>
        <img src={InstagramIcon} />
        <img src={FacebookIcon} />
        <img src={XIcon} />
      </SocialLinks>
    </FooterTopWrapper>
  )
}

const FooterTopWrapper = styled.div`
  width: 80%;
  margin: 10px;

  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 5px;
  }
`

const FooterLogoWrapper = styled.span`
  font-size: 30px;
  font-weight: 700;
  color: #4D4D4D;
`

const SocialLinks = styled.span`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  gap: 15px;
`