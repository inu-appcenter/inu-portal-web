import {
  createContext,
  useContext,
  useLayoutEffect,
  useState,
  ReactNode,
  useCallback,
  useRef,
} from "react";
import { useLocation } from "react-router-dom";

// --- Types ---
export interface MenuItemType {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
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
  pageBgColor?: string; // 전역 페이지 배경색 지정 속성
  immersive?: boolean; // 상하단 물리 패딩을 제거하고 풀-스크린을 쓸지 여부
  rightAreaNotCircle?: boolean; // 우측 버튼 영역을 단일 원이 아닌 알약 형태(auto)로 렌더링할지 여부
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
  pageBgColor: undefined,
  immersive: false,
  rightAreaNotCircle: undefined,
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

        const isMenuSame =
          prevMenu === newMenu ||
          (Array.isArray(prevMenu) &&
            Array.isArray(newMenu) &&
            prevMenu.length === newMenu.length &&
            prevMenu.every(
              (item, i) =>
                item.label === newMenu[i].label &&
                item.onClick?.toString() === newMenu[i].onClick?.toString(),
            ));

        const isOnBackSame = prevOnBack === newOnBack;

        // 3. 나머지 단순 값(문자열, 불리언)만 JSON 문자열로 비교
        if (
          prevSub === newSub &&
          isMenuSame &&
          isOnBackSame &&
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
  const latestOnBackRef = useRef(config?.onBack);
  latestOnBackRef.current = config?.onBack;
  const stableOnBack = useCallback(() => latestOnBackRef.current?.(), []);

  const configString = JSON.stringify({
    hasback: config?.hasback,
    backPath: config?.backPath,
    showAlarm: config?.showAlarm,
    visible: config?.visible,
    floatingSubHeader: config?.floatingSubHeader,
    pageBgColor: config?.pageBgColor,
    immersive: config?.immersive,
    rightAreaNotCircle: config?.rightAreaNotCircle,
  });

  const menuString = config?.menuItems
    ? config.menuItems.map((m) => `${m.label}:${m.onClick?.toString()}`).join("|")
    : "";
  useLayoutEffect(() => {
    if (!config) return;
    updateHeaderConfig(currentPath, {
      ...defaultHeaderConfig,
      ...config,
      onBack: config.onBack ? stableOnBack : undefined,
    });
  }, [
    currentPath,
    configString,
    menuString,
    stableOnBack,
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
