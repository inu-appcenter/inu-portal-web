import styled from 'styled-components';
import MainpageImg from '../../component/home/mainimg';
export default function Image() {
    return (
        <ImgWrapper>
            <MainpageImg/>
        </ImgWrapper>
    )
}

const ImgWrapper = styled.div`
    margin-top: 16px;
`
