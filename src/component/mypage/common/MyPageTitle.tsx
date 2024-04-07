import styled from 'styled-components';


import smallImg from "../../../resource/assets/mypage-small-logo.svg"


export const MypageTitle = () => {
    return (
        <>  
            <div>
                <MyPageLogo src={smallImg}/>
                <MyPageTitleOne>마이 페이지</MyPageTitleOne>
                <MyPageTitleTwo>My Page</MyPageTitleTwo>
            </div>
        </>
    )
}


const MyPageLogo = styled.img`
    
`;

const MyPageTitleOne = styled.span`
        font-family: Inter;
    font-size: 24px;
    font-weight: 700;
    margin: 5px;
`;

const MyPageTitleTwo =styled.span`
    font-family: Inter;
    font-size: 24px;
    font-weight: 700;
    color: #AAC9EE;
`;

