import {useState} from "react";
import styled from "styled-components";

interface ImageBoxProps {
    src: string;
    alt: string;
}

const ImageBox = ({src, alt}: ImageBoxProps) => {
    const [imgSrc, setImgSrc] = useState(src);

    const handleError = () => {
        setImgSrc(alt); // 이미지 로드 실패 시 대체 이미지로 변경
    };

    return (
        <ImageBoxWrapper>
            <StyledImg src={imgSrc} alt="item" onError={handleError}/>
        </ImageBoxWrapper>
    );
};


// Styled Components
const ImageBoxWrapper = styled.div`
    width: 100%;
    aspect-ratio: 1 / 0.8; /* 가로세로 비율 유지 */
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    border-radius: 8px; /* 선택 사항: 이미지 모서리 둥글게 */
`;

const StyledImg = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover; /* 이미지 비율 유지하며 잘림 */
`;

export default ImageBox;