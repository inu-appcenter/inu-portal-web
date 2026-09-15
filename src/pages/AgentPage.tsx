import { useEffect, useMemo } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

export default function AgentPage() {
  const navigate = useNavigate();

  // Listen for INTIP_NAVIGATE messages from the standalone inu-agent-web
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (data?.type === "INTIP_NAVIGATE" && data?.url) {
          if (data.url.startsWith("http://") || data.url.startsWith("https://")) {
            window.open(data.url, "_blank", "noopener,noreferrer");
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
      <IframeElement
        src={iframeSrc}
        title="INU AI Campus Assistant"
        allow="clipboard-write; clipboard-read"
      />
    </FullPageContainer>
  );
}

const FullPageContainer = styled.div`
  width: 100%;
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background-color: #f8faff;
  overflow: hidden;
`;

const IframeElement = styled.iframe`
  flex: 1;
  width: 100%;
  height: 100%;
  border: none;
`;

