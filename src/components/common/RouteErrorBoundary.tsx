import { useRouteError } from "react-router-dom";
import AppErrorScreen from "@/components/common/AppErrorScreen";

export default function RouteErrorBoundary() {
  const error = useRouteError();

  return <AppErrorScreen error={error} />;
}
