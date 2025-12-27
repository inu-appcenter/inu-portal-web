import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  ReactNode,
  useId,
} from "react";

// --- Types (내부 사용 또는 별도 파일 분리 권장) ---
export interface MenuItemType {
  label: string;
  onClick: () => void;
}

export interface HeaderConfig {
  title?: string;
  hasback?: boolean;
  backPath?: string;
  showAlarm?: boolean;
  menuItems?: MenuItemType[];
  visible?: boolean;
  subHeader?: ReactNode;
  floatingSubHeader?: boolean;
}

interface HeaderContextType {
  headerConfig: HeaderConfig;
  setHeaderConfig: (config: HeaderConfig) => void;
  registerHeader: (id: string, config: HeaderConfig) => void;
  unregisterHeader: (id: string) => void;
}

const defaultHeaderConfig: HeaderConfig = {
  title: undefined,
  hasback: true,
  showAlarm: false,
  visible: true,
  subHeader: null,
  floatingSubHeader: false,
};

// --- Context 객체 (export 하지 않음) ---
const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

// --- Provider 컴포넌트 ---
export const HeaderProvider = ({ children }: { children: ReactNode }) => {
  const [headerConfig, setHeaderConfig] =
    useState<HeaderConfig>(defaultHeaderConfig);
  const activeHeaderId = useRef<string | null>(null);

  const registerHeader = (id: string, config: HeaderConfig) => {
    activeHeaderId.current = id;
    setHeaderConfig(config);
  };

  const unregisterHeader = (id: string) => {
    if (activeHeaderId.current === id) {
      activeHeaderId.current = null;
      setHeaderConfig(defaultHeaderConfig);
    }
  };

  return (
    <HeaderContext.Provider
      value={{
        headerConfig,
        setHeaderConfig,
        registerHeader,
        unregisterHeader,
      }}
    >
      {children}
    </HeaderContext.Provider>
  );
};

// --- Custom Hooks ---
export const useHeader = (config?: HeaderConfig) => {
  const context = useContext(HeaderContext);
  if (!context) throw new Error("HeaderProvider 미존재");

  const { registerHeader, unregisterHeader } = context;
  const id = useId();

  useLayoutEffect(() => {
    if (!config) return;

    // subHeader는 참조값으로 직접 비교
    registerHeader(id, { ...defaultHeaderConfig, ...config });

    return () => {
      unregisterHeader(id);
    };
    // 의존성 배열에 원시 값들 위주로 나열하여 변경 감지 보장
  }, [
    id,
    config?.title,
    config?.hasback,
    config?.showAlarm,
    config?.visible,
    config?.subHeader,
    config?.floatingSubHeader,
  ]);

  return { setHeaderConfig: context.setHeaderConfig };
};

export const useHeaderState = () => {
  const context = useContext(HeaderContext);
  if (!context) throw new Error("HeaderProvider 미존재");
  return context.headerConfig;
};
