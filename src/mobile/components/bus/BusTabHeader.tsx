import { useLocation } from "react-router-dom";
import useMobileNavigate from "hooks/useMobileNavigate";
import styled from "styled-components";

interface Props {
  Type: string;
}

// 탭 구성
const SchoolTab = [
  { type: "INU", label: "인입런" },
  { type: "BIT", label: "지정단런" },
];

const HomeTab = [
  { type: "main", label: "인천대 정문" },
  { type: "science", label: "공대/자연대" },
  { type: "dorm", label: "기숙사 앞" },
];

export default function BusTabHeader({ Type }: Props) {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const tabList = Type === "go-school" ? SchoolTab : HomeTab;
  const mobileNavigate = useMobileNavigate();

  const selectedTab = query.get("tab");

  return (
    <BusTabHeaderWrapper>
      {tabList.map((tab) => (
        <button
          key={tab.type}
          onClick={() =>
            mobileNavigate(`/bus/info?type=${Type}&tab=${tab.type}`)
          }
          className={selectedTab === tab.type ? "selected" : ""}
        >
          {tab.label}
        </button>
      ))}
    </BusTabHeaderWrapper>
  );
}

const BusTabHeaderWrapper = styled.div`
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
    min-height: 46px;
  }
`;
