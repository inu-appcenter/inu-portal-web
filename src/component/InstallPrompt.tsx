import { useEffect, useState } from 'react';

const InstallPrompt = () => {
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
      alert('Install prompt not available');
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: 10, right: 10 }}>
      <button onClick={handleInstallClick}>Install App</button>
    </div>
  );
};

export default InstallPrompt;
