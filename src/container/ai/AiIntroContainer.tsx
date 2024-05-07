import './AiIntroContainer.css';
import GlassCube from '../../resource/assets/glasscube.svg';
import AiExampleImage1 from '../../resource/assets/AiExampleImage/AiExampleImage1.svg';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AiLoading from '../../component/ai/AiLoading';
import postFires from '../../utils/postFires';

interface loginInfo {
  user: {
    token: string;
  };
}

export default function AiIntroContainer() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const user = useSelector((state: loginInfo) => state.user);
  console.log(user);

  const handleGenerateClick = async () => {
    if (inputRef.current && !inputRef.current.value.trim()) {
      alert('명령어를 입력해주세요.');
      return;
    }
    if (inputRef.current) {
      sessionStorage.setItem('lastInput', inputRef.current.value); // Save input
      setIsLoading(true);
      try {
        const resultId = await postFires(inputRef.current!.value, user.token);
        navigate(`/ai/result/${resultId}`);
      } catch (error) {
        setIsLoading(false);
      }
    }
  };
  
  useEffect(() => {
    const lastInput = sessionStorage.getItem('lastInput');
    if (lastInput && inputRef.current) {
      inputRef.current.value = lastInput;
    }
  }, []);

  return (
    <>
      {isLoading ? (
        <AiLoading/>
      ) : (
        // 로딩 X
        <div className='Ai-intro-wrapper'>
          <AiIntroText />
          <div className='bottom-wrapper'>
            <img className='GlassCube' src={GlassCube}/>
            <div className='right-wrapper'>
              <div className='HowToUse-wrapper'>
                <div className='HowToUse-title-wrapper'>
                  <span className='HowToUse-title-text'>HOW TO USE</span>
                  <img className='Ai-example-image1' src={AiExampleImage1} />
                </div>
                <div className='HowToUse-line' />
                <div className='HowToUse-text'>
                  <span style={{ fontSize: '20px', lineHeight: '30px' }}>
                    1. 원하는 행동 또는 상황을 입력합니다. 예를 들어, "exercising", "studying" 등을 입력하세요.
                    <br />
                    2. 앱은 입력된 내용을 바탕으로 AI로 캐릭터 이미지를
                    생성합니다.
                    <br />
                    3. 생성된 이미지를 즐겨보세요! 필요에 따라 저장하거나 공유할
                    수 있습니다.
                    <br />
                  </span>
                </div>
              </div>
              <div className='Ai-function-wrapper'>
                <div className='Ai-input-wrapper'>
                  <div className='Ai-input-line' />
                  <input
                    ref={inputRef}
                    className='Ai-input'
                    placeholder='명령어를 입력하세요.'
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        handleGenerateClick();
                      }
                    }}
                  />
                </div>
                {user.token ? (
                  <div
                    className='Ai-generate-button'
                    onClick={handleGenerateClick}
                  >
                    생성하기
                  </div>
                ) : (
                  <div
                    className='Ai-generate-button'
                    onClick={() => navigate('/login')}
                  >
                    로그인 필요
                  </div>
                )}
              </div>
            </div>
            
          </div>
        </div>
      )}
    </>
  );
}

const AiIntroText: React.FC = () => {
  return (
    <div className='Ai-intro-text-wrapper'>
      <div className='Ai-intro-text'>
        <span style={{ fontSize: '16px', lineHeight: '20px' }}>
          <b style={{ fontSize: '20px' }}>AI 횃불이</b> 는 창의적이고
          재미있는 캐릭터를 AI로 생성하는 앱입니다.
          <br />
          <br />
          이 앱은 사용자가 입력한 특정 행동이나 상황을 바탕으로 고유한
          캐릭터 이미지를 생성합니다.
          <br />
          예를 들어, <b>사용자가 "피자를 먹는 횃불이"와 같은 명령을 입력</b>
          하면, 앱은 피자를 먹고 있는 횃불이의 이미지를 AI로 생성하여
          제공합니다.
        </span>
      </div>
      <div className='dummy-div' />
    </div>
  )
}