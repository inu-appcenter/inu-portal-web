import styled from 'styled-components';
import Calendarbar from '../components/calendar/Calendar';




export default function MobileCalendarPage() {

  return (
    <MobileWritePageWrapper>
        <Calendarbar/>
    </MobileWritePageWrapper>
  );
}

const MobileWritePageWrapper = styled.div`
  width: 100%;
  height: 100%;
`;

