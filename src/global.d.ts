declare global {
  interface IntipFcmBootstrap {
    token: string;
    receivedAt: number;
  }

  interface Window {
    kakao: any;
    /**
     * react-native-webview's single message channel. Present in the new Expo
     * shell on BOTH platforms; absent in legacy native apps and browsers. This
     * is the preferred bridge — see `appBridgeAdapter.ts`.
     */
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
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
