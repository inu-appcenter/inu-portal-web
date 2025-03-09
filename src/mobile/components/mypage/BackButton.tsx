import styled from "styled-components";
import backBtnImg from "resources/assets/mobile-mypage/oui_arrow-up.svg";
import useMobileNavigate from "hooks/useMobileNavigate";

export default function BackButton() {
    const mobileNavigate = useMobileNavigate();

    return (
        <>
            <Img
                src={backBtnImg}
                alt="뒤로가기 이미지"
                onClick={() => mobileNavigate(`/mypage`)}
            />
        </>
    );
}

const Img = styled.img`
    width: 20px;
    height: 20px;
`;
