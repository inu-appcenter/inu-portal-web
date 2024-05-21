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
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 50px;
`

const FooterLine = styled.div`
  width: 90%;
  height: 0px;
  border: 2px solid #BEBEBE
`