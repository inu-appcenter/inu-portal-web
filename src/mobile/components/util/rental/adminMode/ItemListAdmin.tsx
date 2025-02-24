import {useState, useEffect} from "react";
import styled from "styled-components";
import {Items} from "apis/rental.ts";
import {getItemsList, getItemReservations, setConfirmReject, Reservation} from "apis/rentalAdmin.ts";
import EditItem from "./EditItem.tsx";
import ChangeStatusModal from "./ChangeStatusModal.tsx";
import ItemCard from "./ItemCard.tsx";


interface ApiResponse<T> {
    contents: T;
}


const ItemListAdmin = () => {
    const [items, setItems] = useState<Items[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedItem, setSelectedItem] = useState<Items | null>(null);
    const [isChanged, setIsChanged] = useState<boolean>(false);
    const [reservations, setReservations] = useState<{ [key: number]: Reservation[] }>({});

    // 모달 관련 상태
    const [showModal, setShowModal] = useState<boolean>(false);
    const [selectedReservationId, setSelectedReservationId] = useState<number | null>(null);
    const [status, setStatus] = useState<string>("CONFIRM");
    const [activeButton, setActiveButton] = useState<string>(""); // '승인' 또는 '거절' 버튼의 active 상태


    useEffect(() => {
        // 데이터 로드
        const fetchItems = async () => {
            try {
                const data = await getItemsList();
                setItems(data.data); // Pagination 형식일 경우 items 추출

                // 각 아이템의 예약 리스트 불러오기
                if (Array.isArray(data.data)) {
                    for (const item of data.data) {
                        try {
                            if (item.id !== undefined) {
                                // @ts-ignore
                                const reservationData: ApiResponse<Reservation[]> = await getItemReservations(item.id, 1);
                                if (reservationData && reservationData.contents) {
                                    // @ts-ignore
                                    setReservations((prev) => ({
                                        ...prev,
                                        // @ts-ignore
                                        [item.id]: reservationData.contents,
                                    }));
                                }
                            }
                        } catch (error) {
                            alert("예약 리스트를 가져오는 중 오류가 발생하였습니다.");
                            console.error("예약 리스트를 가져오는 중 오류 발생:", error);
                        }
                    }
                }
            } catch (error) {
                alert("아이템 리스트를 가져오는 중 오류가 발생하였습니다.");
                console.error("아이템 목록을 가져오는 중 오류 발생:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, [isChanged]);

    const handleClickItem = (item: Items) => {
        setSelectedItem(item);
    };

    const handleEditReservation = (reservationId: number) => {
        setSelectedReservationId(reservationId);
        setActiveButton(''); // 버튼 상태 초기화
        setShowModal(true); // 모달 띄우기
    };


    const handleStatusChange = (status: string) => {
        setStatus(status);
        setActiveButton(status); // 클릭된 버튼의 상태를 저장
    };


    const handleConfirm = async (reservationId: number | null) => {
        try {
            const response = await setConfirmReject(reservationId, status); // CONFIRM | CANCELED
            console.log('Reservation status updated:', response);

            // 성공 시 alert 띄우고 모달 닫기
            alert('예약 승인 상태가 성공적으로 업데이트되었습니다.');
            setShowModal(false);
            setIsChanged(!isChanged);

        } catch (error) {
            console.error('Error updating reservation status:', error);

            // 실패 시 alert 띄우기
            alert('예약 승인 상태 업데이트에 실패했습니다.');
        }
    };


    if (loading) {
        return <p>로딩 중...</p>;
    }

    return (
        <>
            <ItemListWrapper>
                {items.map((item, index) => (
                    <ItemCard
                        key={item.id}  // 고유한 값으로 key 추가 (여기서는 item.id를 사용)
                        index={index}
                        item={item}
                        handleClickItem={handleClickItem}
                        handleEditReservation={handleEditReservation}
                        reservations={reservations}
                    />
                ))}
            </ItemListWrapper>


            {/* 승인 여부 변경 모달 */}
            {showModal && (
                <ChangeStatusModal handleStatusChange={handleStatusChange} activeButton={activeButton}
                                   setShowModal={setShowModal} handleConfirm={handleConfirm}
                                   selectedReservationId={selectedReservationId}/>
            )}

            {/* 선택된 아이템의 세부사항을 바텀시트로 보여줌 */}
            {selectedItem && (
                <EditItem
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                    onSave={() => {
                        setIsChanged(!isChanged);
                    }}
                />
            )}
        </>
    );
};

// 스타일링
const ItemListWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;


export default ItemListAdmin;
