import { useLocation, useNavigate } from "react-router-dom";
import useAppStateStore from "stores/useAppStateStore";

export default function useMobileNavigate() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAppUrl } = useAppStateStore();

  const mobileNavigate = (path: string) => {
    const currentPathname = location.pathname;
    const currentSearch = location.search;
    const [newPathname, newSearch] = path.split("?");

    if (window.AndroidBridge && window.AndroidBridge.navigateTo) {
      if (currentPathname === newPathname) {
        if (currentSearch !== `?${newSearch}`) {
          navigate(`${isAppUrl}${path}`);
        }
      } else {
        window.location.href = `${isAppUrl}${path}`;
      }
    } else {
      navigate(`${isAppUrl}${path}`);
    }
  };

  return mobileNavigate;
}
