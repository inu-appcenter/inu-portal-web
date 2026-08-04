import { useEffect, useState } from "react";

const KAKAO_MAP_SCRIPT_ID = "kakao-map-script";
const APP_KEY = "2c47e11928ed2d4c2829fa7dfabb59f8";

export function useKakaoMapLoader() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // 1. 이미 kakao.maps가 전역 공간에 성공적으로 로드된 경우 바로 완료
    if (window.kakao?.maps) {
      setLoading(false);
      return;
    }

    // 2. 이미 엘리먼트가 스크립트 태그로 삽입되어 로딩 중인지 확인
    let script = document.getElementById(KAKAO_MAP_SCRIPT_ID) as HTMLScriptElement;

    if (!script) {
      // 3. 존재하지 않는다면 새롭게 script 엘리먼트 동적 생성 및 주입
      script = document.createElement("script");
      script.id = KAKAO_MAP_SCRIPT_ID;
      script.type = "text/javascript";
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${APP_KEY}&libraries=services,clusterer,drawing&autoload=false`;
      script.async = true;
      document.head.appendChild(script);
    }

    const onLoad = () => {
      // 4. autoload=false인 경우 전역 kakao.maps.load를 반드시 트리거해야 지도 생성 가능
      if (window.kakao?.maps) {
        window.kakao.maps.load(() => {
          setLoading(false);
        });
      } else {
        setError(true);
        setLoading(false);
      }
    };

    const onError = () => {
      setError(true);
      setLoading(false);
    };

    // 5. 스크립트 로드 및 에러 핸들러 부착
    script.addEventListener("load", onLoad);
    script.addEventListener("error", onError);

    // 6. 만약 이미 script가 로드 완료된 상태였는데 state만 초기화 전이었던 케이스 방어
    // (예: 컴포넌트 언마운트 후 재마운트 등)
    if (window.kakao?.maps) {
      window.kakao.maps.load(() => {
        setLoading(false);
      });
    }

    return () => {
      script.removeEventListener("load", onLoad);
      script.removeEventListener("error", onError);
    };
  }, []);

  return { loading, error };
}
