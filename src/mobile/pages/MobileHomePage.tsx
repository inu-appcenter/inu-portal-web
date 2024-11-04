import styled from "styled-components";
import WeatherForm from "../containers/home/Weather";
import SerachForm from "../containers/home/SerachForm";
import CategoryForm from "../containers/home/Category";
import TipForm from "../containers/home/Tips";
import AiForm from "../containers/home/Ai";
import NoticeForm from "../containers/home/Notice";
import AppcenterLogo from "../../resource/assets/appcenter-logo.svg";

export default function MobileHomePage() {
  return (
    <MobileHomePageWrapper>
      <WeatherForm />
      <ContainerWrapper>
        <SerachForm />
        <CategoryForm />
        <TipForm />
        <AiForm />
        <NoticeForm />
      </ContainerWrapper>
      <AppcenterLogoWrapper src={AppcenterLogo} alt="Appcenter" />
    </MobileHomePageWrapper>
  );
}

const MobileHomePageWrapper = styled.div`
  /* display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin: 16px 32px 0 32px;
  height: 92%; */
  display: flex;
  flex-direction: column;
  margin-top: 170px;
  width: 100%;
  position: relative;
`;

const ContainerWrapper = styled.div`
  margin: 0 25px;
`;
const AppcenterLogoWrapper = styled.img`
  background: linear-gradient(to bottom, white, rgb(170, 201, 238));
  padding: 24px 0;
  height: 32px;
`;
