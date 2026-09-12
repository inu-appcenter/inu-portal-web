import { useState, useRef, useEffect, useCallback } from "react";
import {
  streamAgentChat,
  postAgentChat,
  AgentChatMessageHistory,
} from "@/apis/agent";
import { MessageItem } from "@/components/agent/ChatMessage";

const STORAGE_KEY = "intip_agent_rooms_v1";

const generateUUID = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "room-" + Date.now() + "-" + Math.random().toString(36).substring(2, 9);
};

export interface ChatRoom {
  id: string;
  title: string;
  createdAt: number;
  messages: MessageItem[];
}

export const useAgentChat = () => {
  const [rooms, setRooms] = useState<ChatRoom[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("로컬 대화방 로드 실패", e);
    }
    const initialId = generateUUID();
    return [{ id: initialId, title: "새로운 대화", createdAt: Date.now(), messages: [] }];
  });

  const [currentRoomId, setCurrentRoomId] = useState<string>(() => rooms[0]?.id || generateUUID());
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

  const abortControllerRef = useRef<AbortController | null>(null);

  // 로컬 스토리지 자동 저장
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
    } catch (e) {
      console.warn("로컬 대화방 저장 실패", e);
    }
  }, [rooms]);

  const currentRoom = rooms.find((r) => r.id === currentRoomId) || rooms[0];

  const createNewRoom = useCallback(() => {
    const newId = generateUUID();
    const newRoom: ChatRoom = {
      id: newId,
      title: "새로운 대화",
      createdAt: Date.now(),
      messages: [],
    };
    setRooms((prev) => [newRoom, ...prev]);
    setCurrentRoomId(newId);
    if (window.innerWidth <= 768) setIsSidebarOpen(false);
  }, []);

  const deleteRoom = useCallback((id: string) => {
    setRooms((prev) => {
      const filtered = prev.filter((r) => r.id !== id);
      if (filtered.length === 0) {
        const freshId = generateUUID();
        return [{ id: freshId, title: "새로운 대화", createdAt: Date.now(), messages: [] }];
      }
      return filtered;
    });
    setCurrentRoomId((prevId) => {
      if (prevId === id) {
        const remaining = rooms.filter((r) => r.id !== id);
        return remaining[0]?.id || generateUUID();
      }
      return prevId;
    });
  }, [rooms]);

  const updateRoomTitle = useCallback((id: string, title: string) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === id ? { ...r, title } : r))
    );
  }, []);

  const clearHistory = useCallback(() => {
    const freshId = generateUUID();
    setRooms([{ id: freshId, title: "새로운 대화", createdAt: Date.now(), messages: [] }]);
    setCurrentRoomId(freshId);
  }, []);

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const userMsg: MessageItem = {
        id: "msg-" + Date.now() + "-user",
        role: "user",
        content: content.trim(),
        timestamp: Date.now(),
      };

      const aiMsgId = "msg-" + Date.now() + "-ai";
      const aiInitialMsg: MessageItem = {
        id: aiMsgId,
        role: "assistant",
        content: "",
        timestamp: Date.now(),
        isStreaming: true,
        process: {
          status: "ROUTING",
          message: "질문 의도를 분석하고 캠퍼스 도구를 선별하고 있습니다...",
          tools: [],
        },
        uiComponents: [],
        suggestedActions: [],
      };

      // 대화방에 메시지 추가 및 첫 질문 시 방 제목 자동 변경
      setRooms((prev) =>
        prev.map((room) => {
          if (room.id !== currentRoomId) return room;
          const isFirstMessage = room.messages.length === 0;
          return {
            ...room,
            title: isFirstMessage ? content.slice(0, 20) : room.title,
            messages: [...room.messages, userMsg, aiInitialMsg],
          };
        })
      );

      setIsLoading(true);

      // 직전 대화 기록(최근 6턴)
      const history: AgentChatMessageHistory[] = currentRoom.messages
        .slice(-6)
        .map((m) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.content,
        }));

      try {
        await streamAgentChat(
          {
            message: content,
            history,
          },
          {
            onStatus: (status, message) => {
              setRooms((prev) =>
                prev.map((room) => {
                  if (room.id !== currentRoomId) return room;
                  const msgs = [...room.messages];
                  const lastIdx = msgs.length - 1;
                  if (lastIdx >= 0 && msgs[lastIdx].role === "assistant") {
                    const prevProc = msgs[lastIdx].process || { status };
                    msgs[lastIdx] = {
                      ...msgs[lastIdx],
                      process: {
                        ...prevProc,
                        status,
                        message: message || prevProc.message,
                      },
                    };
                  }
                  return { ...room, messages: msgs };
                })
              );
            },

            onThought: (hop, thought, tools) => {
              setRooms((prev) =>
                prev.map((room) => {
                  if (room.id !== currentRoomId) return room;
                  const msgs = [...room.messages];
                  const lastIdx = msgs.length - 1;
                  if (lastIdx >= 0 && msgs[lastIdx].role === "assistant") {
                    const prevProc = msgs[lastIdx].process || { status: "EXECUTING" };
                    msgs[lastIdx] = {
                      ...msgs[lastIdx],
                      process: {
                        ...prevProc,
                        hop,
                        thought,
                        tools: tools && tools.length > 0 ? tools : prevProc.tools,
                      },
                    };
                  }
                  return { ...room, messages: msgs };
                })
              );
            },

            onTools: (tools, uiComponents) => {
              setRooms((prev) =>
                prev.map((room) => {
                  if (room.id !== currentRoomId) return room;
                  const msgs = [...room.messages];
                  const lastIdx = msgs.length - 1;
                  if (lastIdx >= 0 && msgs[lastIdx].role === "assistant") {
                    const prevProc = msgs[lastIdx].process || { status: "EXECUTING" };
                    msgs[lastIdx] = {
                      ...msgs[lastIdx],
                      process: {
                        ...prevProc,
                        tools: tools && tools.length > 0 ? tools : prevProc.tools,
                      },
                      uiComponents: uiComponents || [],
                    };
                  }
                  return { ...room, messages: msgs };
                })
              );
            },

            onDelta: (delta) => {
              setRooms((prev) =>
                prev.map((room) => {
                  if (room.id !== currentRoomId) return room;
                  const msgs = [...room.messages];
                  const lastIdx = msgs.length - 1;
                  if (lastIdx >= 0 && msgs[lastIdx].role === "assistant") {
                    msgs[lastIdx] = {
                      ...msgs[lastIdx],
                      content: (msgs[lastIdx].content || "") + delta,
                    };
                  }
                  return { ...room, messages: msgs };
                })
              );
            },

            onDone: (suggestedActions) => {
              setRooms((prev) =>
                prev.map((room) => {
                  if (room.id !== currentRoomId) return room;
                  const msgs = [...room.messages];
                  const lastIdx = msgs.length - 1;
                  if (lastIdx >= 0 && msgs[lastIdx].role === "assistant") {
                    const prevProc = msgs[lastIdx].process || { status: "DONE" };
                    msgs[lastIdx] = {
                      ...msgs[lastIdx],
                      isStreaming: false,
                      process: {
                        ...prevProc,
                        status: "DONE",
                      },
                      suggestedActions: suggestedActions || [],
                    };
                  }
                  return { ...room, messages: msgs };
                })
              );
              setIsLoading(false);
            },

            onError: (err) => {
              console.error("에이전트 스트리밍 에러:", err);
              setRooms((prev) =>
                prev.map((room) => {
                  if (room.id !== currentRoomId) return room;
                  const msgs = [...room.messages];
                  const lastIdx = msgs.length - 1;
                  if (lastIdx >= 0 && msgs[lastIdx].role === "assistant") {
                    msgs[lastIdx] = {
                      ...msgs[lastIdx],
                      isStreaming: false,
                      content:
                        (msgs[lastIdx].content || "") +
                        "\n\n⚠️ 답변 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
                      process: {
                        status: "DONE",
                        message: "오류로 인해 중단되었습니다.",
                      },
                    };
                  }
                  return { ...room, messages: msgs };
                })
              );
              setIsLoading(false);
            },
          }
        );
      } catch (err: any) {
        console.warn("스트리밍 통신 실패, 동기식 API로 fallback 시도:", err);
        try {
          const res = await postAgentChat({
            message: content,
            history,
          });
          const data = res?.data;
          setRooms((prev) =>
            prev.map((room) => {
              if (room.id !== currentRoomId) return room;
              const msgs = [...room.messages];
              const lastIdx = msgs.length - 1;
              if (lastIdx >= 0 && msgs[lastIdx].role === "assistant") {
                const uiComponents =
                  data?.uiComponents && data.uiComponents.length > 0
                    ? data.uiComponents
                    : data?.uiComponent
                    ? [data.uiComponent]
                    : [];

                msgs[lastIdx] = {
                  ...msgs[lastIdx],
                  isStreaming: false,
                  content: data?.message || "답변을 가져왔습니다.",
                  process: {
                    status: "DONE",
                    message: "답변이 완료되었습니다.",
                  },
                  uiComponents,
                  suggestedActions: data?.suggestedActions || [],
                };
              }
              return { ...room, messages: msgs };
            })
          );
        } catch (fallbackErr: any) {
          console.error("채팅 요청 최종 실패:", fallbackErr);
          setRooms((prev) =>
            prev.map((room) => {
              if (room.id !== currentRoomId) return room;
              const msgs = [...room.messages];
              const lastIdx = msgs.length - 1;
              if (lastIdx >= 0 && msgs[lastIdx].role === "assistant") {
                msgs[lastIdx] = {
                  ...msgs[lastIdx],
                  isStreaming: false,
                  content:
                    "⚠️ 네트워크 연결 또는 서버 응답에 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
                  process: {
                    status: "DONE",
                    message: "연결 오류로 중단되었습니다.",
                  },
                };
              }
              return { ...room, messages: msgs };
            })
          );
        } finally {
          setIsLoading(false);
        }
      }
    },
    [currentRoom, currentRoomId, isLoading]
  );

  return {
    rooms: rooms.map((r) => ({ id: r.id, title: r.title, createdAt: r.createdAt })),
    currentRoom,
    currentRoomId,
    setCurrentRoomId,
    isLoading,
    isSidebarOpen,
    setIsSidebarOpen,
    createNewRoom,
    deleteRoom,
    updateRoomTitle,
    clearHistory,
    stopGeneration,
    sendMessage,
  };
};
