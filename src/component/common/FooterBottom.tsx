import styled from "styled-components";
import CopyRightText from "../../resource/assets/CopyRightText.svg";
import phoneImg from "../../resource/assets/phoneImg.svg";

export default function FooterBottom() {
  return (
    <FooterBottomWrapper>
      <img src={CopyRightText} />
      <ContactWrapper>
        <img src={phoneImg} />
        <span>Contact</span>
        {/* <span>032-000-0092</span> */}
      </ContactWrapper>
    </FooterBottomWrapper>
  );
}

const FooterBottomWrapper = styled.div`
  width: 80%;
  margin: 10px;

  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  color: #969696;
  font-weight: 700;
`;

const ContactWrapper = styled.span`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;
