import { useLocation } from "react-router-dom";
import styled from "styled-components";
import { useHeader } from "@/context/HeaderContext";
import { SHUTTLE_ROUTES } from "@/constants/bus";
import ImageWithSkeleton from "@/components/common/ImageWithSkeleton";

const MobileBusShuttleRouteInfoPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const routeId = searchParams.get("route");

  const selectedRoute = SHUTTLE_ROUTES.find((r) => r.id === routeId);

  // 헤더 설정 주입
  useHeader({
    title: `${selectedRoute?.name} 노선`,
  });

  return (
    <Wrapper>
      {selectedRoute ? (
        <ImageWithSkeleton
          src={selectedRoute.infoImage}
          alt={selectedRoute.name}
          skeletonHeight="80vh"
        />
      ) : (
        <div>노선 정보가 없습니다.</div>
      )}
    </Wrapper>
  );
};

export default MobileBusShuttleRouteInfoPage;

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 0 16px;
  box-sizing: border-box;
`;
