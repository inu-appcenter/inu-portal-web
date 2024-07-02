import styled from 'styled-components';
import WeatherForm from '../containers/home/Weather';
import SerachForm from '../containers/home/SerachForm';
import CategoryForm from '../containers/home/Category';
import TipForm from '../containers/home/Tips';
import AiForm from '../containers/home/Ai';
import NoticeForm from '../containers/home/Notice';

export default function MobileHomePage() {

  return(
    <MobileHomePageWrapper>
      <WeatherForm/>
      <ContainerWrapper>
        <SerachForm/>
        <CategoryForm/>
        <TipForm/>
        <AiForm/>
        <NoticeForm/>
      </ContainerWrapper>

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
`;

const ContainerWrapper = styled.div`
  margin:0 25px;
`