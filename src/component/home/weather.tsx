import styled from "styled-components"
import weatherImg from "../../resource/assets/weather.png"

import back from "../../resource/assets/back.png"
export default function Weather () {
    return (
        <>
            <WeatherWrapper>
                <Wrapper>
               <p className="temperature">27</p> 
               <p className="day">SUN</p>
               <p className="date">May 5, Seoul</p>
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
    background:linear-gradient(90deg, #B5F1FB 0%, #8CE3D6 100%);
    position: relative;
    display:flex;
    align-items: flex-end;
    flex-direction: column;
    padding:20px 0 10px 0;
    border-radius: 10px;
    &::after {
        content: "";
        position: absolute;
        top: -60px;
        right: 0;
        bottom: 0;
        left: 0;
        width: 200px;
        height: 200px;
        background-image: url(${weatherImg}); 
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
        font-family: inter;
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
        font-family: inter;
        font-size:15px;
        font-weight: normal;
        color:white;
        margin:10px 0 5px 0;
    }

    .date {
        font-family: inter;
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