import { RefObject, useEffect, useRef } from "react";
import { mixpanelTrack } from "@/utils/mixpanel";

interface Options {
  /** 지금 버튼·안내가 실제로 보이는 상태인지 (모달 열림, 선택 모드 등) */
  visible?: boolean;
  /** 넘기면 화면 안에 절반 이상 들어왔을 때만 노출로 센다(채팅 말풍선 등 스크롤 영역용) */
  ref?: RefObject<Element | null>;
  properties?: Record<string, unknown>;
}

/**
 * 친구 시간표 비교 버튼·안내 영역의 노출 이벤트. 보이는 동안 1회만 보내고,
 * 숨겨졌다가(visible=false) 다시 보이면 새 노출로 센다.
 */
export function useFriendCompareExposure(
  location: string,
  { visible = true, ref, properties }: Options = {},
) {
  const sentRef = useRef(false);
  const propertiesRef = useRef(properties);
  useEffect(() => {
    propertiesRef.current = properties;
  });

  useEffect(() => {
    if (!visible) {
      sentRef.current = false;
      return;
    }
    if (sentRef.current) return;

    const send = () => {
      if (sentRef.current) return;
      sentRef.current = true;
      mixpanelTrack.friendCompareExposed(location, propertiesRef.current);
    };

    const element = ref?.current;
    if (!element || typeof IntersectionObserver === "undefined") {
      send();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          send();
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [visible, location, ref]);
}
