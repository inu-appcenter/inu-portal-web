import styled from "styled-components";
import sunImg from "../../resource/assets/weather.png";
import snowImg from "../../resource/assets/snow.png";
import cloudImg from "../../resource/assets/cloud.png";
import sleetImg from "../../resource/assets/sleet.png";
import rainImg from "../../resource/assets/rain.png";
import pmGradeGood from "../../resource/assets/pmGrade-good.svg";
import pmGradeNormal from "../../resource/assets/pmGrade-normal.svg";
import pmGradeHarm from "../../resource/assets/pmGrade-harm.svg";
import pmGradeverHarm from "../../resource/assets/pmGrade-veryharm.svg";

import { useEffect, useState } from "react";

import back from "../../resource/assets/back.png";
import { getWeathers } from "../../utils/API/Weathers";

export default function Weather() {
  const [weather, setWeather] = useState<{
    sky: string;
    temperature: string;
    pm10Grade: string;
  }>({ sky: "", temperature: "", pm10Grade: "" });
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await getWeathers();
        if (response.status === 200) {
          setWeather(response.body.data);
        } else {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
      } catch (error) {
        console.error("날씨 정보 조회 안됨", error);
      }
    };
    fetchWeather();
  }, []);

  const getSky = (sky: string) => {
    switch (sky) {
      case "맑음":
        return "Sun";
      case "구름":
        return "Cloudy";
      case "눈":
        return "Snow";
      case "진눈깨비":
        return "Sleet";
      case "비":
        return "Rain";
      default:
        return "";
    }
  };

  const getPm10Grade = (pm10Grade: string) => {
    switch (pm10Grade) {
      case "좋음":
        return pmGradeGood;
      case "보통":
        return pmGradeNormal;
      case "나쁨":
        return pmGradeHarm;
      case "매우나쁨":
        return pmGradeverHarm;
      default:
        return;
    }
  };

  const pm10GradeImage = getPm10Grade(weather.pm10Grade);
  return (
    <>
      <WeatherWrapper className={getSky(weather.sky)}>
        <Wrapper>
          <p className="temperature">{weather.temperature}</p>
          <p className="pm10grade">
            <img
              className="pmGradeColor"
              src={pm10GradeImage}
              alt={weather.pm10Grade}
            />
            미세먼지 : {weather.pm10Grade}
          </p>
          <p className="location">연수구 송도동</p>
        </Wrapper>
      </WeatherWrapper>
    </>
  );
}

const WeatherWrapper = styled.div`
  height: 145px;
  background-color: #8ce3d6;
  height: 141px;
  position: relative;
  display: flex;
  align-items: flex-end;
  flex-direction: column;
  padding: 20px 0 10px 0;
  border-radius: 10px;
  &.Sun {
    background: linear-gradient(90deg, #b5f1fb 0%, #8ce3d6 100%);
  }

  &.Snow {
    background: linear-gradient(90deg, #a9cbf8 0%, #6c8cbd 100%);
  }

  &.Sleet {
    background: linear-gradient(90deg, #a5c7f4 0%, #3b82ca 100%);
  }

  &.Rain {
    background: linear-gradient(90deg, #a2b9e3 0%, #2e549b 100%);
  }

  &.Cloudy {
    background: linear-gradient(90deg, #fff7f0 0%, #85b3f2 100%);
  }

  &.Sun::after {
    content: "";
    position: absolute;
    top: -80px;
    right: 0;
    bottom: 0;
    left: 0;
    width: 250px;
    height: 250px;
    background-image: url(${sunImg});
    background-size: cover;
    opacity: 0.9;
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
    font-size: 50px;
    font-weight: normal;
    color: white;
    margin: 0 20px 0 0;
    border-bottom: 2px solid #fff;
    position: relative;
    padding-right: 40px;

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
      box-shadow: 0 0 0 1px #fff inset;
      margin-right: 8px;
    }
  }
  .pm10grade {
    font-size: 12px;
    font-weight: normal;
    color: white;
    margin-bottom: 1em;
  }
  .pmGradeColor {
    margin: 0 5px;
  }

  .location {
    font-size: 20px;
    font-weight: normal;
    color: white;
    margin: 0;
  }
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;