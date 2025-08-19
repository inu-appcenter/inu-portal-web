import styled from "styled-components";
import menuImg from "resources/assets/mobile-home/menu.svg";
import noticeImg from "resources/assets/mobile-home/notice.svg";
import TipImg from "resources/assets/mobile-home/tip.svg";
import calendarImg from "resources/assets/mobile-home/calendar.svg";
// import councilImg from "resources/assets/mobile-home/council.svg";
import mapImg from "resources/assets/mobile-home/map.svg";
import clubImg from "resources/assets/mobile-home/club.svg";
import busImg from "resources/assets/mobile-home/bus.svg";
// import utilImg from "resources/assets/mobile-home/util.svg";
import schoolNoticeImg from "resources/assets/mobile-home/school-notice.svg";
import useMobileNavigate from "hooks/useMobileNavigate";

const categorys = [
  { title: "식당 메뉴", img: menuImg },
  { title: "학교 공지", img: schoolNoticeImg },
  { title: "학과 공지", img: noticeImg },
  { title: "학사 일정", img: calendarImg },
  { title: "캠퍼스맵", img: mapImg },
  { title: "동아리", img: clubImg },
  { title: "TIPS", img: TipImg },
  { title: "인입런", img: busImg },
];

export default function CategoryForm() {
  const mobileNavigate = useMobileNavigate();

  const handleClick = (title: string) => {
    if (title === "식당 메뉴") {
      mobileNavigate(`/home/menu`);
    } else if (title === "학교 공지") {
      mobileNavigate(`/home/notice`);
    } else if (title === "학과 공지") {
      mobileNavigate(`/home/notice`);
    } else if (title === "TIPS") {
      mobileNavigate(`/home/tips`);
    } else if (title === "학사 일정") {
      mobileNavigate(`/home/calendar`);
    } else if (title === "총학생회") {
      mobileNavigate(`/home/council`);
    } else if (title === "동아리") {
      mobileNavigate(`/home/club`);
    } else if (title === "캠퍼스맵") {
      mobileNavigate(`/home/campus`);
    } else if (title === "편의") {
      mobileNavigate(`/home/util`);
    } else if (title === "인입런") {
      mobileNavigate(`/bus`);
    } else {
      mobileNavigate(`/home/${title}`);
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
  gap: 4px;
  row-gap: 32px;
  padding: 0 8px;
  box-sizing: border-box;
  min-width: fit-content;

  .category {
    //margin-top: 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 20%;
    min-width: fit-content;

    img {
      width: 40px;
      height: 40px;
    }

    button {
      font-size: 12px;
      font-weight: 400;
      border: none;
      background-color: white;
      margin-top: 14px;
      color: black;
      min-width: fit-content;
    }
  }
`;
