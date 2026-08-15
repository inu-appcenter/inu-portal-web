import { useState, useCallback, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getTimeTableEvaluation,
  streamTimeTableEvaluation,
} from "@/apis/timetables";
import type { TimeTableEvaluation } from "@/types/timetables";

export const useTimeTableEvaluation = (timetableId: number | null | undefined) => {
  const queryClient = useQueryClient();
  const [evaluationText, setEvaluationText] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCached, setIsCached] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  // 1. 캐시 조회 쿼리
  const { data: cachedData, isLoading: isCacheLoading } = useQuery<TimeTableEvaluation | null>({
    queryKey: ["timetableEvaluation", timetableId],
    queryFn: () => {
      if (!timetableId) return null;
      return getTimeTableEvaluation(timetableId);
    },
    enabled: Boolean(timetableId),
    staleTime: 1000 * 60 * 5, // 5분
  });

  // 2. 평가 시작 (SSE 스트리밍)
  const startEvaluation = useCallback(
    async (forceRefresh = false) => {
      if (!timetableId) return;

      // 기존 요청이 있으면 취소
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setIsLoading(true);
      setIsStreaming(true);
      setError(null);
      setEvaluationText("");

      await streamTimeTableEvaluation(
        timetableId,
        {
          onStart: (data) => {
            setIsLoading(false);
            setIsCached(data.isCached);
          },
          onDelta: (token) => {
            setIsLoading(false);
            setEvaluationText((prev) => prev + token);
          },
          onDone: (data) => {
            setIsStreaming(false);
            setIsLoading(false);
            setIsCached(data.isCached);
            // 쿼리 캐시 갱신
            queryClient.invalidateQueries({
              queryKey: ["timetableEvaluation", timetableId],
            });
          },
          onError: (err) => {
            setIsStreaming(false);
            setIsLoading(false);
            setError(err.message || "평가 중 오류가 발생했습니다.");
          },
        },
        forceRefresh,
        abortControllerRef.current.signal,
      );
    },
    [timetableId, queryClient],
  );

  const cancelEvaluation = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setIsLoading(false);
  }, []);

  const reset = useCallback(() => {
    cancelEvaluation();
    setEvaluationText("");
    setError(null);
  }, [cancelEvaluation]);

  return {
    cachedData,
    isCacheLoading,
    evaluationText,
    isStreaming,
    isLoading,
    isCached,
    error,
    startEvaluation,
    cancelEvaluation,
    reset,
  };
};
