import { Route, Routes } from 'react-router-dom';
import './AiContainer.css';
import AiIntroContainer from './AiIntroContainer';
import AiTitleContainer from './AiTitleContainer';
import AiResultContainer from './AiResultContainer';

export default function AiContainer() {
  return (
    <div className='AiContainer'>
      <AiTitleContainer />
      <Routes>
        <Route index element={<AiIntroContainer />} />
        <Route path='result/:imageId' element={<AiResultContainer />} />
      </Routes>
    </div>
  )
}