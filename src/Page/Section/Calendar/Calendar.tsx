import React, { Component, RefObject } from "react";
import dayGridPlugin from "@fullcalendar/daygrid";
import FullCalendar  from "@fullcalendar/react";
import { EventInput } from "@fullcalendar/core/index.js";
import "./Calendar.css"
interface DashBoardProps {}

interface DashBoardState {
  events: EventInput[];
}

class DashBoard extends Component<DashBoardProps, DashBoardState> {
  private calendarRef: RefObject<FullCalendar>;

  constructor(props: DashBoardProps) {
    super(props);

    this.calendarRef = React.createRef();

    this.state = {
      events: [],
    };
  }

  componentDidMount() {
    this.addInitialEvents();
  }

  addInitialEvents() {
    const virtualEvents = [
      { title: '전과신청', start: '2024-01-15',end:'2024-01-19' },
    ];

    this.setState({ events: virtualEvents });

    const calendarApi = this.calendarRef.current?.getApi();
    if (calendarApi) {
      virtualEvents.forEach((event) => {
        calendarApi.addEvent(event);
      });
    }
  }

  render() {
    return (
      <>
        <div
          style={{
            display: 'grid',
            float:"right",
            marginRight:24
          }}
        >
          <FullCalendar
            ref={this.calendarRef}
            plugins={[dayGridPlugin]}
            initialView={'dayGridMonth'}
            headerToolbar={{
              start: 'title',
              end: 'prev,next',
            }}
          />
        </div>
      </>
    );
  }
}

export default DashBoard;
