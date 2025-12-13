import styled from 'styled-components';

const Wrapper = styled.div`
    height: 30px;
    border-top-left-radius: 12px;
    border-bottom-right-radius: 12px;
    position: relative;
    padding-top: 12px;
    padding-bottom: 4px;
`;

const Handle = styled.div`
    width: 45.92px;
    height: 5.74px;
    border-radius: 2px;
    background-color: #DEE2E6;
    margin: auto;
`;

const Header = ({headerRef}: { headerRef: React.RefObject<HTMLDivElement> }) => {
    return (
        <Wrapper ref={headerRef}>
            <Handle/>
        </Wrapper>
    );
};

export default Header;
