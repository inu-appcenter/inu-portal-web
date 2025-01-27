import styled from "styled-components";

import Rental from "../../../src/components/rental/Rental.tsx";

export default function MobileTipsPage() {

    return (
        <MobileTipsPageWrapper>
            <Wrapper>
                <Rental/>
            </Wrapper>
        </MobileTipsPageWrapper>
    );
}

const MobileTipsPageWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 0 16px 0 16px;
    width: 100%;
`;

const Wrapper = styled.div`
    display: flex;
    width: 100%;
    height: 100%;
`;
