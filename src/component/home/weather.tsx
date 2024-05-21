import styled from "styled-components"
import sunImg from "../../resource/assets/weather.png"
import snowImg from "../../resource/assets/snow.png"
import cloudImg from "../../resource/assets/cloud.png"
import sleetImg from "../../resource/assets/sleet.png"
import rainImg from "../../resource/assets/rain.png"

import { useEffect, useState } from "react";

import back from "../../resource/assets/back.png"
import getWeather from "../../utils/getWeather";

export default function Weather () {
    const [currentDate, setCurrentDate] = useState("");
    const [weather, setWeather] = useState<{ sky: string; temperature: string }>({ sky: "", temperature: "" });
    useEffect(() => {
        const fetchWeather = async () => {
            try {
              const response = await getWeather();
              console.log(response,"return 값");
              setWeather(response.data);
            } catch (error) {
              console.error('학식 정보 조회 안됨');
            }
          };
      
          fetchWeather();
        const date = new Date();
        const monthNames = ["January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"];
        const month = monthNames[date.getMonth()]; 
        const day = date.getDate(); 

        const formattedDate = `${month} ${day}`;
        setCurrentDate(formattedDate);
      }, []);

      const getSky = (sky:string) => {
        switch (sky) {
          case '맑음':
            return 'Sun';
          case '구름':
            return 'Cloudy';
          case '눈':
            return 'Snow';
          case '진눈깨비':
            return 'Sleet';
          case '비':
            return 'Rain';
          default:
            return '';
        }
      };  
    return (
        <>
            <WeatherWrapper className={getSky(weather.sky)}>
                <Wrapper>
                    <p className="temperature">{weather.temperature}</p>
                    <p className="day">{getSky(weather.sky)}</p>
                    <p className="date">{`${currentDate} , Incheon`}</p>
               </Wrapper>
            </WeatherWrapper>
        </>
    )
}

const WeatherWrapper = styled.div `
    width: 550px;
    height: 145px;
    background-color:#8CE3D6;
    height: 141px;
    position: relative;
    display:flex;
    align-items: flex-end;
    flex-direction: column;
    padding:20px 0 10px 0;
    border-radius: 10px;
    &.Sun {
        background:linear-gradient(90deg, #B5F1FB 0%, #8CE3D6 100%);
    }

    &.Snow {
        background:linear-gradient(90deg, #A9CBF8 0%, #6C8CBD 100%);
    }

    &.Sleet {
        background:linear-gradient(90deg, #A5C7F4 0%, #3B82CA 100%);
    }

    &.Rain {
        background:linear-gradient(90deg, #A2B9E3 0%, #2E549B 100%);
    }

    &.Cloudy {
        background:linear-gradient(90deg, #FFF7F0 0%, #85B3F2 100%);
    }

    &.Sun::after {
        content: "";
        position: absolute;
        top: -60px;
        right: 0;
        bottom: 0;
        left: 0;
        width: 200px;
        height: 200px;
        background-image: url(${sunImg}); 
        background-size: cover; 
        opacity: 0.8; 
    }

    &.Snow::after {
        content: "";
        position: absolute;
        top: -60px;
        right: 0;
        bottom: 0;
        left: 0;
        width: 200px;
        height: 200px;
        background-image: url(${snowImg}); 
        background-size: cover; 
        opacity: 0.5; 
    }

    &.Sleet::after {
        content: "";
        position: absolute;
        top: -60px;
        right: 0;
        bottom: 0;
        left: 0;
        width: 200px;
        height: 200px;
        background-image: url(${sleetImg}); 
        background-size: cover; 
        opacity: 0.5; 
    }

    &.Rain::after {
        content: "";
        position: absolute;
        top: -60px;
        right: 0;
        bottom: 0;
        left: 0;
        width: 200px;
        height: 200px;
        background-image: url(${rainImg}); 
        background-size: cover; 
        opacity: 0.5; 
    }

    &.Cloudy::after {
        content: "";
        position: absolute;
        top: -60px;
        right: 0;
        bottom: 0;
        left: 0;
        width: 200px;
        height: 200px;
        background-image: url(${cloudImg}); 
        background-size: cover; 
        opacity: 0.5; 
    }



    &::before {
        content: "";
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        display: flex;
        justify-content: space-around;
        width: 100%;
        height: 100%;
        background-image: url(${back});
        background-size: cover; 
        background-position: center; 
    }


    .temperature {
        width: 100px;
        font-size:50px;
        font-weight: normal;
        color:white;
        margin:0;
        border-bottom: 2px solid #FFF;
        position:relative;
        margin-right: 45px;
        &::after {
        content: " ";
        position: absolute;
        top: 0;
        /* right: 0; */
        bottom: 0;
        left: 20;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        border: 1px solid transparent;
        box-shadow: 0 0 0 1px #FFF inset;
        margin-right: 8px; 
    }

    }



    .day {
        font-size:15px;
        font-weight: normal;
        color:white;
        margin:10px 0 5px 0;
    }

    .date {
        font-size:15px;
        font-weight: normal;
        color:white;
        margin:0;
    }

`


const Wrapper = styled.div`
    display: flex;
    flex-direction: column;




`