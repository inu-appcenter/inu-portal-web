import { useCallback, useEffect, useRef } from "react";

import usePromotionStore from "@/stores/usePromotionStore";
import type { PromotionDefinition } from "@/utils/promotion/types";

interface UsePromotionOptions {
  /**
   * 이 프로모션이 지금 의미 있는 상황인지(로그인 여부, 피처 플래그, 빈 상태 여부 등).
   * `false`면 후보에서 빠지므로 다른 프로모션에 자리를 내준다.
   */
  enabled?: boolean;
}

/**
 * 프로모션 하나를 큐에 등록하고, 지금 띄워도 되는지를 돌려준다.
 *
 * 노출/클릭 집계와 빈도 제한은 스토어가 맡으므로 호출부는 화면만 신경 쓰면 된다.
 * `definition`은 모듈 상단 상수로 두는 것을 전제로 하며, 등록은 `id` 기준으로 갱신된다.
 */
export function usePromotion(
  definition: PromotionDefinition,
  { enabled = true }: UsePromotionOptions = {},
) {
  const { id } = definition;

  const definitionRef = useRef(definition);
  definitionRef.current = definition;

  const register = usePromotionStore((store) => store.register);
  const unregister = usePromotionStore((store) => store.unregister);

  const isVisible = usePromotionStore((store) =>
    definition.surface === "ambient"
      ? store.ambientIds.includes(id)
      : store.activeId === id,
  );

  useEffect(() => {
    if (!enabled) {
      unregister(id);
      return;
    }

    register(definitionRef.current);

    return () => unregister(id);
  }, [enabled, id, register, unregister]);

  const dismiss = useCallback(() => {
    usePromotionStore.getState().dismiss(id);
  }, [id]);

  const accept = useCallback(
    (actionType: string) => {
      usePromotionStore.getState().accept(id, actionType);
    },
    [id],
  );

  const optOut = useCallback(() => {
    usePromotionStore.getState().optOut(id);
  }, [id]);

  return { isVisible, dismiss, accept, optOut };
}

export default usePromotion;
