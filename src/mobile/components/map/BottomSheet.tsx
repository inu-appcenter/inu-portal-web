import {BOTTOM_SHEET_HEIGHT} from './BottomSheetOption';
import styled from 'styled-components';
import {motion} from "framer-motion";
import useBottomSheet from './useBottomSheet';
import Header from './Header';
import Content from '../../../../src/components/map/components/PlaceListPanel.tsx';

const Wrapper = styled(motion.div)`
    display: flex;
    flex-direction: column;

    position: fixed;
    z-index: 1;
    top: calc(100% - 200px); /*시트가 얼마나 높이 위치할지*/
    left: 0;
    right: 0;

    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.6);
    height: ${BOTTOM_SHEET_HEIGHT}px;

    background: #ffffff;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);

    transition: transform 400ms ease-out; /*바텀시트 애니메이션 속도*/

`

const BottomSheetContent = styled.div`
    overflow: auto;
    -webkit-overflow-scrolling: touch;
    margin-bottom: 30px;
    padding-bottom: 30px;


    display: flex;
    justify-content: center;

`

function BottomSheet() {

    const {sheet, content} = useBottomSheet();

    return (
        <Wrapper ref={sheet}>
            <Header/>
            <BottomSheetContent ref={content}>
                <Content/>
            </BottomSheetContent>
        </Wrapper>
    );
}

export default BottomSheet;