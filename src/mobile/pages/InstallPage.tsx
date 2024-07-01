import { useEffect, useState } from 'react';
import styled from 'styled-components';
import logoWithText from '../../resource/assets/mobile/login/logo-with-text.svg';

export default function InstallPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: any) => {
      console.log('beforeinstallprompt event triggered');
      event.preventDefault();
      setDeferredPrompt(event);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        setDeferredPrompt(null);
      });
    } else {
      alert('설치 프롬프트를 사용할 수 없습니다.');
    }
  };

  return (
    <InstallPageWrapper>
      <IntroImage src={logoWithText} />
      <h1>앱 설치하기</h1>
      <div style={{ marginTop: 20 }}>
        <h2>설치 단계:</h2>
        <ol>
          <li>Chromium 기반 브라우저(예: Google Chrome)를 사용하고 있는지 확인하세요.</li>
          <li>
            설치 버튼이 활성화되면 클릭하여 설치 과정을 시작하세요.
          </li>
          <li>프롬프트를 따라 앱을 홈 화면에 추가하세요.</li>
        </ol>
      </div>
      <button onClick={handleInstallClick}>앱 설치</button>
    </InstallPageWrapper>
  );
};

const InstallPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const IntroImage = styled.img`
  width: 75%;
`;
