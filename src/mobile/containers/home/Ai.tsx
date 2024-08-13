import styled from 'styled-components';
import aienterimg1 from '../../../resource/assets/횃불-aienter1.svg';
import aienterimg2 from '../../../resource/assets/횃불-aienter2.svg';

export default function AiForm() {
    const handleAiBtnClick = () => { // 매개변수로 url을 추가하여 해당 URL을 사용할 수 있도록 함
        window.open(`/m/ai`);
      };
  return (

    <AiEnterWrapper>
      <AiEnter onClick={handleAiBtnClick}>
          <div className='enter-frame'>
          <img src={aienterimg1} alt="aienter-btn-img" />
          <div className='enter-title'> 횃불이 AI 생성 ✨ 지금 바로 만드러 가기</div>
          <img src={aienterimg2} alt="aienter-btn-img" />
          </div>
      </AiEnter>
    </AiEnterWrapper>
  )
}

const AiEnterWrapper = styled.div`
margin-top: 20px;
background: linear-gradient(90deg, #6F84E2 0%, #7BABE5 100%);
border-radius: 10px;
padding:3px 3px;
`

const AiEnter = styled.div`
box-sizing: border-box;
border: 1px solid #FFFFFF;
padding:4px;
justify-content: center;
align-items:center;
gap: 10px;
border-radius: 10px;
  .enter-frame{
    justify-content: center;
    align-items:center;
    display:flex;
    border-radius: 10px;
  }

  .enter-title {
    font-family: Inter;
    font-size: 13px;
    font-weight: 700;
    color:white;
  }
`