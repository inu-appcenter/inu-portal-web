import styled from "styled-components";
import WeatherForm from "mobile/containers/home/Weather";
import SerachForm from "mobile/containers/home/SerachForm";
import CategoryForm from "mobile/containers/home/Category";
import TipForm from "mobile/containers/home/Tips";
import AiForm from "mobile/containers/home/Ai";
import NoticeForm from "mobile/containers/home/Notice";
import AppcenterLogo from "resources/assets/appcenter-logo.svg";

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
  display: flex;
  flex-direction: column;
  margin-top: 170px;
  width: 100%;
  position: relative;
`;

const ContainerWrapper = styled.div`
  margin: 0 24px;
`;

const AppcenterLogoWrapper = styled.img`
  background: linear-gradient(to bottom, white, rgb(170, 201, 238));
  padding: 24px 0;
  height: 32px;
`;
