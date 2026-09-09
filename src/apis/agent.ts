import tokenInstance from "@/apis/tokenInstance";
import useUserStore from "@/stores/useUserStore";
import { ApiResponse } from "@/types/common";

export interface UiComponentLink {
  label: string;
  route: string;
}

export interface UiComponent {
  type:
    | "WEATHER"
    | "CAFETERIA"
    | "BUS"
    | "TIMETABLE"
    | "TIMETABLE_GAP"
    | "SCHEDULE"
    | "NOTICE_LIST"
    | "DIRECTORY"
    | "AUTH_REQUIRED"
    | "KEYWORD_CONFIRM"
    | "SETTING_RESULT"
    | "MY_SETTINGS"
    | string;
  data: any;
  link?: UiComponentLink | null;
}

export interface AgentChatResponse {
  message: string;
  uiComponent?: UiComponent | null;
  uiComponents?: UiComponent[] | null;
  suggestedActions?: string[] | null;
}

export interface AgentChatMessageHistory {
  role: "user" | "assistant";
  content: string;
}

export interface AgentChatRequest {
  message: string;
  history?: AgentChatMessageHistory[];
  conversationHistory?: AgentChatMessageHistory[];
}

export interface AgentStreamPacket {
  status?: string;
  message?: string;
  tools?: string[];
  uiComponents?: UiComponent[];
  delta?: string;
  suggestedActions?: string[];
  finishReason?: string;
}

export interface StreamAgentChatCallbacks {
  onStatus?: (status: string, message?: string) => void;
  onTools?: (tools: string[], uiComponents: UiComponent[]) => void;
  onDelta?: (delta: string) => void;
  onDone?: (suggestedActions: string[]) => void;
  onError?: (err: any) => void;
}

export const postAgentChat = async (
  request: AgentChatRequest
): Promise<ApiResponse<AgentChatResponse>> => {
  const reqBody = {
    ...request,
    history: request.history || request.conversationHistory,
  };
  const response = await tokenInstance.post<ApiResponse<AgentChatResponse>>(
    "/api/agent/chat",
    reqBody
  );
  return response.data;
};

/**
 * AI 에이전트 실시간 SSE 스트리밍 요청
 */
export const streamAgentChat = async (
  request: AgentChatRequest,
  callbacks: StreamAgentChatCallbacks
): Promise<void> => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
  const url = `${baseUrl}/api/agent/chat/stream`;

  const { accessToken } = useUserStore.getState().tokenInfo;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "text/event-stream",
  };
  if (accessToken) {
    headers["Auth"] = accessToken;
  }

  const reqBody = {
    message: request.message,
    history: request.history || request.conversationHistory || [],
  };

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(reqBody),
  });

  if (!response.ok || !response.body) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      let currentEvent = "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("event:")) {
          currentEvent = trimmed.slice(6).trim();
        } else if (trimmed.startsWith("data:")) {
          const dataStr = trimmed.slice(5).trim();
          if (!dataStr) continue;
          try {
            const packet: AgentStreamPacket = JSON.parse(dataStr);
            if (
              currentEvent === "status" ||
              packet.status === "ROUTING" ||
              packet.status === "EXECUTING" ||
              packet.status === "CHAINING" ||
              packet.status === "STREAMING"
            ) {
              callbacks.onStatus?.(packet.status || currentEvent, packet.message);
            } else if (currentEvent === "tools" || packet.status === "TOOLS") {
              callbacks.onTools?.(packet.tools || [], packet.uiComponents || []);
            } else if (currentEvent === "delta" || packet.status === "DELTA") {
              if (packet.delta) callbacks.onDelta?.(packet.delta);
            } else if (currentEvent === "done" || packet.status === "DONE") {
              callbacks.onDone?.(packet.suggestedActions || []);
            } else if (currentEvent === "error" || packet.status === "ERROR") {
              callbacks.onError?.(packet.message || "오류가 발생했습니다.");
            }
          } catch (e) {
            // non-json line
          }
        }
      }
    }
  } catch (err) {
    callbacks.onError?.(err);
    throw err;
  }
};
