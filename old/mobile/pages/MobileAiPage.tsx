import styled from 'styled-components';
import { Route, Routes } from 'react-router-dom';
import MobileHeader from '../containers/common/MobileHeader';
import MobileAiIntro from '../containers/ai/MobileAiIntro';
import MobileAiInput from '../containers/ai/MobileAiInput';
import MobileAiResult from '../containers/ai/MobileAiResult';
import UpperBackgroundImg from '../../resource/assets/mobile/common/upperBackgroundImg.svg';

export default function MobileAiPage() {
  return(
    <>
      <Background />
      <UpperBackground src={UpperBackgroundImg} />
      <header>
        <MobileHeader />
      </header>
      <MobileAiPageWrapper>
        <Routes>
          <Route index element={<MobileAiIntro />} />
          <Route path='input' element={<MobileAiInput />} />
          <Route path='result/:imageId' element={<MobileAiResult />} />
        </Routes>
      </MobileAiPageWrapper>
    </>
  );
}

const Background = styled.div`
  position: fixed;
  z-index: -2;
  left: 0;
  top: 0;
  height: 100svh;
  width: 100svw;
  background: linear-gradient(90deg, #6084D7 0%, #C294EB 100%);
`

const UpperBackground = styled.img`
  position: fixed;
  z-index: -1;
  width: 100%;
`

const MobileAiPageWrapper = styled.div`
  width: 100%;
  height: calc(100svh - 72px);
`