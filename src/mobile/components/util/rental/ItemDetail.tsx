import {useEffect, useState} from "react";
import {BottomSheet} from "react-spring-bottom-sheet";
import "react-spring-bottom-sheet/dist/style.css";
import styled from "styled-components";
import DefaultImage from "resources/assets/rental/DefaultImage.svg"
import {getItemDetail, createReservation, Items, getAvailableQuantity} from "apis/rental.ts";
import useUserStore from "../../../../stores/useUserStore.ts"; // API 호출 함수 가져오기
import ImageBox from "./ImageBox.tsx";

interface ItemDetailProps {
    itemId: number;
    onClose: () => void;
}

export default function ItemDetail({itemId, onClose}: ItemDetailProps) {
    const [itemDetail, setItemDetail] = useState<Items | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [availableQuantity, setAvailableQuantity] = useState<number>(0);
    const [quantity, setQuantity] = useState(1);
    const [phoneNumber, setPhoneNumber] = useState<string>("");
    const [reservationLoading, setReservationLoading] = useState<boolean>(false);
    const [reservationError, setReservationError] = useState<string | null>(null);

    const {tokenInfo} = useUserStore();


    useEffect(() => {
        const fetchItemDetail = async () => {
            try {
                const data = await getItemDetail(itemId); // API 호출
                setItemDetail(data.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchItemDetail();
    }, [itemId]);

    useEffect(() => {
        if (startDate && endDate) {
            try {
// 현재 시간에 9시간을 더하여 한국 시간으로 변환
                const koreaTimeOffset = 9 * 60; // 한국은 UTC보다 9시간 빠름
                const formattedStartDate = new Date(new Date(startDate).getTime() + koreaTimeOffset * 60 * 1000).toISOString();
                const formattedEndDate = new Date(new Date(endDate).getTime() + koreaTimeOffset * 60 * 1000).toISOString();

// 예약 요청
                const data = getAvailableQuantity(itemId, {
                    startDateTime: formattedStartDate,
                    endDateTime: formattedEndDate,
                });
                console.log(data);
                setAvailableQuantity(Number(data));


            } catch (err) {
                // @ts-ignore
                // setReservationError(err instanceof Error ? err.response.data.msg : "예약 가능 수량을 받아오는 중 오류가 발생했습니다.");
            } finally {
                // setReservationLoading(false);
            }
        }

    }, [startDate, endDate]);

    const isPhoneNumberValid = (phoneNumber: string): boolean => {
        const phoneNumberRegex = /^01[0-9]\d{8,9}$/;
        return phoneNumberRegex.test(phoneNumber);
    };

    const handleReservation = async () => {
        if (!tokenInfo.accessToken) {
            alert("로그인 후 이용해 주세요.");
            return;
        }
        if (!startDate || !endDate || !phoneNumber) {
            alert("모든 입력칸을 채워주세요.");
            return;
        }
        if (quantity <= 0) {
            alert("수량은 1개 이상이어야 합니다.");
            return;
        }
        if (!isPhoneNumberValid(phoneNumber)) {
            alert("전화번호 형식을 확인해주세요.");
            return;
        }

        try {
// 현재 시간에 9시간을 더하여 한국 시간으로 변환
            const koreaTimeOffset = 9 * 60; // 한국은 UTC보다 9시간 빠름
            const formattedStartDate = new Date(new Date(startDate).getTime() + koreaTimeOffset * 60 * 1000).toISOString();
            const formattedEndDate = new Date(new Date(endDate).getTime() + koreaTimeOffset * 60 * 1000).toISOString();

            setReservationLoading(true);
            setReservationError(null);

// 예약 요청
            await createReservation(itemId, {
                startDateTime: formattedStartDate,
                endDateTime: formattedEndDate,
                phoneNumber: phoneNumber,
                quantity: quantity,
            });


            alert("예약이 성공적으로 등록되었습니다.");
            onClose(); // 바텀시트 닫기
        } catch (err) {
            // @ts-ignore
            setReservationError(err instanceof Error ? err.response.data.msg : "예약 중 오류가 발생했습니다.");
        } finally {
            setReservationLoading(false);
        }
    };

    const getAvailableDates = () => {
        const today = new Date();

        // 오늘 기준 3일 후 날짜 구하기
        const startDate = new Date(today);
        startDate.setDate(today.getDate() + 3);

        // 14일 이내 날짜 구하기
        const endDate = new Date(today);
        endDate.setDate(today.getDate() + 14);

        const availableDates: string[] = [];

        // 가능한 날짜 구하기 (주말 제외, 10시부터 17시까지)
        for (let currentDate = new Date(startDate); currentDate <= endDate; currentDate.setDate(currentDate.getDate() + 1)) {
            const dayOfWeek = currentDate.getDay();

            // 주말 제외 (0: 일요일, 6: 토요일)
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                const month = currentDate.getMonth() + 1;  // 월은 0부터 시작하므로 1을 더해줍니다.
                const day = currentDate.getDate();  // 일자 추출
                availableDates.push(`${month}월 ${day}일`);
            }
        }

        return availableDates;
    };

    if (loading) {
        return <div>로딩 중...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }


    return (
        <BottomSheet open={true} onDismiss={onClose}>
            <DetailWrapper>
                <h3>대여 정보를 확인해주세요 !</h3>
                <GoodWrapper>
                    <ImageBox
                        key={`${itemId}-${itemDetail?.modifiedDate}`} // key 추가로 강제 리렌더링
                        src={`https://portal.inuappcenter.kr/images/item/${itemId}-1?cache_bust=${itemDetail?.modifiedDate}`}
                        alt={DefaultImage}
                    />
                    <DescriptionBox>
                        <span className={'name'}>{itemDetail?.name}</span><br/>
                        총 수량 : {itemDetail?.totalQuantity}<br/>
                        대여료 : {itemDetail?.deposit}
                    </DescriptionBox>
                </GoodWrapper>
                <Content>
                    🚧 오늘 기준 3일 후부터 14일 이내, 오전 10시부터 오후 5시 사이에 가능하며, 토요일 및 일요일에는 불가능합니다.<br/>
                    ⏰ 대여-반납 가능 일자 : <br/>
                    {getAvailableDates().map((date, index, array) => (
                        <>
                            {date}{index < array.length - 1 && ', '}
                        </>
                    ))}

                </Content>
                <InputWrapper>
                    <label>
                        대여 일자:
                        <input
                            type="datetime-local"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </label>
                    <label>
                        반납 일자:
                        <input
                            type="datetime-local"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </label>
                    <label>
                        수량:<br/>{availableQuantity}개 가능
                        <input
                            type="string"
                            name="quantity"
                            value={quantity}
                            onChange={(e) => {
                                setQuantity(Number(e.target.value));
                            }}
                        />
                    </label>
                    <label>
                        전화번호:
                        <input
                            type="tel"
                            name="phoneNumber"
                            placeholder="01012345678 ( - 없이 입력해주세요)"
                            value={phoneNumber}
                            onChange={(e) => {
                                setPhoneNumber(e.target.value);
                            }}
                        />
                    </label>

                </InputWrapper>
                {reservationError && <ErrorText>{reservationError}</ErrorText>}
                <ButtonWrapper>
                    <button onClick={handleReservation} disabled={reservationLoading}>
                        {reservationLoading ? "처리 중..." : "대여하기"}
                    </button>
                </ButtonWrapper>
            </DetailWrapper>
        </BottomSheet>
    );
}

const DetailWrapper = styled.div`
    padding: 16px;
    margin-bottom: 80px;
    display: flex;
    flex-direction: column;
    gap: 16px;

    h2 {
        margin: 0;
    }

    p {
        margin: 4px 0;
    }

    img {
        width: 80px;
    }
`;

const InputWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;

    label {
        font-size: 14px;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    input {
        padding: 8px;
        font-size: 14px;
        border: 1px solid #ccc;
        border-radius: 4px;
    }
`;

const ButtonWrapper = styled.div`
    display: flex;
    gap: 8px;

    button {
        padding: 8px 16px;
        font-size: 14px;
        font-weight: bold;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        width: 100%;
    }

    button:first-child {
        background-color: #7aa7e5;
        color: white;
    }
`;

const ErrorText = styled.div`
    color: red;
    font-size: 14px;
`;


const Content = styled.div`
    font-weight: 400;
    font-size: 13px;
    color: #656565;
    width: 100%;
`;


const GoodWrapper = styled.div`
    width: 100%;
    height: 158px; /* 고정된 높이 */
    border: 0.871981px solid #7aa7e5;
    border-radius: 15px;


    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    box-sizing: border-box;
`;


const DescriptionBox = styled.div`
    width: 100%;
    height: fit-content; /* 내용에 맞는 높이 */
    text-align: center;

    font-style: normal;
    font-weight: 500;
    font-size: 10px;
    line-height: 12px;
    text-align: center;
    letter-spacing: 0.871981px;

    color: #000000;


    .name {
        font-style: normal;
        font-weight: 700;
        font-size: 10px;
        line-height: 12px;
        text-align: center;
        letter-spacing: 0.871981px;

        color: #000000;


    }
`;
