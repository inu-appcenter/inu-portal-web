import { useNavigate } from "react-router-dom";
import styled from "styled-components";

interface Props {
  selectedType: string;
}

const buttons = [
  { type: "petition", label: "총학청원" },
  { type: "notice", label: "총학공지" },
];

export default function MobileCouncilHeader({ selectedType }: Props) {
  const navigate = useNavigate();

  return (
    <MobileCouncilHeaderWrapper>
      {buttons.map((btn) => (
        <button
          key={btn.type}
          onClick={() => navigate(`/home/council?type=${btn.type}`)}
          className={selectedType === btn.type ? "selected" : ""}
        >
          {btn.label}
        </button>
      ))}
    </MobileCouncilHeaderWrapper>
  );
}

const MobileCouncilHeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 46px;
  color: var(--text-tertiary);
  background: var(--bg-brand);

  button {
    box-sizing: content-box;
    height: 100%;
    flex: 1;
    background-color: transparent;
    border: 0;
    font-weight: 600;
    color: var(--text-primary);
  }

  .selected {
    background: linear-gradient(180deg, #6d98d7 0%, #0e4d9d 100%);
    color: var(--text-inverse);
    min-height: 46px;
  }
`;
