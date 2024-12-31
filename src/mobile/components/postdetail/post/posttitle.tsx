import styled from "styled-components";
import eyeImg from "resources/assets/posts/eye.svg";

interface PostTitleProps {
  id: number;
  title: string;
  createDate: string;
  view: number;
  writer?: string;
}

export default function PostTitle({
  id,
  title,
  createDate,
  view,
  writer,
}: PostTitleProps) {
  // const token = useSelector((state: any) => state.user.token);
  return (
    <>
      <PostTitleWrapper>
        <span className="m-title">제목: </span>
        <span className="m-titleText">{title}</span>
      </PostTitleWrapper>
      <Line />

      <div className="m-PostInfo" key={id}>
        <PostInfo>
          <div className="postinfo1">
            <span className="infoText">{createDate}</span>
          </div>
          <div className="postinfo2">
            <img src={eyeImg} />
            <span className="viewInfo">{view}</span>
            <span className="m-writerInfo">{writer || "총학생회"}</span>
          </div>
        </PostInfo>
      </div>
    </>
  );
}

const PostTitleWrapper = styled.div`
  .m-title {
    padding: 5px;
    font-size: 15px;
    font-weight: 700;
    line-height: 20px;
    text-align: left;
  }
  .m-titleText {
    font-size: 15px;
    font-weight: 00;
    line-height: 20px;
    text-align: left;
  }
`;
const Line = styled.div`
  border-top: 1px solid #ccc; /* 1픽셀 두께의 실선 구분선, 색상은 회색 */
`;
const PostInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-left: auto;
  gap: 15px;
  img {
    margin-right: 5px;
    top: 10px;
    width: 16px;
  }
  .postinfo2 {
    display: flex;
    top: 10px;
  }

  .viewInfo {
    margin-right: 10px;
    font-size: 10px;
    color: #969696;
    display: flex;
    position: relative;
    top: 10px;
  }

  .m-writerInfo {
    font-size: 14px;
    color: #666;
    display: flex;
    align-items: center;
    height: 31px;
    width: auto;
    border-radius: 100px;
    padding-left: 10px;
    padding-right: 10px;
    font-size: 13px;
    font-weight: 400;
    background: #ecf4ff;
  }
`;
