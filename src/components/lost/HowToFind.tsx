import styled from "styled-components";
// import AiExample from "resources/assets/ai/ai-example.svg";
import howtofind from "resources/assets/lost/howtofind.png";
import useMobileNavigate from "../../hooks/useMobileNavigate.ts";

export default function HowToFind() {
  const mobileNavigate = useMobileNavigate();
  return (
    <HowToBuyWrapper>
      <div className="title-img">
        <span className="title">HOW TO FIND</span>
        {/* <img src={AiExample} alt="" /> */}
      </div>
      <img src={howtofind} alt={"분실물 수령 방법 이미지"} />
      <span style={{ fontSize: "20px", lineHeight: "30px" }}>
        총학생회실(17호관 206호)로 방문 후 수령하실 수 있습니다!
        <br />
        <a
          onClick={() => {
            mobileNavigate("/home/campus");
          }}
          style={{
            textDecoration: "underline",
            color: "blue",
            cursor: "pointer",
          }}
        >
          캠퍼스맵
        </a>
        에서 총학생회실 위치 확인하기
      </span>
    </HowToBuyWrapper>
  );
}

const HowToBuyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: white;
  overflow-y: auto;

  .title-img {
    border-bottom: 2px solid white;
    display: flex;
    justify-content: space-between;
  }

  .title {
    align-self: flex-end;
    font-size: 32px;
    font-weight: 800;
  }

  img {
    //@media (max-width: 768px) {
    //  width: 100px;
    //}
    width: 100%;
  }
`;
