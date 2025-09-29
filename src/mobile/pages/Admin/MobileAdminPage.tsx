import styled from "styled-components";
import useUserStore from "../../../stores/useUserStore.ts";
import { useEffect } from "react";
import useMobileNavigate from "../../../hooks/useMobileNavigate.ts";
import MobileHeader from "../../containers/common/MobileHeader.tsx";

const MobileAdminPage: React.FC = () => {
  const mobilenavigate = useMobileNavigate();
  const { tokenInfo, userInfo } = useUserStore();

  useEffect(() => {
    console.log(userInfo.role === "admin");
    if (!tokenInfo.accessToken || !(userInfo.role === "admin")) {
      mobilenavigate("/home");
    }
  }, [tokenInfo, userInfo]);

  // 관리자 페이지 목록
  const adminPages = [
    {
      label: "접속 유저 통계",
      path: "/admin/userstatistics",
      description: "일자별로 접속한 유저 통계를 볼 수 있어요.",
    },
    {
      label: "서비스 사용 통계",
      path: "/admin/apistatistics",
      description: "일자별로 API 요청 횟수 통계를 볼 수 있어요.",
    },
  ];

  return (
    <Wrapper>
      <MobileHeader title={"관리자 페이지"} />
      <Title>관리자 기능 선택</Title>
      <MenuGrid>
        {adminPages.map((page) => (
          <MenuCard key={page.path} onClick={() => mobilenavigate(page.path)}>
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
