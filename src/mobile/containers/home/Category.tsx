import styled from 'styled-components';
import menuImg from "../../../resource/assets/mobile/home/menu.svg";
import noticeImg from "../../../resource/assets/mobile/home/notice.svg";
import TipImg from "../../../resource/assets/mobile/home/tip.svg";
import calendarImg from "../../../resource/assets/mobile/home/calendar.svg";
import { useNavigate } from 'react-router-dom';

const categorys = [
  {title: 'menu', img: menuImg},
  {title: 'notice', img: noticeImg},
  {title: 'tips', img: TipImg},
  {title: 'calendar', img: calendarImg}
];

export default function CategoryForm() {
  const navigate = useNavigate();

  const handleClick = (title: string) => {
    if (title === 'notice') {
      navigate('/m/home/tips/notice');
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
  justify-content: space-between;
  margin-top: 40px;
  .category {
    display: flex;
    flex-direction: column;
    align-items: center;
    
    img {
      width: 39px;
      height: 39px;
    }

    button {
      font-size: 12px;
      font-weight: 400;
      border: none;
      background-color: white;
      margin-top: 14px;
    }
  }
`;
