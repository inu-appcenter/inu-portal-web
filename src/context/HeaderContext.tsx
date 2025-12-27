import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  ReactNode,
  useId,
  useCallback,
} from "react";

// --- Types ---
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
  registerHeader: (id: string, config: HeaderConfig) => void;
  unregisterHeader: (id: string) => void;
  setHeaderConfig: (config: HeaderConfig) => void;
}

const defaultHeaderConfig: HeaderConfig = {
  title: undefined,
  hasback: true,
  showAlarm: false,
  visible: true,
  subHeader: null,
  floatingSubHeader: false,
};

// --- Context ---
const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

// --- Provider ---
export const HeaderProvider = ({ children }: { children: ReactNode }) => {
  const [headerConfig, setHeaderConfig] =
    useState<HeaderConfig>(defaultHeaderConfig);
  const activeHeaderId = useRef<string | null>(null);

  // 헤더 등록 기능
  const registerHeader = useCallback((id: string, config: HeaderConfig) => {
    console.log(config);

    activeHeaderId.current = id;
    setHeaderConfig(config);
  }, []);

  // 헤더 해제 기능 (본인 ID인 경우만)
  const unregisterHeader = useCallback((id: string) => {
    if (activeHeaderId.current === id) {
      activeHeaderId.current = null;
      setHeaderConfig(defaultHeaderConfig);
    }
  }, []);

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

  const { registerHeader, unregisterHeader, setHeaderConfig } = context;
  const id = useId();

  // 1. 등록 및 언마운트 관리 (최초 1회만 실행)
  useLayoutEffect(() => {
    if (!config) return;
    registerHeader(id, { ...defaultHeaderConfig, ...config });

    return () => {
      unregisterHeader(id); // 컴포넌트 소멸 시에만 실행
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // 2. 설정 값 변경 관리 (업데이트 시 리셋 없이 값만 교체)
  const configString = JSON.stringify({
    title: config?.title,
    hasback: config?.hasback,
    backPath: config?.backPath,
    showAlarm: config?.showAlarm,
    visible: config?.visible,
    floatingSubHeader: config?.floatingSubHeader,
  });

  useLayoutEffect(() => {
    if (!config) return;

    // 현재 이 컴포넌트가 활성 헤더인 경우에만 값 업데이트
    setHeaderConfig({ ...defaultHeaderConfig, ...config });
  }, [configString, config?.menuItems, config?.subHeader, setHeaderConfig]);

  return { setHeaderConfig: context.setHeaderConfig };
};

export const useHeaderState = () => {
  const context = useContext(HeaderContext);
  if (!context) throw new Error("HeaderProvider 미존재");
  return context.headerConfig;
};
