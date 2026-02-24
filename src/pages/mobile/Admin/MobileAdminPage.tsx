import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import styled from "styled-components";
import useUserStore from "../../../stores/useUserStore.ts";
import { useEffect } from "react";
import MobileHeader from "../../../containers/mobile/common/MobileHeader.tsx";
import { useHeader } from "@/context/HeaderContext";

const MobileAdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { tokenInfo, userInfo, isLoading } = useUserStore();

  useEffect(() => {
    // isLoading이 false일 때만 다음 로직 실행
    if (!isLoading) {
      console.log(userInfo && userInfo.role === "admin");
      if (!tokenInfo.accessToken || !(userInfo && userInfo.role === "admin")) {
        navigate(ROUTES.HOME);
      }
    }
  }, [tokenInfo, userInfo, isLoading]);

  // 관리자 페이지 목록
  const adminPages = [
    {
      label: "접속 유저 통계",
      path: ROUTES.ADMIN.USER_STAT,
      description: "일자별로 접속한 유저 통계를 볼 수 있어요.",
    },
    {
      label: "서비스 사용 통계",
      path: ROUTES.ADMIN.API_STAT,
      description: "일자별로 API 요청 횟수 통계를 볼 수 있어요.",
    },
    {
      label: "푸시 알림 전송",
      path: "/admin/notification",
      description: "유저에게 푸시알림을 보낼 수 있어요.",
    },
  ];

  // 헤더 설정 주입
  useHeader({
    title: "관리자 페이지",
  });

  return (
    <Wrapper>
      <MobileHeader />
      <Title>관리자 기능 선택</Title>
      <MenuGrid>
        {adminPages.map((page) => (
          <MenuCard key={page.path} onClick={() => navigate(page.path)}>
            <CardTitle>{page.label}</CardTitle>
            <CardDescription>{page.description}</CardDescription>
          </MenuCard>
        ))}
      </MenuGrid>
    </Wrapper>
  );
};

export default MobileAdminPage;

export const Wrapper = styled.div`
  padding: 30px 16px;
  padding-top: 80px;
  box-sizing: border-box;
  max-width: 800px;
  margin: 0 auto;

  width: 100%;
`;

const Title = styled.h2`
  margin-bottom: 20px;
  font-weight: 700;
  font-size: 1.5rem;
  color: #333;
`;

const MenuGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
`;

const MenuCard = styled.div`
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: #e9ecef;
    box-shadow: 0 0 12px rgba(0, 0, 0, 0.15);
  }
`;

const CardTitle = styled.h3`
  margin: 0 0 10px 0;
  font-weight: 600;
  font-size: 1.2rem;
  color: #222;
`;

const CardDescription = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: #555;
`;
