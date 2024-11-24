import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

interface PreviousPages {
  [key: string]: string;
}

export function usePreviousPage() {
  const [previousPages, setPreviousPages] = useState<PreviousPages>({
    home: "/m/home",
    write: "/m/write",
    save: "/m/save",
    mypage: "/m/mypage",
  });

  const location = useLocation();

  useEffect(() => {
    const path = location.pathname.split("/")[2] || "home";
    setPreviousPages((prev) => ({
      ...prev,
      [path]: location.pathname + location.search,
    }));
  }, [location.pathname, location.search]);

  return { previousPages, setPreviousPages };
}
