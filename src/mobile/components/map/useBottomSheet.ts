import {useRef, useEffect, useState} from 'react';
import {MIN_Y, MAX_Y} from './BottomSheetOption.ts';

interface BottomSheetMetrics {
    touchStart: {
        sheetY: number;
        touchY: number;
    };
    touchMove: {
        prevTouchY?: number;
        movingDirection: "none" | "down" | "up";
    };
    isContentAreaTouched: boolean;
}

export default function useBottomSheet() {
    const sheet = useRef<HTMLDivElement>(null);
    const content = useRef<HTMLDivElement>(null);
    const header = useRef<HTMLDivElement>(null); // Header ref 추가

    const [sheetHeight, setSheetHeight] = useState<number>(MAX_Y - MIN_Y); // 초기 높이 설정


    const metrics = useRef<BottomSheetMetrics>({
        touchStart: {
            sheetY: 0,
            touchY: 0,
        },
        touchMove: {
            prevTouchY: 0,
            movingDirection: "none",
        },
        isContentAreaTouched: false
    });

    useEffect(() => {
        const canUserMoveBottomSheet = () => {
            const {touchMove, isContentAreaTouched} = metrics.current;
            if (!isContentAreaTouched) {
                return true;
            }

            if (sheet.current!.getBoundingClientRect().y !== MIN_Y) {
                return true;
            }

            if (touchMove.movingDirection === 'down') {
                return content.current!.scrollTop <= 0;
            }
            return false;
        };

        const handleTouchStart = (e: TouchEvent) => {
            sheet.current!.style.transition = 'none'; // 터치 시작 시 transition 제거

            const {touchStart} = metrics.current;
            touchStart.sheetY = sheet.current!.getBoundingClientRect().y;
            touchStart.touchY = e.touches[0].clientY;
        };

        const handleTouchMove = (e: TouchEvent) => {
            const {touchStart, touchMove} = metrics.current;
            const currentTouch = e.touches[0];

            if (touchMove.prevTouchY === undefined) {
                touchMove.prevTouchY = touchStart.touchY;
            }

            if (touchMove.prevTouchY === 0) {
                touchMove.prevTouchY = touchStart.touchY;
            }

            if (touchMove.prevTouchY < currentTouch.clientY) {
                touchMove.movingDirection = 'down';
            }

            if (touchMove.prevTouchY > currentTouch.clientY) {
                touchMove.movingDirection = 'up';
            }

            if (canUserMoveBottomSheet()) {
                e.preventDefault();
                const touchOffset = currentTouch.clientY - touchStart.touchY;
                let nextSheetY = touchStart.sheetY + touchOffset;

                if (nextSheetY <= MIN_Y) {
                    nextSheetY = MIN_Y;
                }

                if (nextSheetY >= MAX_Y) {
                    nextSheetY = MAX_Y;
                }

                const newHeight = window.innerHeight - nextSheetY;

                setSheetHeight(newHeight); // ✅ 높이 업데이트


                sheet.current!.style.setProperty('transform', `translateY(${nextSheetY - MAX_Y}px)`);
            } else {
                document.body.style.overflowY = 'hidden';
            }
        };

        const handleTouchEnd = () => {
            document.body.style.overflowY = 'auto';

            //바텀 시트 높이 조정을 자유롭게 하기 위해 주석 처리
            // const {touchMove} = metrics.current;
            // const currentSheetY = sheet.current!.getBoundingClientRect().y;

            // if (currentSheetY !== MIN_Y) {
            //     if (touchMove.movingDirection === 'down') {
            //         sheet.current!.style.setProperty('transform', 'translateY(0)');
            //     }
            //
            //     if (touchMove.movingDirection === 'up') {
            //         sheet.current!.style.setProperty('transform', `translateY(${MIN_Y - MAX_Y}px)`);
            //     }
            // }

            metrics.current = {
                touchStart: {sheetY: 0, touchY: 0},
                touchMove: {prevTouchY: 0, movingDirection: "none"},
                isContentAreaTouched: false
            };
        };

        // Header 부분에만 이벤트 리스너를 추가합니다.
        if (header.current) {
            header.current.addEventListener('touchstart', handleTouchStart);
            header.current.addEventListener('touchmove', handleTouchMove);
            header.current.addEventListener('touchend', handleTouchEnd);
        }

    }, []);

    useEffect(() => {
        const handleTouchStart = () => {
            metrics.current!.isContentAreaTouched = true;
        };
        if (content.current) {
            content.current!.addEventListener('touchstart', handleTouchStart);
        }
    }, []);

    return {sheet, content, header, sheetHeight}; // ✅ sheetHeight 반환
}
