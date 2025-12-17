import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  ReactNode,
  useId,
} from "react";

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
};

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export const HeaderProvider = ({ children }: { children: ReactNode }) => {
  const [headerConfig, setHeaderConfig] =
    useState<HeaderConfig>(defaultHeaderConfig);
  // 현재 헤더를 제어하고 있는 컴포넌트의 ID를 추적
  const activeHeaderId = useRef<string | null>(null);

  const registerHeader = (id: string, config: HeaderConfig) => {
    activeHeaderId.current = id;
    setHeaderConfig(config);
  };

  const unregisterHeader = (id: string) => {
    // 현재 헤더 주인이 나(언마운트 되는 컴포넌트)일 때만 초기화
    // 이미 다른 페이지가 진입해서 registerHeader를 호출했다면 초기화하지 않음
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

export const useHeader = (config?: HeaderConfig) => {
  const context = useContext(HeaderContext);
  if (!context) throw new Error("HeaderProvider 미존재");

  const { registerHeader, unregisterHeader } = context;
  const id = useId(); // 컴포넌트 고유 ID 생성

  // useEffect보다 실행 시점이 빠른 useLayoutEffect 사용하여 깜빡임 방지
  useLayoutEffect(() => {
    if (config) {
      registerHeader(id, { ...defaultHeaderConfig, ...config });
    }

    return () => {
      if (config) {
        unregisterHeader(id);
      }
    };
    // config 객체 내부 값이 변할 때만 재실행
  }, [JSON.stringify(config)]);

  return { setHeaderConfig: context.setHeaderConfig };
};

export const useHeaderState = () => {
  const context = useContext(HeaderContext);
  if (!context) throw new Error("HeaderProvider 미존재");
  return context.headerConfig;
};
