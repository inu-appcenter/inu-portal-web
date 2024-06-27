import styled from 'styled-components';
import FooterTop from "../../component/common/FooterTop";
import FooterBottom from "../../component/common/FooterBottom";

export default function Footer() {
  return (
    <FooterWrapper>
      <FooterTop />
      <FooterLine />
      <FooterBottom />
    </FooterWrapper>
  )
}

const FooterWrapper = styled.div`
  position: relative;
  left: 50%;
  transform: translateX(-50%);
  
  display: flex;
  flex-direction: column;
  align-items: center;
`

const FooterLine = styled.div`
  width: 90%;
  height: 0px;
  border: 2px solid #BEBEBE
`