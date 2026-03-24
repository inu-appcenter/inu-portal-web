import { Component, type ErrorInfo, type ReactNode } from "react";
import AppErrorScreen from "@/components/common/AppErrorScreen";

interface GlobalErrorBoundaryProps {
  children: ReactNode;
}

interface GlobalErrorBoundaryState {
  error: unknown;
  componentStack?: string;
}

export default class GlobalErrorBoundary extends Component<
  GlobalErrorBoundaryProps,
  GlobalErrorBoundaryState
> {
  public state: GlobalErrorBoundaryState = {
    error: null,
    componentStack: "",
  };

  public static getDerivedStateFromError(error: unknown) {
    return { error };
  }

  public componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("전역 에러 바운더리에서 오류를 감지했습니다.", error, info);
    this.setState({
      error,
      componentStack: info.componentStack ?? "",
    });
  }

  public render() {
    const { error, componentStack } = this.state;

    if (error) {
      return (
        <AppErrorScreen
          error={error}
          componentStack={componentStack}
        />
      );
    }

    return this.props.children;
  }
}
