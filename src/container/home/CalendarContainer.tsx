
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
    /* width:638px;
    height: 500px;
    .fc-toolbar-title {
        color:#0E4D9D;
        font-size: 24px;
        font-weight: 700;
        line-height: 29px;
        letter-spacing: 0em;
        text-align: left;
    }


    .fc .fc-button-primary &.fc-button-primary:hover {
        background-color: white;
    }

    .fc .fc-button {
        border:none;
        background-color: white;
    }
    

    .fc-icon {
        color:#0E4D9D;
    }

    .fc-day-sun a {
    color: red;
} */
    width:45%;
    height: 500px;
  display: flex;
  justify-content: center;

  // 캘린더 전체 사이즈 조정
  .fc {
    width: 100%;
  }

  // toolbar container
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

  // toolbar 버튼
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

  // 요일 부분
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

  // 오늘 날짜 배경색
  .fc .fc-daygrid-day.fc-day-today {
    background-color: #59acfa;
    color: #356eff;
  }

  // 날짜별 그리드
  .fc .fc-daygrid-day-frame {
    padding: 10px;
  }

  // 날짜  ex) 2일
  .fc .fc-daygrid-day-top {
    flex-direction: row;
    margin-bottom: 3px;
  }

  // 각 이벤트 요소
  .fc-event {
    cursor: pointer;
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
