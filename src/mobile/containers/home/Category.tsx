import styled from "styled-components";
import menuImg from "resources/assets/mobile-home/menu.svg";
import noticeImg from "resources/assets/mobile-home/notice.svg";
import TipImg from "resources/assets/mobile-home/tip.svg";
import calendarImg from "resources/assets/mobile-home/calendar.svg";
import { useNavigate } from "react-router-dom";

const categorys = [
  { title: "menu", img: menuImg },
  { title: "notice", img: noticeImg },
  { title: "tips", img: TipImg },
  { title: "calendar", img: calendarImg },
];

export default function CategoryForm() {
  const navigate = useNavigate();

  const handleClick = (title: string) => {
    if (title === "notice") {
      navigate("/m/home/tips/notice");
    } else {
      navigate(`/m/home/${title}`);
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
  justify-content: space-around;
  margin-top: 40px;
  .category {
    display: flex;
    flex-direction: column;
    align-items: center;

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
