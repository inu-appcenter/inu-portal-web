import {useState, useEffect} from "react";
import styled from "styled-components";
import {Items} from "apis/rental.ts";
import {getItemsList, getItemReservations, setConfirmReject} from "apis/rentalAdmin.ts";
import EditItem from "./EditItem";

// 예약 데이터 타입 정의
interface Reservation {
    reservationId: number;
    memberId: string;
    startDateTime: string;
    endDateTime: string;
    reservationStatus: string;
    studentId: string;
    phoneNumber: number;

}

interface ApiResponse<T> {
    contents: T;
}


const ItemListAdmin = () => {
    const [items, setItems] = useState<Items[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedItem, setSelectedItem] = useState<Items | null>(null);
    const [isChanged, setIsChanged] = useState<boolean>(true);
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
                            console.error("예약 리스트를 가져오는 중 오류 발생:", error);
                        }
                    }
                }
            } catch (error) {
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
            const response = await setConfirmReject(reservationId, status); // CONFIRM | REJECTED
            console.log('Reservation status updated:', response);

            // 성공 시 alert 띄우고 모달 닫기
            alert('예약 상태가 성공적으로 업데이트되었습니다.');
            setShowModal(false);
        } catch (error) {
            console.error('Error updating reservation status:', error);

            // 실패 시 alert 띄우기
            alert('예약 상태 업데이트에 실패했습니다.');
        }
    };


    if (loading) {
        return <p>로딩 중...</p>;
    }

    return (
        <>
            <ItemListWrapper>
                {items.map((item, index) => (
                    <ItemCard key={index}>
                        <ManageButton onClick={() => handleClickItem(item)}>관리</ManageButton>

                        <ItemInfo>
                            <ItemName>{item.name}</ItemName>
                            <ItemCategory>{item.itemCategory}</ItemCategory>
                        </ItemInfo>
                        <div>
                            <ItemQuantity>수량: {item.totalQuantity}</ItemQuantity>
                            {' '}
                            <ItemDeposit>보증금: {item.deposit.toLocaleString()}원</ItemDeposit>
                        </div>

                        {/* 예약 리스트 표시 */}
                        {item.id !== undefined && reservations[item.id] && reservations[item.id].length > 0 && (
                            <ReservationList>
                                <h4>예약 목록</h4>
                                <ul>
                                    {reservations[item.id].map((reservation, idx) => (
                                        <li key={idx}>
                                            <div>예약자 ID: {reservation.memberId}</div>
                                            <div>
                                                대여 날짜: {new Date(reservation.startDateTime).toLocaleString('ko-KR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                            </div>
                                            <div>
                                                반납 날짜: {new Date(reservation.endDateTime).toLocaleString('ko-KR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                            </div>
                                            <div>예약자 학번: {reservation.studentId}</div>
                                            <div>예약자 전화번호: {reservation.phoneNumber}</div>

                                            <div>상태: {reservation.reservationStatus === "CONFIRM" ? "승인" :
                                                reservation.reservationStatus === "PENDING" ? "관리자 확인 중" :
                                                    reservation.reservationStatus === "REJECTED" ? "거절됨" :
                                                        "알 수 없음"
                                            }</div>

                                            {/* 수정 및 삭제 버튼 추가 */}
                                            <ButtonWrapper>
                                                <StyledButton
                                                    onClick={() => handleEditReservation(reservation.reservationId)}>
                                                    승인 관리
                                                </StyledButton>
                                            </ButtonWrapper>
                                        </li>
                                    ))}
                                </ul>
                            </ReservationList>
                        )}
                    </ItemCard>
                ))}
            </ItemListWrapper>

            {/* 모달 */}
            {showModal && (
                <ModalWrapper>
                    <ModalContent>
                        <h3>예약 상태 변경</h3>
                        <div>
                            <StatusButton
                                onClick={() => handleStatusChange("CONFIRM")}
                                active={activeButton === "CONFIRM"}
                                status="CONFIRM"
                            >
                                승인
                            </StatusButton>
                            <StatusButton
                                onClick={() => handleStatusChange("REJECTED")}
                                active={activeButton === "REJECTED"}
                                status="REJECTED"
                            >
                                거절
                            </StatusButton>
                        </div>
                        <ConfirmCancelButtonWrapper>

                            <CancelButton
                                onClick={() => setShowModal(false)}
                            >
                                취소
                            </CancelButton>
                            <ConfirmButton
                                onClick={() => handleConfirm(selectedReservationId)}
                            >
                                확인
                            </ConfirmButton>
                        </ConfirmCancelButtonWrapper>
                    </ModalContent>

                </ModalWrapper>
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

const ItemCard = styled.div`
    border: 1px solid #ccc;
    padding: 16px;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    position: relative;
`;

const ManageButton = styled.button`
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    cursor: pointer;
    font-size: 14px;

    &:hover {
        background-color: #218838;
    }

    &:focus {
        outline: none;
    }
`;

const ItemInfo = styled.div`
    display: flex;
    flex-direction: column;
`;

const ItemName = styled.h3`
    margin: 0;
    font-size: 18px;
`;

const ItemCategory = styled.span`
    font-size: 14px;
    color: #666;
`;

const ItemQuantity = styled.span`
    font-size: 16px;
`;

const ItemDeposit = styled.span`
    font-size: 16px;
    color: #007bff;
`;

const ReservationList = styled.div`
    margin-top: 16px;
    font-size: 14px;
    color: #333;

    h4 {
        font-size: 16px;
        margin-bottom: 8px;
    }

    ul {
        list-style-type: none;
        padding-left: 0;
    }

    li {
        margin-bottom: 8px;
        padding: 8px;
        border: 1px solid #f0f0f0;
        border-radius: 4px;
        display: flex;
        flex-direction: column;
    }
`;

const ButtonWrapper = styled.div`
    display: flex;
    gap: 8px;
`;

const StatusButton = styled.button<{ active: boolean, status: string }>`
    background-color: ${({active, status}) =>
            active
                    ? (status === 'CONFIRM' ? "#007bff" : "#dc3545") // 승인: 파란색, 거절: 빨간색
                    : "#e0e0e0"
    };
    color: ${({active}) => (active ? "white" : "#333")};
    border: 1px solid ${({active, status}) => (active ? (status === 'CONFIRM' ? "#007bff" : "#dc3545") : "#ccc")};
    border-radius: 4px;
    padding: 10px 20px;
    cursor: pointer;
    margin: 0 10px;

    &:hover {
        background-color: ${({active, status}) =>
                active
                        ? (status === 'CONFIRM' ? "#0056b3" : "#c82333")
                        : "#ccc"
        };
    }

    &:focus {
        outline: none;
    }
`;


const ModalWrapper = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
`;

const ModalContent = styled.div`
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    max-width: 400px;
    width: 100%;
    text-align: center;
`;

const StyledButton = styled.button`
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    cursor: pointer;

    &:hover {
        background-color: #0056b3;
    }

    &:focus {
        outline: none;
    }`
;


const ConfirmCancelButtonWrapper = styled.div`
    display: flex;
    justify-content: space-evenly;
    margin-top: 20px;
`;

const ConfirmButton = styled.button`
    background-color: #007bff;
    color: white;
    border: 1px solid #007bff;
    border-radius: 4px;
    padding: 10px 20px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s ease, border-color 0.3s ease;

    &:hover {
        background-color: #0056b3;
        border-color: #0056b3;
    }

    &:focus {
        outline: none;
    }

    &:active {
        background-color: #004085;
    }
`;

const CancelButton = styled.button`
    background-color: #f8f9fa;
    color: #333;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 10px 20px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s ease, border-color 0.3s ease;

    &:hover {
        background-color: #e2e6ea;
        border-color: #adb5bd;
    }

    &:focus {
        outline: none;
    }

    &:active {
        background-color: #d6d8db;
    }
`;


export default ItemListAdmin;
