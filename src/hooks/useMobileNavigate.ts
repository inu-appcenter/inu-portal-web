import { useNavigate } from "react-router-dom";
import useAppStateStore from "stores/useAppStateStore";

export default function useMobileNavigate() {
  const navigate = useNavigate();
  const { isAppUrl } = useAppStateStore();

  const mobileNavigate = (path: string) => {
    if (window.AndroidBridge && window.AndroidBridge.navigateTo) {
      window.location.href = `${isAppUrl}${path}`;
    } else {
      navigate(`${isAppUrl}${path}`);
    }
  };

  return mobileNavigate;
}
