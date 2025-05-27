import styled from "styled-components";
import { ReactNode } from "react";

export default function Banner({
  title,
  imgsrc,
  content,
}: {
  title: string;
  imgsrc: string;
  content: ReactNode;
}) {
  return (
    <BannerWrapper>
      <div className="title-img">
        <span className="title">{title}</span>
        {/* <img src={AiExample} alt="" /> */}
      </div>
      <a href={"https://www.currumi.shop/10"}>
        <img src={imgsrc} alt={"배너 이미지"} />
      </a>
      <span style={{ fontSize: "20px", lineHeight: "30px" }}>{content}</span>
    </BannerWrapper>
  );
}

const BannerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  color: #333366;
  background-color: #f5f6fa;
  border-radius: 12px;
  height: 100%;
  overflow-y: auto;

  .title-img {
    border-bottom: 1px solid #ccc;
    padding-bottom: 6px;
    margin-bottom: 6px;
    display: flex;
    justify-content: flex-start; /* 왼쪽 정렬 */
  }

  .title {
    font-size: 28px;
    font-weight: 700;
    text-align: left;
  }

  img {
    width: 100%;
    border-radius: 8px;
    object-fit: contain;
  }

  span {
    font-size: 18px;
    line-height: 28px;
    text-align: left; /* 본문도 왼쪽 정렬 */
  }
`;
