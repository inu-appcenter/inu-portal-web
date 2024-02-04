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
            <Calendar/>
            <Tip/>
            <Notice/>
        </HomePageWrapper>
    );
}

const HomePageWrapper = styled.div`
    display: grid;
    row-gap: 8rem;
    grid-template-columns: 100%;
    padding: 0 2rem;
    @media (max-width: 350px) {
        padding: 0 1rem;
    }
`;
