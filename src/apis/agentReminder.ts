import tokenInstance from "@/apis/tokenInstance";
import type { ApiResponse } from "@/types/common";
import type {
  AgentReminder,
  AgentReminderUpdateRequest,
} from "@/types/agentReminder";

/**
 * 내 AI 맞춤 알림 목록 조회
 */
export const getAgentReminders = async (): Promise<
  ApiResponse<AgentReminder[]>
> => {
  const response = await tokenInstance.get<ApiResponse<AgentReminder[]>>(
    "/api/agent/reminders",
  );
  return response.data;
};

/**
 * AI 맞춤 알림 설정 수정 (시간, 이름 등)
 */
export const updateAgentReminder = async (
  id: number,
  req: AgentReminderUpdateRequest,
): Promise<ApiResponse<AgentReminder>> => {
  const response = await tokenInstance.patch<ApiResponse<AgentReminder>>(
    `/api/agent/reminders/${id}`,
    req,
  );
  return response.data;
};

/**
 * AI 맞춤 알림 On/Off 토글
 */
export const toggleAgentReminder = async (
  id: number,
  enabled: boolean,
): Promise<ApiResponse<AgentReminder>> => {
  const response = await tokenInstance.patch<ApiResponse<AgentReminder>>(
    `/api/agent/reminders/${id}/toggle?enabled=${enabled}`,
  );
  return response.data;
};

/**
 * AI 맞춤 알림 삭제
 */
export const deleteAgentReminder = async (
  id: number,
): Promise<ApiResponse<void>> => {
  const response = await tokenInstance.delete<ApiResponse<void>>(
    `/api/agent/reminders/${id}`,
  );
  return response.data;
};
