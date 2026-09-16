import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { resolveClientContext, executeAgentActionBridge } from "@/apis/mobileAgentBridge";

interface UseAgentBridgeOptions {
  onClose?: () => void;
}

export function useAgentBridge(options?: UseAgentBridgeOptions) {
  const navigate = useNavigate();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isPortalModalOpen, setIsPortalModalOpen] = useState(false);
  const pendingContextPromiseRef = useRef<Promise<Record<string, any>> | null>(null);
  const cachedClientContextRef = useRef<Record<string, any> | null>(null);

  const sendClientContextToIframe = useCallback(async (forceRefresh = false) => {
    try {
      if (cachedClientContextRef.current && !forceRefresh) {
        iframeRef.current?.contentWindow?.postMessage(
          {
            type: "INTIP_CLIENT_CONTEXT",
            clientContext: cachedClientContextRef.current,
          },
          "*"
        );
        return cachedClientContextRef.current;
      }

      // 이미 스크래핑/컨텍스트 조회가 진행 중이면 해당 프로미스를 공유 (스크래퍼 충돌 방지)
      if (!pendingContextPromiseRef.current || forceRefresh) {
        pendingContextPromiseRef.current = resolveClientContext().finally(() => {
          pendingContextPromiseRef.current = null;
        });
      }

      const clientContext = await pendingContextPromiseRef.current;
      cachedClientContextRef.current = clientContext;

      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          {
            type: "INTIP_CLIENT_CONTEXT",
            clientContext,
          },
          "*"
        );
      }
      return clientContext;
    } catch (err) {
      console.warn("[useAgentBridge] Failed to resolve client context:", err);
      return {};
    }
  }, []);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (!data || typeof data !== "object") return;

        if (data.type === "INTIP_NAVIGATE" && data.url) {
          if (data.url.startsWith("tel:") || data.url.startsWith("mailto:")) {
            window.location.href = data.url;
            return;
          }
          options?.onClose?.();
          if (data.url.startsWith("http://") || data.url.startsWith("https://")) {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(
                JSON.stringify({ type: "openUrl", payload: { url: data.url } })
              );
            } else {
              window.open(data.url, "_blank", "noopener,noreferrer");
            }
          } else {
            navigate(data.url);
          }
        } else if (data.type === "OPEN_PORTAL_ACCOUNT_MODAL" || data.type === "openPortalAccountModal") {
          setIsPortalModalOpen(true);
        } else if (data.type === "GET_CLIENT_CONTEXT") {
          sendClientContextToIframe();
        } else if (data.type === "EXECUTE_AGENT_ACTION" && data.instruction) {
          console.log("[useAgentBridge] Relaying action to native bridge:", data.instruction);
          const result = await executeAgentActionBridge(data.instruction);
          if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage(
              {
                type: "AGENT_ACTION_RESULT",
                requestId: data.requestId,
                result,
              },
              "*"
            );
          }
        }
      } catch {}
    };

    const handleCustomPortalEvent = () => {
      setIsPortalModalOpen(true);
    };

    window.addEventListener("message", handleMessage);
    window.addEventListener("openPortalAccountModal", handleCustomPortalEvent);
    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("openPortalAccountModal", handleCustomPortalEvent);
    };
  }, [navigate, options, sendClientContextToIframe]);

  return {
    iframeRef,
    isPortalModalOpen,
    setIsPortalModalOpen,
    sendClientContextToIframe,
  };
}
