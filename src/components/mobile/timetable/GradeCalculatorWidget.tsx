import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import 장학금 from "@/resources/assets/tips/장학금.svg";
import 도서관 from "@/resources/assets/tips/도서관.svg";
import 수강신청 from "@/resources/assets/tips/수강신청.svg";
import CapsuleButton from "@/components/mobile/common/CapsuleButton";

const GradeCalculatorWidget = () => {
  const navigate = useNavigate();

  // 버튼 데이터 구성
  const tipsItems = [
    {
      title: "평균 학점",
      description: "4.23 / 4.5",
      icon: 장학금,
    },
    {
      title: "전공 평균 학점",
      description: "4.26 / 4.5",
      icon: 도서관,
    },
    {
      title: "취득 학점",
      description: "130 / 140",
      icon: 수강신청,
    },
  ];

  // 카테고리 페이지 이동 함수
  const handleCategoryClick = (title: string) => {
    return;
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

export default GradeCalculatorWidget;

const TipsWidgetWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  align-self: stretch;
`;
