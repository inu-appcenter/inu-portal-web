import styled from "styled-components";
// import AiExample from "resources/assets/ai/ai-example.svg";
import howtoBuy from "resources/assets/book/howtoBuy.png"

export default function HowToUse() {
  return (
    <HowToBuyWrapper>
      <div className="title-img">
        <span className="title">HOW TO BUY</span>
        {/* <img src={AiExample} alt="" /> */}
      </div>
      <img src={howtoBuy} alt={"구매방법 이미지"}/>
      <span style={{ fontSize: "20px", lineHeight: "30px" }}>
        더 자세한 내용은 <a href={"https://www.instagram.com/p/DGuuRw1Pr4e/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="}>여기</a>를 클릭해주세요!
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
    width:100%;
  }
`;
