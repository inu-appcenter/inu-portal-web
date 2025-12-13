import { useNavigate } from "react-router-dom";

export default function useBusStopNavigate() {
  const navigate = useNavigate();

  return (id: string) => {
    navigate(`/bus/stopinfo?id=${id}`);
  };
}
