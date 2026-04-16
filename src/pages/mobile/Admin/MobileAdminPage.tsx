import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import { ROUTES } from "@/constants/routes";
import { useHeader } from "@/context/HeaderContext";
import useUserStore from "@/stores/useUserStore";

const adminPages = [
  {
    label: "접속 유저 통계",
    path: ROUTES.ADMIN.USER_STAT,
    description: "일자별 접속 유저 통계를 확인합니다.",
  },
  {
    label: "API 사용 통계",
    path: ROUTES.ADMIN.API_STAT,
    description: "일자별 API 사용 통계를 확인합니다.",
  },
  {
    label: "푸시 알림 전송",
    path: ROUTES.ADMIN.USER_NOTIFICATIION,
    description: "사용자에게 푸시 알림을 전송합니다.",
  },
  {
    label: "Feature Flag 관리",
    path: ROUTES.ADMIN.FEATURE_FLAGS,
    description: "Feature Flag를 생성하고 상태를 변경합니다.",
  },
];

const MobileAdminPage = () => {
  const navigate = useNavigate();
  const { tokenInfo, userInfo } = useUserStore();

  useEffect(() => {
    const hasStoredToken = Boolean(localStorage.getItem("tokenInfo"));

    if (!tokenInfo.accessToken && !hasStoredToken) {
      navigate(ROUTES.HOME, { replace: true });
      return;
    }

    if (tokenInfo.accessToken && userInfo.role && userInfo.role !== "admin") {
      navigate(ROUTES.HOME, { replace: true });
    }
  }, [navigate, tokenInfo.accessToken, userInfo.role]);

  useHeader({
    title: "관리자 페이지",
  });

  return (
    <Wrapper>
      <Title>관리 기능 선택</Title>
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
  padding: 0 16px;
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
