import { useEffect, useState } from "react";

import { usePromotion } from "@/hooks/usePromotion";
import { isAppVersionAtLeast } from "@/utils/appVersion";
import {
  promotionSeenStorage,
  type SeenPromotionId,
} from "@/utils/promotion/seenStorage";
import type { PromotionDefinition } from "@/utils/promotion/types";

interface UseFirstTimePromotionOptions {
  /** 이 안내가 지금 의미 있는 상황인지(로그인 여부, 홈 화면 여부 등) */
  enabled?: boolean;
  /** 이 버전 이상의 공식 앱에서만 띄운다. 생략하면 버전과 무관하다. */
  minAppVersion?: string;
}

/**
 * "최초 1회"만 뜨는 안내용 `usePromotion`.
 *
 * 다른 안내와 겹치지 않게 하는 중재는 프로모션 큐가 맡고, 봤는지는
 * `promotionSeenStorage`가 판정한다. 화면에 뜨는 순간 본 것으로 기록하므로
 * 앱을 바로 꺼버려도 다시 뜨지 않는다.
 */
export function useFirstTimePromotion(
  definition: PromotionDefinition,
  seenId: SeenPromotionId,
  { enabled = true, minAppVersion }: UseFirstTimePromotionOptions = {},
) {
  // 마운트 시점에 한 번만 판정한다. 노출하자마자 "봤음"으로 기록하는데,
  // 그 기록에 다시 반응하면 띄우자마자 닫혀 버린다.
  const [isTarget] = useState(
    () =>
      (minAppVersion === undefined || isAppVersionAtLeast(minAppVersion)) &&
      !promotionSeenStorage.has(seenId),
  );

  const promotion = usePromotion(definition, { enabled: enabled && isTarget });

  useEffect(() => {
    if (promotion.isVisible) {
      promotionSeenStorage.mark(seenId);
    }
  }, [promotion.isVisible, seenId]);

  return promotion;
}

export default useFirstTimePromotion;
