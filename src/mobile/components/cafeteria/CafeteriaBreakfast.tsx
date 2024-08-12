import styled from "styled-components";
import breakfastImg from "../../../resource/assets/Sunrise.png"
// import dinnerImg from "../../resource/assets/Sunset.png";
// import lunchImg from "../../resource/assets/Sun.png";
// import breakfastImg from "../../resource/assets/Sunrise.png";

interface CafeteriaDeatilProps {
    구성원가: string;
    칼로리: string;
}

interface CafeteriaBreakfastProps {
    cafeteriaTypes:string[];
    cafeteriaDetail:CafeteriaDeatilProps[];
    cafeteriaInfo:string[];
}
export default function CafeteriaBreakfast({cafeteriaTypes,cafeteriaDetail,cafeteriaInfo}:CafeteriaBreakfastProps) {
    return (
        <div className="total-wrapper">
            {cafeteriaInfo[0] !== "-" && (
                <>
                <div className="type-wrapper">
                    {cafeteriaTypes[0] !== '없음' && (
                    <>
                        <p className="type">{cafeteriaTypes[0]}</p>
                        <p className="time">*08:00~09:30</p>
                    </>
                    )}
                </div>
                <div className="info-wrapper">
                    <img src={breakfastImg} alt="조식 이미지" />
                    <div className="detail-info-wrapper"> 
                        {cafeteriaTypes[0] !== '없음'  && <p className="info">{cafeteriaInfo[0]}</p>}
                        {cafeteriaDetail[0] && (<div className="detail-wrapper">
                            <div className="sub-detail-wrapper">
                                <span className="price">{cafeteriaDetail[0].칼로리}</span>
                                <TinyCircle/>
                                <span className="calory">{cafeteriaDetail[0].구성원가}</span>
                            </div>
                        </div>)}
                    </div>
                </div>
                </>
            )}
        </div>
                    
    )
}
const TinyCircle = styled.p`
width: 1px;
height: 1px;
background-color: black;
border-radius: 50%; /* 원 모양을 만들기 위해 사용합니다. */
`;