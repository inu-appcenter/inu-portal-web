// import AboutUsContainer from '../component/home/AboutUsContainer';
// import OurTeamContainer from '../component/home/OurTeamContainer';
// import ProductContainer from '../component/home/ProductContainer';
import styled from 'styled-components';
import Calendar from '../container/home/CalendarContainer';
import Tip from '../container/home/TipContainer';
import Notice from '../container/home/NoticeContainer';


export default function HomePage() {
    
    return (
        <HomePageWrapper>
            {/*<Image/>*/}
            <MainWrapper>
                <Tip/>
                <Calendar/>
            </MainWrapper>
            <Notice/>
        </HomePageWrapper>
    );
}

const HomePageWrapper = styled.div`
    display: grid;
    grid-template-columns: 100%;
    margin: 0 2rem;
    @media (max-width: 350px) {
        padding: 0 1rem;
    }
`;

const MainWrapper = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top:39px;
`;

