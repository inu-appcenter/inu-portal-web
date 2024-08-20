import styled from "styled-components";
import dinnerImg from "../../../resource/assets/Sunset.png";

interface CafeteriaDeatilProps {
    구성원가: string;
    칼로리: string;
}

interface CafeteriaBreakfastProps {
    cafeteriaTypes:string[];
    cafeteriaDetail:CafeteriaDeatilProps[];
    cafeteriaInfo:string[];
}
export default function CafeteriaLunch({cafeteriaTypes,cafeteriaDetail,cafeteriaInfo}:CafeteriaBreakfastProps) {
    return (
        <div className="total-wrapper">
          
          <div className="info-wrapper">
            <div className="type-wrapper">
            <p className="type">{cafeteriaTypes[1]}</p>
            <img src={dinnerImg} alt="석식 이미지" />
          </div>
            <div className="detail-info-wrapper">
                <p className="info">{cafeteriaInfo[1]}</p>
                {cafeteriaDetail[1] && (<div className="detail-wrapper">
                  <div className="sub-detail-wrapper">
                    <span className="price">{cafeteriaDetail[1].칼로리}</span>
                    <TinyCircle/>
                    <span className="calory">{cafeteriaDetail[1].구성원가}</span>
                  </div> 
                </div>)}
            </div>
          </div>
        </div>
    )
}

const TinyCircle = styled.p`
width: 1px;
height: 1px;
background-color: black;
border-radius: 50%; /* 원 모양을 만들기 위해 사용합니다. */
`;