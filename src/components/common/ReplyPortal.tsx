import { createPortal } from "react-dom";
import { ReactNode } from "react";

interface PortalProps {
  children: ReactNode;
}

export default function ReplyPortal({ children }: PortalProps) {
  // 클라이언트 사이드 렌더링 확인
  if (typeof window === "undefined") return null;

  // DOM 최하단 배치
  return createPortal(children, document.body);
}
