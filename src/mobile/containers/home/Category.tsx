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
          <div className="icon-wrapper">
            <img src={category.img} alt="카테고리 이미지" />
            {["인입런", "학과 공지"].includes(category.title) && (
              <span className="new-badge">NEW!</span>
            )}
          </div>
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
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 20%;
    min-width: fit-content;

    .icon-wrapper {
      position: relative;
      width: 40px;
      height: 40px;

      img {
        width: 100%;
        height: 100%;
      }

      .new-badge {
        position: absolute;
        top: -6px;
        right: -16px;
        background-color: #4f9cff; /* 파스텔 블루 */
        color: white;
        font-size: 10px;
        font-weight: bold;
        border-radius: 9999px;
        padding: 2px 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);
      }
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
