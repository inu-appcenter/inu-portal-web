import { ROUTES } from "@/constants/routes";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

interface PreviousPages {
  [key: string]: string;
}

export function usePreviousPage() {
  const [previousPages, setPreviousPages] = useState<PreviousPages>({
    home: ROUTES.HOME,
    write: "/m/write",
    save: ROUTES.SAVE,
    mypage: ROUTES.MYPAGE.ROOT,
  });

  const location = useLocation();

  useEffect(() => {
    const path = location.pathname.split(ROUTES.ROOT)[2] || "home";
    setPreviousPages((prev) => ({
      ...prev,
      [path]: location.pathname + location.search,
    }));
  }, [location.pathname, location.search]);

  return { previousPages, setPreviousPages };
}
