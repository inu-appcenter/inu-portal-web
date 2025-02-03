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

  const mobileNavigate = (pathOrSteps: string | number) => {
    if (typeof pathOrSteps === "number") {
      if (window.AndroidBridge && window.AndroidBridge.goBack) {
        window.AndroidBridge.goBack();
      } else if (isiOS()) {
        window.history.back();
      } else {
        navigate(pathOrSteps);
      }
    } else {
      const fullPath = `${isAppUrl}${pathOrSteps}`;
      if (isAndroid() || isiOS()) {
        window.location.href = fullPath;
      } else {
        navigate(fullPath);
      }
    }
  };

  return mobileNavigate;
}
