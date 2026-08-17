import type { RefObject } from "react";

import TooltipMessage, {
  type TooltipAlign,
  type TooltipPosition,
} from "@/components/common/TooltipMessage";
import { usePromotion } from "@/hooks/usePromotion";
import type { PromotionDefinition } from "@/utils/promotion/types";

interface PromotionTooltipProps {
  promotion: PromotionDefinition;
  message: string;
  /** 이 안내가 지금 의미 있는 상황인지. 기본값 `true` */
  enabled?: boolean;
  anchorRef?: RefObject<HTMLElement | null>;
  position?: TooltipPosition;
  align?: TooltipAlign;
  width?: string;
  minWidth?: string;
}

/**
 * 빈도 제한이 적용된 툴팁. 노출 여부와 집계는 프로모션 큐가 결정한다.
 *
 * 목록을 돌면서 여러 개를 거는 경우처럼 훅을 직접 부를 수 없는 자리에 쓴다.
 * 노출 여부에 따라 바깥 레이아웃까지 바꿔야 한다면 `usePromotion`을 직접 쓰는 편이 낫다.
 */
export default function PromotionTooltip({
  promotion,
  message,
  enabled,
  anchorRef,
  position,
  align,
  width,
  minWidth,
}: PromotionTooltipProps) {
  const { isVisible, dismiss } = usePromotion(promotion, { enabled });

  if (!isVisible) {
    return null;
  }

  return (
    <TooltipMessage
      message={message}
      onClose={dismiss}
      position={position}
      align={align}
      width={width}
      minWidth={minWidth}
      anchorRef={anchorRef}
    />
  );
}
