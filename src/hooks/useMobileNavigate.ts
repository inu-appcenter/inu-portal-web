import { useNavigate } from "react-router-dom";
import useAppStateStore from "stores/useAppStateStore";

export default function useMobileNavigate() {
  const navigate = useNavigate();
  const { isAppUrl } = useAppStateStore();

  const mobileNavigate = (pathOrSteps: string | number) => {
    if (typeof pathOrSteps === "number") {
      if (window.AndroidBridge && window.AndroidBridge.goBack) {
        window.AndroidBridge.goBack();
      } else {
        navigate(pathOrSteps);
      }
    } else {
      const fullPath = `${isAppUrl}${pathOrSteps}`;
      if (window.AndroidBridge && window.AndroidBridge.goBack) {
        window.location.href = fullPath;
      } else {
        navigate(fullPath);
      }
    }
  };

  return mobileNavigate;
}
