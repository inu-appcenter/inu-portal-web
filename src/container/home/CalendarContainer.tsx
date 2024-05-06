
import styled from 'styled-components';
import Calendarbar from '../../component/home/calendar';

export default function Calendar() {
    return (
        <CalendarWrapper>
            <Calendarbar/>
        </CalendarWrapper>
    )
}

const CalendarWrapper = styled.div`
    width:45%;
    height: 500px;
  display: flex;
  justify-content: center;
  @media (max-width: 768px) { // 모바일
    width: 100%;
    margin-top: 20px;
  }

  .fc {
    width: 100%;
  }
  .fc .fc-toolbar.fc-header-toolbar {
    margin: 0;
    padding: 0 40px;
    background-color: #356eff;
    height: 63px;
    font-weight: 600;
    font-size: 12px;
    line-height: 29px;
    color: white;
    border-radius: 20px 20px 0px 0px;
  }

  .fc .fc-button-primary {
    background-color: transparent;
    border: none;

    span {
      font-weight: 500;
      font-size: 28px;
    }

    :hover {
      background-color: transparent;
    }
  }

  .fc-h-event {
    background-color: #fff8bd;
    border:none;
  }

  .fc-theme-standard th {
    height: 32px;
    padding-top: 3.5px;
    background: #e5edff;
    border: 1px solid #dddee0;
    font-weight: 500;
    font-size: 16px;
    line-height: 19px;
    color: #7b7b7b;
  }


  .fc .fc-daygrid-day.fc-day-today {
    background-color: #59acfa;
    color: #356eff;
  }


  .fc .fc-daygrid-day-frame {
    padding: 10px;
  }


  .fc .fc-daygrid-day-top {
    flex-direction: row;
    margin-bottom: 3px;
  }


  .fc-event {
    cursor: url('/pointers/cursor-pointer.svg'), pointer;
    padding: 5px 8px;
    margin-bottom: 5px;
    border-radius: 4px;
    font-weight: 500;
    font-size: 14px;
  }

.fc-event-title-container {
    color:black;
}

  .fc-day-sun a {
    color: red;
}
`
