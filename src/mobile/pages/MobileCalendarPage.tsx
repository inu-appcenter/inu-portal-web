import styled from "styled-components";
import Calendarbar from "mobile/components/calendar/Calendar";
// import BackImg from "resources/assets/mobile-common/backbtn.svg";
import useMobileNavigate from "hooks/useMobileNavigate";
import Title from "mobile/containers/mypage/Title.tsx"


export default function MobileCalendarPage() {
    const mobileNavigate = useMobileNavigate();

    return (
        <MobileWritePageWrapper>
            {/*<BackButton onClick={() => mobileNavigate(`/home`)}>*/}
            {/*    <img src={BackImg} alt="뒤로가기 버튼"/>*/}
            {/*    <span>Back</span>*/}
            {/*</BackButton>*/}
            <Title title={"학사일정"} onback={() => mobileNavigate('/home')}/>

            <Calendarbar/>
        </MobileWritePageWrapper>
    );
}

const MobileWritePageWrapper = styled.div`
    width: 100%;
`;

// const BackButton = styled.div`
//     padding: 20px 0 0 20px;
//     width: 80px;
//     font-size: 14px;
//     display: flex;
//     align-items: center;
//     gap: 8px;
//
//     img {
//         width: 15px;
//         height: 15px;
//     }
// `;
