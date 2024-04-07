import { useNavigate } from 'react-router-dom'
import styled from "styled-components"


export default function NoticeTitle() {
    const navigate = useNavigate()

    const handleNoticeClick =()=>{
        navigate('/tips/notice');
    }

    return (

        <NoticeWrapper onClick={handleNoticeClick}>📌 NOTICE</NoticeWrapper>
    )
}

const NoticeWrapper = styled.div`
    font-family: Inter;
    font-size: 27px;
    font-weight: 700;
    line-height: 29px;
    letter-spacing: 0px;
    text-align: left;
    color: #0E4D9D;
    margin-bottom: 10px;
    cursor: pointer;
    padding: 5px;

`