import styled from 'styled-components';
import aienterimg1 from '../../resource/assets/횃불-aienter1.svg';
import aienterimg2 from '../../resource/assets/횃불-aienter2.svg';

export default function AIEnter() {
    const handleAiBtnClick = () => { // 매개변수로 url을 추가하여 해당 URL을 사용할 수 있도록 함
        window.open(`/ai`);
      };
  return (

    <AiEnterWrapper onClick={handleAiBtnClick}>
      <AiEnter>
          <div className='enter-frame'>
          <img src={aienterimg1} alt="aienter-btn-img" />
          <div className='enter-title'> 횃불이 AI 생성 ✨   지금 바로 만드러 가기</div>
          <img src={aienterimg2} alt="aienter-btn-img" />
          </div>
      </AiEnter>
    </AiEnterWrapper>
  )
}

const AiEnterWrapper = styled.div`
  display: flex;
  position:relative;
  left: 70%;
  margin: 20px 10px;
`

const AiEnter = styled.div`
display:flex;
width: 411px;
height: 50px;
background: linear-gradient(90deg, #6F84E2 0%, #7BABE5 100%);
border-radius: 10px;
justify-content: center;
align-items:center;
gap: 10px;
  .enter-frame{
    justify-content: center;
  align-items:center;
    display:flex;
    width: 407px;
    height: 46px;
    border: 1px solid #FFFFFF;
    border-radius: 10px;
    
  }
`