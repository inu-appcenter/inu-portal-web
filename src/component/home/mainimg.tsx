import styled from "styled-components"
import inuImg from "../../resource/assets/inu-img.png"
export default function MainpageImg () {
    return (
        <>
            <InuImg src={inuImg} alt="메인홈페이지 학교사진" />
        </>
    )
}

const InuImg = styled.img `
    width: 100%;
    height: 130px;
`


