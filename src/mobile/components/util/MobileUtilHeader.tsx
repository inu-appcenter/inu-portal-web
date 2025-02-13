import useMobileNavigate from "hooks/useMobileNavigate";
import styled from "styled-components";

interface Props {
  selectedType: string;
}

const buttons = [
  { type: "lost", label: "분실물 게시판" },
  { type: "rental", label: "물품 대여" },
  { type: "book", label: "벼룩시장" },
];

export default function MobileUtilHeader({ selectedType }: Props) {
  const mobileNavigate = useMobileNavigate();

  return (
    <MobileUtilHeaderWrapper>
      {buttons.map((btn) => (
        <button
          key={btn.type}
          onClick={() => mobileNavigate(`/home/util?type=${btn.type}`)}
          className={selectedType === btn.type ? "selected" : ""}
        >
          {btn.label}
        </button>
      ))}
    </MobileUtilHeaderWrapper>
  );
}

const MobileUtilHeaderWrapper = styled.div`
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
    color: black;
  }
  .selected {
    background: linear-gradient(180deg, #6d98d7 0%, #0e4d9d 100%);
    color: white;
  }
`;
