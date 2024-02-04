import { useRef, useEffect, useState } from "react";
import dayGridPlugin from "@fullcalendar/daygrid";
import FullCalendar from "@fullcalendar/react";
import { EventInput } from "@fullcalendar/core/index.js";
import { calendarInfo } from "../../resource/string/calendar";

export default function Calendarbar() {
  const calendarRef = useRef<FullCalendar>(null);
  const [events, setEvents] = useState<EventInput[]>([]);

  useEffect(() => {
    addInitialEvents();
  }, []);

  const addInitialEvents = () => {
    // Instead of direct assignment, use setEvents function to update the state
    setEvents(calendarInfo);
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarInfo.forEach((event) => {
        calendarApi.addEvent(event);
      });
    }
  };

  return (
    <FullCalendar
      ref={calendarRef}
      plugins={[dayGridPlugin]}
      initialView={"dayGridMonth"}
      headerToolbar={{ start: "title", end: "prev,next" }}
    />
  );
}

// class DashBoard extends Component<DashBoardProps, DashBoardState> {
//   private calendarRef: RefObject<FullCalendar>;

//   constructor(props: DashBoardProps) {
//     super(props);

//     this.calendarRef = React.createRef();

//     this.state = {
//       events: [],
//     };
//   }

//   componentDidMount() {
//     this.addInitialEvents();
//   }

//   addInitialEvents() {
//     const virtualEvents = [
//       { title: '전과신청', start: '2024-01-15',end:'2024-01-19' },
//     ];

//     this.setState({ events: virtualEvents });

//     const calendarApi = this.calendarRef.current?.getApi();
//     if (calendarApi) {
//       virtualEvents.forEach((event) => {
//         calendarApi.addEvent(event);
//       });
//     }
//   }

//   render() {
//     return (
//       <>
//         <div
//           style={{
//             display: 'grid',
//             float:"right",
//             marginRight:8,
//             position: "relative",
//             top:-450
//           }}
//         >
//           <FullCalendar
//             ref={this.calendarRef}
//             plugins={[dayGridPlugin]}
//             initialView={'dayGridMonth'}
//             headerToolbar={{
//               start: 'title',
//               end: 'prev,next',
//             }}
//           />
//         </div>
//       </>
//     );
//   }
// }

// export default DashBoard;
