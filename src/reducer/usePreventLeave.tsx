import { useEffect } from "react";

const usePreventLeave = () => {
  const listener = (event: BeforeUnloadEvent) => {
    event.preventDefault();
    event.returnValue = "";
  };

  const enablePrevent = () => window.addEventListener("beforeunload", listener);
  const disablePrevent = () =>
    window.removeEventListener("beforeunload", listener);

  useEffect(() => {
    enablePrevent();
    return disablePrevent;
  }, []);
};

export default usePreventLeave;
