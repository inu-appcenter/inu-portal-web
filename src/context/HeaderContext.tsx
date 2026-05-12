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
  title?: ReactNode;
  hasback?: boolean;
  backPath?: string;
  onBack?: () => void;
  showAlarm?: boolean;
  menuItems?: MenuItemType[];
  rightArea?: ReactNode; // 추가
  visible?: boolean;
  subHeader?: ReactNode;
  floatingSubHeader?: boolean;
}

type HeaderConfigMap = Record<string, HeaderConfig>;

interface HeaderStateContextType {
  headerConfigs: HeaderConfigMap;
  isScrolled: boolean;
}

interface HeaderActionContextType {
  updateHeaderConfig: (path: string, config: HeaderConfig) => void;
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

const HeaderStateContext = createContext<HeaderStateContextType | undefined>(
  undefined,
);
const HeaderActionContext = createContext<HeaderActionContextType | undefined>(
  undefined,
);

// --- Provider ---
export const HeaderProvider = ({ children }: { children: ReactNode }) => {
  const [headerConfigs, setHeaderConfigs] = useState<HeaderConfigMap>({});
  const [isScrolled, setIsScrolled] = useState(false);

  // 경로별 업데이트
  const updateHeaderConfig = useCallback(
    (path: string, config: HeaderConfig) => {
      setHeaderConfigs((prev) => {
        const prevConfig = prev[path];

        // 1. 이전 설정이 없으면 무조건 업데이트
        if (!prevConfig) {
          return { ...prev, [path]: config };
        }

        // 2. 안전한 비교를 위해 ReactNode와 함수를 제외하고 비교
        const {
          subHeader: prevSub,
          menuItems: prevMenu,
          onBack: prevOnBack,
          rightArea: prevRightArea,
          title: prevTitle,
          ...prevRest
        } = prevConfig;
        const {
          subHeader: newSub,
          menuItems: newMenu,
          onBack: newOnBack,
          rightArea: newRightArea,
          title: newTitle,
          ...newRest
        } = config;

        // 3. 나머지 단순 값(문자열, 불리언)만 JSON 문자열로 비교
        if (
          prevSub === newSub &&
          prevMenu === newMenu &&
          prevOnBack === newOnBack &&
          prevRightArea === newRightArea &&
          prevTitle === newTitle &&
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
    <HeaderStateContext.Provider
      value={{
        headerConfigs,
        isScrolled,
      }}
    >
      <HeaderActionContext.Provider
        value={{
          updateHeaderConfig,
          setIsScrolled,
        }}
      >
        {children}
      </HeaderActionContext.Provider>
    </HeaderStateContext.Provider>
  );
};

// --- Custom Hooks ---

export const useHeader = (config?: HeaderConfig) => {
  const context = useContext(HeaderActionContext);
  if (!context) throw new Error("HeaderProvider 미존재");

  const { updateHeaderConfig } = context;
  const location = useLocation();
  const currentPath = location.pathname;

  const configString = JSON.stringify({
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
    config?.menuItems,
    config?.onBack,
    config?.subHeader,
    config?.rightArea,
    config?.title,
    updateHeaderConfig,
  ]);
};

export const useHeaderConfig = (path?: string) => {
  const stateContext = useContext(HeaderStateContext);
  const actionContext = useContext(HeaderActionContext);
  const location = useLocation();

  if (!stateContext || !actionContext) throw new Error("HeaderProvider 미존재");

  const targetPath = path || location.pathname;
  const config = stateContext.headerConfigs[targetPath] || defaultHeaderConfig;

  return {
    ...config,
    isScrolled: stateContext.isScrolled,
    setIsScrolled: actionContext.setIsScrolled,
  };
};

export const useHeaderState = () => useHeaderConfig();
