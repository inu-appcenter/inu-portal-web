import './AiContainer.css';
import AiExampleImage1 from '../../resource/assets/AiExampleImage/AiExampleImage1.svg';

export default function AiPage() {
  return (
    <div className='AiContainer'>
      <div className='Ai-title-wrapper'>
        <span className='Ai-title-1'>Hello, </span>
        <span className='Ai-title-2'>AI 횃불이</span>
      </div>
      <div className='Ai-intro-wrapper'>
        <div className='Ai-intro-text'>
          <span style={{ fontSize: '15px', lineHeight: '20px' }}>
            <b style={{ fontSize: '20px' }}>AI 횃불이</b> 는 창의적이고 재미있는 캐릭터를 AI로 생성하는 앱입니다.<br/>
            <br/>
            이 앱은 사용자가 입력한 특정 행동이나 상황을 바탕으로 고유한 캐릭터 이미지를 생성합니다.<br/>
            예를 들어, <b>사용자가 "피자를 먹는 횃불이"와 같은 명령을 입력</b>하면, 앱은 피자를 먹고 있는 횃불이의 이미지를 AI로 생성하여 제공합니다.
          </span>
        </div>
        <div className='right-wrapper'>
          <div className='HowToUse-wrapper'>
            <div className='HowToUse-title-wrapper'>
              <span className='HowToUse-title-text'>HOW TO USE</span>
              <img src={AiExampleImage1} />
            </div>
            <div className='HowToUse-line'/>
            <div className='HowToUse-text'>
              <span style={{ fontSize: '20px', lineHeight: '30px' }}>
                1. 원하는 행동 또는 상황을 입력합니다. 예를 들어, "운동하는 횃불이", "공부하는 횃불이" 등을 입력하세요.<br/>
                2. 앱은 입력된 내용을 바탕으로 AI로 캐릭터 이미지를 생성합니다.<br/>
                3. 생성된 이미지를 즐겨보세요! 필요에 따라 저장하거나 공유할 수 있습니다.<br/>
              </span>
            </div>
          </div>
          <div className='Ai-function-wrapper'>
            <div className='Ai-input-wrapper'>
              <div className='Ai-input-line'/>
              <input className='Ai-input' placeholder='명령어를 입력하세요.'/>
            </div>
            <div className='Ai-generate-button'>생성하기</div>
          </div>
        </div>
      </div>
    </div>
  )
}