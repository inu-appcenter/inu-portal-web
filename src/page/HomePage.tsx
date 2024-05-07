// import AboutUsContainer from '../component/home/AboutUsContainer';
// import OurTeamContainer from '../component/home/OurTeamContainer';
// import ProductContainer from '../component/home/ProductContainer';
import styled from 'styled-components';
import Calendar from '../container/home/CalendarContainer';
import Weather from '../component/home/weather';
import Tip from '../container/home/TipContainer';
import Notice from '../container/home/NoticeContainer';
import AIEnter from '../container/home/AiEnter';
import Cafeteria from '../component/home/cafeterias';
export default function HomePage() {
    
    return (
        <HomePageWrapper>
            {/*<Image/>*/}
            <MainWrapper>
                <Wrapper>
                    <Weather/>
                    <Cafeteria/>
                </Wrapper>
                
                <Tip/>
                
                <Calendar/>
            </MainWrapper>
            <AIEnter/>
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
    /* justify-content: space-between; */
    gap:32px;
    margin-top:20px;
`;

const Wrapper = styled.div`
display: flex;
flex-direction: column;
gap:29px;
`
