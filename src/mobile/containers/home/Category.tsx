import styled from "styled-components";
import menuImg from "resources/assets/mobile-home/menu.svg";
import noticeImg from "resources/assets/mobile-home/notice.svg";
import TipImg from "resources/assets/mobile-home/tip.svg";
import calendarImg from "resources/assets/mobile-home/calendar.svg";
import councilImg from "resources/assets/mobile-home/council.svg";
import mapImg from "resources/assets/mobile-home/map.svg";
import clubImg from "resources/assets/mobile-home/club.svg";
import utilImg from "resources/assets/mobile-home/util.svg";
import { useNavigate } from "react-router-dom";
import useAppStateStore from "stores/useAppStateStore";

const categorys = [
  { title: "메뉴", img: menuImg },
  { title: "공지사항", img: noticeImg },
  { title: "TIPS", img: TipImg },
  { title: "시간표", img: calendarImg },
  { title: "총학", img: councilImg },
  { title: "캠퍼스", img: mapImg },
  { title: "동아리", img: clubImg },
  { title: "편의", img: utilImg },
];

export default function CategoryForm() {
  const navigate = useNavigate();
  const { isAppUrl } = useAppStateStore();

  const handleClick = (title: string) => {
    if (title === "메뉴") {
      navigate(`${isAppUrl}/home/menu`);
    } else if (title === "공지사항") {
      navigate(`${isAppUrl}/home/tips?type=notice`);
    } else if (title === "TIPS") {
      navigate(`${isAppUrl}/home/tips`);
    } else if (title === "시간표") {
      navigate(`${isAppUrl}/home/calendar`);
    } else if (title === "총학") {
      navigate(`${isAppUrl}/home/council`);
    } else if (title === "동아리") {
      navigate(`${isAppUrl}/home/club`);
    } else if (title === "캠퍼스") {
      navigate(`${isAppUrl}/home/map`);
    } else if (title === "편의") {
      navigate(`${isAppUrl}/home/util`);
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
