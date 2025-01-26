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
    z-index: 2;
    top: calc(100% - 200px);
    left: 0;
    right: 0;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.6);
    height: ${BOTTOM_SHEET_HEIGHT}px;
    background: #ffffff;
    transition: transform 400ms ease-out;
`;

const BottomSheetContent = styled.div`
    -webkit-overflow-scrolling: touch;
    margin-bottom: 30px;
    padding-bottom: 30px;
    display: flex;
    justify-content: center;
    width: 100%;
    height: 100%;
    overflow: hidden;
`;

function BottomSheet() {
    const {sheet, content, header} = useBottomSheet();

    return (
        <Wrapper ref={sheet}>
            <Header headerRef={header}/>
            <BottomSheetContent ref={content}>
                <Content/>
            </BottomSheetContent>
        </Wrapper>
    );
}

export default BottomSheet;
