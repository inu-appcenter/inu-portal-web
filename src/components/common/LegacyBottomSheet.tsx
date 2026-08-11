import React from "react";
import { BottomSheet as SpringBottomSheet } from "react-spring-bottom-sheet";
import { useSheetBackHandler } from "@/hooks/useSheetBackHandler";

type LegacyBottomSheetProps = React.ComponentProps<typeof SpringBottomSheet>;

export const BottomSheet = React.forwardRef<
  React.ElementRef<typeof SpringBottomSheet>,
  LegacyBottomSheetProps
>(function BackAwareBottomSheet({ open, onDismiss, ...props }, ref) {
  useSheetBackHandler(open, () => onDismiss?.(), Boolean(onDismiss));

  return (
    <SpringBottomSheet
      ref={ref}
      open={open}
      onDismiss={onDismiss}
      {...props}
    />
  );
});
