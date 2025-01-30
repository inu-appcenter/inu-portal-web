import useMobileNavigate from "hooks/useMobileNavigate";
import styled from "styled-components";

interface Props {
    selectedType: string;
}

const buttons = [
    {type: "campusmap", label: "캠퍼스맵"},
    {type: "HelloBus", label: "헬로버스"},
];

export default function MobileCampusHeader({selectedType}: Props) {
    const mobileNavigate = useMobileNavigate();

    return (
        <MobileCampusHeaderWrapper>
            {buttons.map((btn) => (
                <button
                    key={btn.type}
                    onClick={() => mobileNavigate(`/home/campus?type=${btn.type}`)}
                    className={selectedType === btn.type ? "selected" : ""}
                >
                    {btn.label}
                </button>
            ))}
        </MobileCampusHeaderWrapper>
    );
}

const MobileCampusHeaderWrapper = styled.div`
    display: flex;
    align-items: center;
    width: 100%;
    min-height: 46px;
    color: rgba(155, 155, 155, 1);
    background: rgba(243, 247, 254, 1);

    button {
        box-sizing: content-box;
        height: 100%;
        flex: 1;
        background-color: transparent;
        border: 0;
        font-weight: 600;
    }

    .selected {
        background: linear-gradient(180deg, #6d98d7 0%, #0e4d9d 100%);
        color: white;
    }
`;
