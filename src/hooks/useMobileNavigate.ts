import { useNavigate } from "react-router-dom";
import useAppStateStore from "stores/useAppStateStore";

export default function useMobileNavigate() {
  const navigate = useNavigate();
  const { isAppUrl } = useAppStateStore();

  const isAndroid = () => {
    return window.AndroidBridge && window.AndroidBridge.goBack;
  };

  const isiOS = () => {
    return /iphone|ipad/i.test(navigator.userAgent) && isAppUrl === "/app";
  };

  const mobileNavigate = (
    pathOrSteps: string | number,
    options?: { replace?: boolean; state?: any },
  ) => {
    if (typeof pathOrSteps === "number") {
      if (window.AndroidBridge && window.AndroidBridge.goBack) {
        window.AndroidBridge.goBack();
      } else if (isiOS()) {
        window.history.go(pathOrSteps);
      } else {
        navigate(pathOrSteps);
      }
    } else {
      const fullPath = `${isAppUrl}${pathOrSteps}`;
      if (isAndroid() || isiOS()) {
        if (options?.replace) {
          window.location.replace(fullPath); // 스택 제거 이동
        } else {
          window.location.href = fullPath; // 일반 이동
        }
      } else {
        navigate(fullPath, {
          replace: options?.replace ?? false,
          state: options?.state,
        });
      }
    }
  };

  return mobileNavigate;
}
