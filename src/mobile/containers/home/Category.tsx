import styled from 'styled-components';
import menuImg from "../../../resource/assets/mobile/home/menu.png";
import noticeImg from "../../../resource/assets/mobile/home/notice.png";
import TipImg from "../../../resource/assets/mobile/home/tip.png";
import calendarImg from "../../../resource/assets/mobile/home/calendar.png";
import { useNavigate } from 'react-router-dom';
const categorys = [{title:'menu', img:menuImg},{title:'notice', img:noticeImg},{title:'tips', img:TipImg},{title:'calendar', img:calendarImg}]


export default function CategoryForm() {

const navigate = useNavigate();
  return (
    <CategoryFormmWrapper>
        {categorys.map((category,index)=> (
            <div key={index} className="category"> 
                <img src={category.img} alt="카테고리 이미지" />
                {category.title === 'notice'? 
                <button onClick={() => navigate('/m/home/tips/notice')}>{category.title}</button> :
                <button onClick={() => navigate(`/m/home/${category.title}`)}>{category.title}</button>}
            </div>
        ))}
    </CategoryFormmWrapper>
  );
}

const CategoryFormmWrapper = styled.div`
    display: flex;
    justify-content: space-between;
    .category {
        display: flex;
        flex-direction: column;
        align-items: center;
        img {
            width: 39px;
            height: 39px;
        }

        button {
            font-size:12px;
            font-weight: 400;
            border: none;
            background-color: white;
            margin-top: 14px;
        }
        
    }
`;



