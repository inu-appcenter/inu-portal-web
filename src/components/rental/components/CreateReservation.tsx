import React, {useState} from "react";
import api from "../services/api";

const CreateReservation: React.FC = () => {
    const [itemId, setItemId] = useState("");
    const [startDateTime, setStartDateTime] = useState("");
    const [endDateTime, setEndDateTime] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        api
            .post(`/reservations/${itemId}`, {startDateTime, endDateTime})
            .then((response) => {
                alert(response.data.message);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    return (
        <form onSubmit={handleSubmit}>
            <h1>예약 생성</h1>
            <label>
                Item ID:
                <input
                    type="text"
                    value={itemId}
                    onChange={(e) => setItemId(e.target.value)}
                />
            </label>
            <label>
                시작 시간:
                <input
                    type="datetime-local"
                    value={startDateTime}
                    onChange={(e) => setStartDateTime(e.target.value)}
                />
            </label>
            <label>
                종료 시간:
                <input
                    type="datetime-local"
                    value={endDateTime}
                    onChange={(e) => setEndDateTime(e.target.value)}
                />
            </label>
            <button type="submit">예약하기</button>
        </form>
    );
};

export default CreateReservation;
