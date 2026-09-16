import { useEffect, useMemo } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

export default function AgentPage() {
  const navigate = useNavigate();

  // Listen for INTIP_NAVIGATE messages from the standalone inu-agent-web
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (data?.type === "INTIP_NAVIGATE" && data?.url) {
          if (data.url.startsWith("tel:") || data.url.startsWith("mailto:")) {
            window.location.href = data.url;
            return;
          }
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
        }
      } catch {}
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [navigate]);

  const authToken =
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("accessToken") ||
    "";

  const resolvedAgentUrl = useMemo(() => {
    let url = import.meta.env.VITE_AGENT_WEB_URL || "https://inu-agent.inuappcenter.kr";
    if (url.includes("localhost") && window.location.hostname && window.location.hostname !== "localhost") {
      url = url.replace("localhost", window.location.hostname);
    }
    return url;
  }, []);

  const iframeSrc = `${resolvedAgentUrl}?token=${encodeURIComponent(authToken)}&client=INTIP`;

  return (
    <FullPageContainer>
      <CloseButton onClick={() => navigate(-1)} title="닫기">
        <X size={18} />
      </CloseButton>
      <IframeElement
        src={iframeSrc}
        title="INU AI Campus Assistant"
        allow="clipboard-write; clipboard-read"
      />
    </FullPageContainer>
  );
}

const FullPageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background-color: #f8faff;
  overflow: hidden;
  padding-top: var(--native-safe-area-inset-top, env(safe-area-inset-top, 0px));
  padding-bottom: var(--native-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px));
  padding-left: var(--native-safe-area-inset-left, env(safe-area-inset-left, 0px));
  padding-right: var(--native-safe-area-inset-right, env(safe-area-inset-right, 0px));
  box-sizing: border-box;
`;

const CloseButton = styled.button`
  position: absolute;
  top: calc(var(--native-safe-area-inset-top, env(safe-area-inset-top, 0px)) + 14px);
  right: calc(var(--native-safe-area-inset-right, env(safe-area-inset-right, 0px)) + 14px);
  z-index: 50;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(0, 0, 0, 0.08);
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #475569;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;

  &:hover {
    background: #ffffff;
    color: #0f172a;
    transform: scale(1.05);
  }
`;

const IframeElement = styled.iframe`
  flex: 1;
  width: 100%;
  height: 100%;
  border: none;
`;

