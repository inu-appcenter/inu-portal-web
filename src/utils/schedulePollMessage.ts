import type { ChatMessage } from "@/types/chat";

/** 시간 맞추기 카드로 그릴 채팅 메시지인지. */
export const isSchedulePollMessage = (
  message: Pick<ChatMessage, "messageType">,
) =>
  message.messageType === "SCHEDULE_POLL_INVITE" ||
  message.messageType === "SCHEDULE_POLL_RESULT";
