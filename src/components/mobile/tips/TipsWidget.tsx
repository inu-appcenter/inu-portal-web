import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes"; // ROUTES 경로 확인 필요
import {
  ScholarshipIcon,
  LibraryIcon,
  CourseRegistrationIcon,
} from "@/resources/assets/icons/tips";
import { UnidormIcon as 기숙사 } from "@/resources/assets/icons/mobile-home/chip";
import CapsuleButton from "@/components/mobile/common/CapsuleButton";
import { mixpanelTrack } from "@/utils/mixpanel";

// tips/*.svg는 currentColor로 통합하며 원래 고정색(#0E4D9D)을 잃었다.
// TipsWidget의 아이콘은 모두 같은 색이었으므로 여기서 한 번에 지정한다.
const TIPS_ICON_COLOR = "#0E4D9D";

const TipsWidget = () => {
  const navigate = useNavigate();

  // 버튼 데이터 구성
  const tipsItems = [
    {
      title: "장학금",
      description: "국가 장학금, 성적 장학금",
      icon: ScholarshipIcon,
      iconColor: TIPS_ICON_COLOR,
    },
    {
      title: "학산도서관",
      description: "이용 방법, 출입 등록",
      icon: LibraryIcon,
      iconColor: TIPS_ICON_COLOR,
    },
    {
      title: "수강신청",
      description: "장바구니, 시간표 짜기",
      icon: CourseRegistrationIcon,
      iconColor: TIPS_ICON_COLOR,
    },
    {
      title: "기숙사",
      description: "입퇴사, 유니돔",
      icon: 기숙사,
      iconColor: TIPS_ICON_COLOR,
    },
  ];

  // 카테고리 페이지 이동 함수
  const handleCategoryClick = (title: string) => {
    mixpanelTrack.featureClicked(title, "Home Tips Widget");
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
          iconColor={item.iconColor}
          compact={true}
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
