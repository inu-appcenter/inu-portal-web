import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

//접속 기기가 모바일인 경우 모바일 페이지로 리다이렉트
const RouteRedirector = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    if (isMobile && window.location.pathname !== "/m/home") {
      navigate("/m/home");
    }
  }, [navigate]);

  return null;
};

export default RouteRedirector;
