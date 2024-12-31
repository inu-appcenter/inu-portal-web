import styled from "styled-components";
import menuImg from "resources/assets/mobile-home/menu.svg";
import noticeImg from "resources/assets/mobile-home/notice.svg";
import TipImg from "resources/assets/mobile-home/tip.svg";
import calendarImg from "resources/assets/mobile-home/calendar.svg";
import { useNavigate } from "react-router-dom";
import useAppStateStore from "stores/useAppStateStore";

const categorys = [
  { title: "menu", img: menuImg },
  { title: "notice", img: noticeImg },
  { title: "tips", img: TipImg },
  { title: "calendar", img: calendarImg },
  { title: "총학생회", img: "" },
  { title: "복지", img: "" },
  { title: "동아리", img: "" },
  { title: "유틸", img: "" },
];

export default function CategoryForm() {
  const navigate = useNavigate();
  const { isAppUrl } = useAppStateStore();

  const handleClick = (title: string) => {
    if (title === "notice") {
      navigate(`${isAppUrl}/home/tips?type=notice`);
    } else if (title === "총학생회") {
      navigate(`${isAppUrl}/home/tips?type=councilNotice`);
    } else {
      navigate(`${isAppUrl}/home/${title}`);
    }
  };

  return (
    <CategoryFormmWrapper>
      {categorys.map((category, index) => (
        <div
          key={index}
          className="category"
          onClick={() => handleClick(category.title)}
        >
          <img src={category.img} alt="카테고리 이미지" />
          <button>{category.title}</button>
        </div>
      ))}
    </CategoryFormmWrapper>
  );
}

const CategoryFormmWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  gap: 1px;
  .category {
    margin-top: 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 20%;

    img {
      width: 40px;
      height: 40px;
    }

    button {
      font-size: 12px;
      border: none;
      background-color: white;
      margin-top: 14px;
    }
  }
`;
