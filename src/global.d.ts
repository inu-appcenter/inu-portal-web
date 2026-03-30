declare global {
  interface IntipFcmBootstrap {
    token: string;
    receivedAt: number;
  }

  interface Window {
    kakao: any;
    AndroidBridge?: {
      navigateTo?: (destination: string, url: string) => void;
      goBack?: () => void;
      handleLogout?: () => void;
    };
    onReceiveFcmToken?: ((token: string) => void) | null;
    __INTIP_FCM_BOOTSTRAP__?: IntipFcmBootstrap;
    webkit?: {
      messageHandlers?: Record<string, { postMessage: (message: unknown) => void }>;
    };
  }
}

export {};
