import tokenInstance from "@/apis/tokenInstance";
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
    | "SCHEDULE"
    | "NOTICE_LIST"
    | "DIRECTORY"
    | "AUTH_REQUIRED"
    | string;
  data: any;
  link?: UiComponentLink | null;
}

export interface AgentChatResponse {
  message: string;
  uiComponent?: UiComponent | null;
}

export interface AgentChatMessageHistory {
  role: "user" | "assistant";
  content: string;
}

export interface AgentChatRequest {
  message: string;
  conversationHistory?: AgentChatMessageHistory[];
}

export const postAgentChat = async (
  request: AgentChatRequest
): Promise<ApiResponse<AgentChatResponse>> => {
  const response = await tokenInstance.post<ApiResponse<AgentChatResponse>>(
    "/api/agent/chat",
    request
  );
  return response.data;
};
