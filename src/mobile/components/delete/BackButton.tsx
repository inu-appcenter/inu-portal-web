import styled from "styled-components"
import backBtnImg from "../../../resource/assets/mobile/mypage/oui_arrow-up.svg"
import { useNavigate } from "react-router-dom"

export default function BackButton() {
    const navigate = useNavigate();
    return (
        <>
        <Img src={backBtnImg} alt="뒤로가기 이미지" onClick={()=>navigate(-1)}/>
        </>
    )
}

const Img = styled.img`
    width: 18px;
    height: 18px;
`