import { useLocation } from "react-router-dom";
import styled from "styled-components";
import { useHeader } from "@/context/HeaderContext";
import ImageWithSkeleton from "@/components/common/ImageWithSkeleton";
import { DESKTOP_MEDIA, MOBILE_PAGE_GUTTER } from "@/styles/responsive";
import { FESTIVAL_INFO, FestivalInfoType } from "@/constants/festival";
import { useEffect, useState } from "react";
import Skeleton from "@/components/common/Skeleton";
import { mixpanelTrack, trackPageView } from "@/utils/mixpanel";

interface FestivalData {
  title: string;
  description: string;
  images: readonly string[];
  embedCode: string;
}

const Festival2026DetailPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const type = searchParams.get("type") as FestivalInfoType;

  const rawInfoData = FESTIVAL_INFO[type];
  const infoData = rawInfoData
    ? (rawInfoData as unknown as FestivalData)
    : undefined;
  const [isLoadingEmbed, setIsLoadingEmbed] = useState(true); // 임베드 로딩 상태

  useHeader({
    title: infoData?.title || "상세 안내",
  });

  useEffect(() => {
    trackPageView(`[축제] - ${infoData?.title || "상세"}`);
    if (type && infoData) {
      mixpanelTrack.festivalDetailViewed(type, infoData.title);
    }
  }, [type, infoData]);

  // 페이지 진입 시 스크롤 최상단으로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.search]);

  useEffect(() => {
    if (infoData?.embedCode) {
      const scriptId = "instagram-embed-script";
      const loadInstagramScript = () => {
        if (!document.getElementById(scriptId)) {
          const script = document.createElement("script");
          script.src = "//www.instagram.com/embed.js";
          script.async = true;
          script.id = scriptId;
          document.body.appendChild(script);
          script.onload = () => {
            if ((window as any).instgrm && (window as any).instgrm.Embeds) {
              (window as any).instgrm.Embeds.process();
            }
          };
        } else {
          if ((window as any).instgrm && (window as any).instgrm.Embeds) {
            (window as any).instgrm.Embeds.process();
          }
        }
      };

      loadInstagramScript();

      // 인스타그램의 로딩 완료 이벤트를 감지
      const handleMessage = (event: MessageEvent) => {
        if (
          event.origin === "https://www.instagram.com" &&
          typeof event.data === "string"
        ) {
          try {
            const data = JSON.parse(event.data);
            // MEASURE 메시지가 오면 렌더링이 완료된 것임
            if (data.type === "MEASURE") {
              setIsLoadingEmbed(false);
              window.removeEventListener("message", handleMessage);
            }
          } catch {
            console.log("렌더링 완료 상태 감지 실패");
          }
        }
      };

      window.addEventListener("message", handleMessage);

      // 타임아웃 설정
      const timeoutId = setTimeout(() => {
        setIsLoadingEmbed(false);
        window.removeEventListener("message", handleMessage);
      }, 5000);

      return () => {
        window.removeEventListener("message", handleMessage);
        clearTimeout(timeoutId);
      };
    } else {
      setIsLoadingEmbed(false); // 임베드 코드가 없으면 로딩 상태 아님
    }
  }, [infoData?.embedCode]);

  return (
    <Wrapper>
      {infoData ? (
        <>
          {infoData.embedCode ? (
            <>
              {isLoadingEmbed && (
                <SkeletonWrapper>
                  <Skeleton
                    width="100%"
                    height="400px"
                    style={{ borderRadius: "12px" }}
                  />
                </SkeletonWrapper>
              )}
              <EmbedContainer
                dangerouslySetInnerHTML={{ __html: infoData.embedCode }}
                style={{
                  opacity: isLoadingEmbed ? 0 : 1,
                  position: isLoadingEmbed ? "absolute" : "relative",
                  pointerEvents: isLoadingEmbed ? "none" : "auto",
                  visibility: isLoadingEmbed ? "hidden" : "visible",
                }}
              />
            </>
          ) : infoData.images.length > 0 ? (
            <ImageContainer>
              {infoData.images.map((imgSrc: string, index: number) => (
                <ImageWithSkeleton
                  key={index}
                  src={imgSrc}
                  alt={`${infoData.title} 이미지 ${index + 1}`}
                  skeletonHeight="300px"
                  skeletonWidth="100%"
                />
              ))}
            </ImageContainer>
          ) : (
            <EmptyState>이미지가 준비중입니다.</EmptyState>
          )}
        </>
      ) : (
        <EmptyState>잘못된 접근이거나 정보가 없습니다.</EmptyState>
      )}
    </Wrapper>
  );
};

export default Festival2026DetailPage;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-height: 100%;
  padding: 0 ${MOBILE_PAGE_GUTTER};
  box-sizing: border-box;
  position: relative;

  @media ${DESKTOP_MEDIA} {
    padding: 0 0 80px 0;
  }
`;

const ImageContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 16px; // 이미지 사이 간격
  padding: 24px 0;

  img {
    width: 100%;
    height: auto;
    object-fit: cover;
    border-radius: 12px;
  }
`;

const EmbedContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 0;
  width: 100%;
  transition: opacity 0.3s ease-in-out;

  /* Instagram embed 기본 스타일 오버라이드 */
  .instagram-media {
    margin: 0 auto !important;
    max-width: 100% !important;
    min-width: unset !important;
    width: 100% !important;
  }

  @media ${DESKTOP_MEDIA} {
    .instagram-media {
      max-width: 500px !important;
    }
  }
`;

const SkeletonWrapper = styled.div`
  padding: 24px 0;
  width: 100%;

  @media ${DESKTOP_MEDIA} {
    max-width: 500px;
    margin: 0 auto;
  }
`;

const EmptyState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #888;
  font-size: 14px;
`;
