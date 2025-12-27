import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

export default function useBusStopNavigate() {
  const navigate = useNavigate();

  return (id: string) => {
    navigate(`${ROUTES.BUS.STOP_INFO}?id=${id}`);
  };
}
