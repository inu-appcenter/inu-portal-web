import {
  createContext,
  useContext,
  useLayoutEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { useLocation } from "react-router-dom";

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

type HeaderConfigMap = Record<string, HeaderConfig>;

interface HeaderContextType {
  getHeaderConfig: (path: string) => HeaderConfig;
  updateHeaderConfig: (path: string, config: HeaderConfig) => void;
  isScrolled: boolean;
  setIsScrolled: (scrolled: boolean) => void;
}

const defaultHeaderConfig: HeaderConfig = {
  title: undefined,
  hasback: true,
  showAlarm: false,
  visible: true,
  subHeader: null,
  floatingSubHeader: false,
};

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

// --- Provider ---
export const HeaderProvider = ({ children }: { children: ReactNode }) => {
  const [headerConfigs, setHeaderConfigs] = useState<HeaderConfigMap>({});
  const [isScrolled, setIsScrolled] = useState(false);

  // 경로별 조회
  const getHeaderConfig = useCallback(
    (path: string) => {
      return headerConfigs[path] || defaultHeaderConfig;
    },
    [headerConfigs],
  );

  // 경로별 업데이트
  const updateHeaderConfig = useCallback(
    (path: string, config: HeaderConfig) => {
      setHeaderConfigs((prev) => {
        const prevConfig = prev[path];

        // 1. 이전 설정이 없으면 무조건 업데이트
        if (!prevConfig) {
          return { ...prev, [path]: config };
        }

        // 2. 안전한 비교를 위해 ReactNode(subHeader)와 함수(menuItems)를 제외하고 비교
        // (이 부분이 에러를 해결하는 핵심입니다)
        const {
          subHeader: prevSub,
          menuItems: prevMenu,
          ...prevRest
        } = prevConfig;
        const { subHeader: newSub, menuItems: newMenu, ...newRest } = config;

        // 3. 나머지 단순 값(문자열, 불리언)만 JSON 문자열로 비교
        // subHeader와 menuItems는 참조값(===)으로 비교
        if (
          prevSub === newSub &&
          prevMenu === newMenu &&
          JSON.stringify(prevRest) === JSON.stringify(newRest)
        ) {
          return prev; // 변경사항 없으면 리렌더링 방지
        }

        return { ...prev, [path]: config };
      });
    },
    [],
  );

  return (
    <HeaderContext.Provider
      value={{
        getHeaderConfig,
        updateHeaderConfig,
        isScrolled,
        setIsScrolled,
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

  const { updateHeaderConfig } = context;
  const location = useLocation();
  const currentPath = location.pathname;

  // subHeader는 stringify에서 제외해야 함
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
    updateHeaderConfig(currentPath, { ...defaultHeaderConfig, ...config });
  }, [
    currentPath,
    configString,
    config?.menuItems, // 참조값 비교
    config?.subHeader, // 참조값 비교
    updateHeaderConfig,
  ]);
};

export const useHeaderConfig = (path?: string) => {
  const context = useContext(HeaderContext);
  const location = useLocation();
  if (!context) throw new Error("HeaderProvider 미존재");

  const targetPath = path || location.pathname;

  return {
    ...context.getHeaderConfig(targetPath),
    isScrolled: context.isScrolled,
    setIsScrolled: context.setIsScrolled,
  };
};

export const useHeaderState = () => useHeaderConfig();
