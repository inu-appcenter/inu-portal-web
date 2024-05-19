import styled from "styled-components";
import { cafeteriasList } from "../../resource/string/cafeterias";
import { useEffect, useState } from "react";
import getCafeteria from "../../utils/getCafeteria";
import dinnerImg from "../../resource/assets/Sunset.png";
import lunchImg from "../../resource/assets/Sun.png";
import breakfastImg from "../../resource/assets/Sunrise.png";
export default function Cafeteria() {
  const [cafeteriaType, setCafeteriaType] = useState("학생식당");
  const [cafeteriaInfo , setCageteriaInfo] = useState([]); 
  const [cafeteriaTypes, setCafeteriaTypes] = useState<string[]>([]);
  const [currentDate, setCurrentDate] = useState("");
  useEffect(() => {
    const fetchCafeteria = async () => {
      try {
        const response = await getCafeteria(cafeteriaType);
        console.log(response,"return 값");
        setCageteriaInfo(response.data);
        console.log(cafeteriaInfo);
      } catch (error) {
        console.error('학식 정보 조회 안됨');
      }
    };

    fetchCafeteria();

    const date = new Date();
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    const month = monthNames[date.getMonth()]; // 현재 월 이름
    const day = date.getDate(); // 현재 일
    const year = date.getFullYear(); // 현재 년도
    
    const formattedDate = `${month} ${day}, ${year}`;
    setCurrentDate(formattedDate);
  }, [cafeteriaType]);

  const handleCafeteriaType = (title: string,info:string[]) => {
    setCafeteriaType(title);
    setCafeteriaTypes(info);
  };

  return (
    <>
      <CafeteriaWrapper>
                <div className="title">
                <div className="circle"></div>
                <div className="cafeteria-type">{cafeteriaType}</div>
                <h1 className="today">Today</h1>
                </div>
                <span className="date">{currentDate}</span>
                <div className="cafeteria-list">
                <CafetriaInfo>
                <div className="breakfast">
        <div className="detail">
            <div className="wrapper">
                {cafeteriaTypes[0]!== '없음' && (
                    <>
                    <img src={breakfastImg} alt="조식" />
                    <p className="type">{cafeteriaTypes[0]}</p>
                    </>)}
           </div>
            {cafeteriaTypes[0]!== '없음' && <p className="info">{cafeteriaInfo[0]}</p>}
        </div>
        </div>
        <div className="lunch">
        <div className="detail">
            <div className="wrapper">
                <img src={lunchImg} alt="중식" />
                <p className="type">{cafeteriaTypes[1]}</p>
           </div>
            <p className="info">{cafeteriaInfo[1]}</p>
        </div>
        </div>
        <div className="dinner">
            <div className="detail">
                <div className="wrapper">
                    <img src={dinnerImg} alt="석식" />
                    <p className="type">{cafeteriaTypes[2]}</p>
            </div>
                <p className="info">{cafeteriaInfo[2]}</p>
            </div>
</div>


        </CafetriaInfo>
        <CafetriaType>

        {cafeteriasList.map((cafeteria) => (
          <Cafeterias className="cafeteria"key={cafeteria.id} onClick={() => handleCafeteriaType(cafeteria.title,cafeteria.info)}>
            <div className="cafeteria-title">{cafeteria.title}</div>
          </Cafeterias>
        ))}
         </CafetriaType>
        </div>
      </CafeteriaWrapper>
    </>
  );
}

const CafeteriaWrapper = styled.div`
  width: 550px;
  box-sizing: border-box;
  border-radius: 10px;
  border: 2px solid transparent;
  box-shadow: 0 0 0 2px #6f84e2 inset;
  padding: 20px 18px;

  .date {
    font-size: 12px;
    color: #656565;
    display: flex;
    justify-content: flex-end; 
  }
  .title {
    display: flex;
    align-items: center; 
  }

  .circle {
    width: 15px;
    height: 15px;
    border-radius: 50%;
    border: 2px solid transparent;
    box-shadow: 0 0 0 2px #85cbda inset;
    margin-right: 10px; 
  }

  .cafeteria-type {
    font-size: 20px;
    font-weight: bold;
  }

  .today {
    font-size: 15px;
    font-weight: bold;
    margin-left: auto; 
  }

  .cafeteria-list{
    display: flex;
    justify-content: space-between;
    gap:10px;
  }
`;

const CafetriaInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap:20px;
    
    .breakfast, .lunch , .dinner {
        display: flex;
        align-items: center;

        .detail {
            display: flex;
            align-items: center;

            .img {
            width:25px;
            height:25px;
        }

            .wrapper{
              
            }

            .type {
                font-size: 8px;
                color:#969696;
               
                font-weight: bold;
                margin:0;
            }
            .info {
                font-size:12px;
                font-weight: bold;
                margin-left:15px;
            }
        }
       
       
        
    }
    min-width: 250px;
    justify-content: space-evenly;
    .breakfast, .lunch , .dinner {
        justify-content: flex-start;
    }
`;

const CafetriaType = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: space-between;
`

const Cafeterias  = styled.div`
   font-family : inter;
  font-weight: bold;
  font-size: 10px;
  line-height: 25px;
  text-align:center;
  color:#fff;

  .cafeteria-title {
    padding:2px 20px;
    background:linear-gradient(90deg, #83CBD9 0%, #99C7E1 50%, #A1C9F1 100%);
    border-radius: 5px;
    width: 93px;
    margin: 5px;
  }
`