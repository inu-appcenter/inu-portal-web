import mobileNavigate from "./useMobileNavigate";

export default function useBusStopNavigate() {
  const navigate = mobileNavigate();

  return (id: string) => {
    navigate(`/bus/stopinfo?id=${id}`);
  };
}
