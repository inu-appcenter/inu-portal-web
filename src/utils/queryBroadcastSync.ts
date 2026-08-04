import type { QueryClient, QueryKey } from "@tanstack/react-query";
import { openMultiWebViewChannel } from "@/utils/multiWebViewChannel";

type QueryBroadcastMessage =
  | { type: "updated"; queryKey: QueryKey; data: unknown; dataUpdatedAt: number }
  | { type: "removed"; queryKey: QueryKey };

/**
 * 같은 오리진의 다른 웹뷰/탭과 TanStack Query 캐시를 동기화한다(전송은
 * openMultiWebViewChannel의 BroadcastChannel + 네이티브 브릿지 릴레이 이중
 * 경로). 한 웹뷰에서 성공적으로 패치된 쿼리 데이터를 다른 웹뷰에도 즉시
 * 반영해, 화면 전환 시(무한 스크롤 리스트로 돌아오는 경우 등) 불필요한
 * 리패치 없이도 최신 상태를 보여준다. 실험적인 @tanstack/query-broadcast-client
 * 대신, 필요한 "성공 데이터 반영/제거"만 직접 구현한다.
 */
export function attachQueryBroadcastSync(
  queryClient: QueryClient,
  name = "query-cache-sync",
): () => void {
  // 원격 메시지를 캐시에 반영하는 동안에는 그 반영으로 발생하는 'updated'
  // 이벤트를 다시 내보내지 않도록 막아 핑퐁 루프를 방지한다.
  let applyingRemote = false;

  const channel = openMultiWebViewChannel(name, (data) => {
    const message = data as QueryBroadcastMessage;
    applyingRemote = true;
    try {
      if (message.type === "updated") {
        const current = queryClient.getQueryState(message.queryKey);
        if (current && current.dataUpdatedAt >= message.dataUpdatedAt) return;
        queryClient.setQueryData(message.queryKey, message.data, {
          updatedAt: message.dataUpdatedAt,
        });
      } else {
        queryClient.removeQueries({ queryKey: message.queryKey, exact: true });
      }
    } finally {
      applyingRemote = false;
    }
  });

  const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
    if (applyingRemote) return;

    if (event.type === "updated" && event.action.type === "success") {
      if (event.query.state.data === undefined) return;
      channel.postMessage({
        type: "updated",
        queryKey: event.query.queryKey,
        data: event.query.state.data,
        dataUpdatedAt: event.query.state.dataUpdatedAt,
      } satisfies QueryBroadcastMessage);
      return;
    }

    if (event.type === "removed") {
      channel.postMessage({
        type: "removed",
        queryKey: event.query.queryKey,
      } satisfies QueryBroadcastMessage);
    }
  });

  return () => {
    unsubscribe();
    channel.close();
  };
}
