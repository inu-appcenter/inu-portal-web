import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes"; // ROUTES 경로 확인 필요
import 장학금 from "@/resources/assets/tips/장학금.svg";
import 도서관 from "@/resources/assets/tips/도서관.svg";
import 수강신청 from "@/resources/assets/tips/수강신청.svg";
import 기숙사 from "@/resources/assets/tips/기숙사.svg";
import CapsuleButton from "@/components/mobile/common/CapsuleButton";

const TipsWidget = () => {
  const navigate = useNavigate();

  // 버튼 데이터 구성
  const tipsItems = [
    { title: "장학금", description: "국가 장학금, 성적 장학금", icon: 장학금 },
    { title: "학산도서관", description: "이용 방법, 출입 등록", icon: 도서관 },
    { title: "수강신청", description: "장바구니, 시간표 짜기", icon: 수강신청 },
    { title: "기숙사", description: "입퇴사, 유니돔", icon: 기숙사 },
  ];

  // 카테고리 페이지 이동 함수
  const handleCategoryClick = (title: string) => {
    navigate(`${ROUTES.BOARD.TIPS}?category=${title}`);
  };

  return (
    <TipsWidgetWrapper>
      {tipsItems.map((item) => (
        <CapsuleButton
          key={item.title}
          title={item.title}
          description={item.description}
          iconSrc={item.icon}
          onClick={() => handleCategoryClick(item.title)}
        />
      ))}
    </TipsWidgetWrapper>
  );
};

export default TipsWidget;

const TipsWidgetWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  align-self: stretch;
`;
