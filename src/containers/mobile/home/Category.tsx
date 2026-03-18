import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import menuImg from "@/resources/assets/mobile-home/category-form/menu.svg";
import noticeImg from "@/resources/assets/mobile-home/category-form/notice.svg";
import tipImg from "@/resources/assets/mobile-home/category-form/tip.svg";
import calendarImg from "@/resources/assets/mobile-home/category-form/calendar.svg";
import mapImg from "@/resources/assets/mobile-home/category-form/map.svg";
import clubImg from "@/resources/assets/mobile-home/category-form/club.svg";
import busImg from "@/resources/assets/mobile-home/category-form/bus.svg";
import schoolNoticeImg from "@/resources/assets/mobile-home/category-form/school-notice.svg";
import { DESKTOP_MEDIA } from "@/styles/responsive";

const categories = [
  { title: "식당 메뉴", img: menuImg, href: "/home/menu" },
  { title: "학교 공지", img: schoolNoticeImg, href: "/home/notice" },
  { title: "학과 공지", img: noticeImg, href: "/home/deptnotice", isNew: true },
  { title: "학사 일정", img: calendarImg, href: "/home/calendar" },
  { title: "캠퍼스맵", img: mapImg, href: "/home/campus" },
  { title: "동아리", img: clubImg, href: "/home/club" },
  { title: "TIPS", img: tipImg, href: "/home/tips" },
  { title: "인입런", img: busImg, href: "/bus", isNew: true },
];

export default function CategoryForm() {
  const navigate = useNavigate();

  return (
    <CategoryFormWrapper>
      {categories.map((category) => (
        <CategoryCard
          key={category.title}
          onClick={() => navigate(category.href)}
          type="button"
        >
          <IconWrapper>
            <img src={category.img} alt={`${category.title} 아이콘`} />
            {category.isNew && <NewBadge>NEW!</NewBadge>}
          </IconWrapper>
          <CategoryLabel>{category.title}</CategoryLabel>
        </CategoryCard>
      ))}
    </CategoryFormWrapper>
  );
}

const CategoryFormWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px 12px;
  width: 100%;
  padding: 16px;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);

  @media ${DESKTOP_MEDIA} {
    grid-template-columns: repeat(8, minmax(0, 1fr));
    gap: 20px 16px;
    padding: 24px;
  }
`;

const CategoryCard = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-width: 0;

  @media ${DESKTOP_MEDIA} {
    gap: 14px;
  }
`;

const CategoryLabel = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: #121212;
  text-align: center;
  word-break: keep-all;

  @media ${DESKTOP_MEDIA} {
    font-size: 14px;
  }
`;

const IconWrapper = styled.div`
  position: relative;
  width: 40px;
  height: 40px;

  img {
    width: 100%;
    height: 100%;
  }

  @media ${DESKTOP_MEDIA} {
    width: 48px;
    height: 48px;
  }
`;

const NewBadge = styled.span`
  position: absolute;
  top: -6px;
  right: -16px;
  background-color: #4f9cff;
  color: white;
  font-size: 10px;
  font-weight: bold;
  border-radius: 9999px;
  padding: 2px 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);

`;
