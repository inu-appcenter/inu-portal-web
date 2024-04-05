import styled from "styled-components"


export default function NoticeTitle() {
    return (
        <NoticeWrapper>📌 NOTICE</NoticeWrapper>
    )
}

const NoticeWrapper = styled.div`
    font-family: Inter;
    font-size: 24px;
    font-weight: 700;
    line-height: 29px;
    letter-spacing: 0px;
    text-align: left;
    color: #0E4D9D;
    margin-bottom: 10px;

`