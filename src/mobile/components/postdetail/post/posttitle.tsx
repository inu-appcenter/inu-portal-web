import styled from "styled-components";
import eyeImg from "resources/assets/posts/eye.svg";
import PostUtilContainer from "../../../containers/postdetail/PostUtilContainer.tsx";

interface PostTitleProps {
  id: number;
  title: string;
  createDate: string;
  view?: number;
  writer?: string;
  like?: number;
  isLiked?: boolean;
  scrap?: number;
  isScraped?: boolean;
  hasAuthority?: boolean;
}

export default function PostTitle({
  id,
  title,
  createDate,
  view,
  writer,
  like,
  isLiked,
  scrap,
  isScraped,
  hasAuthority,
}: PostTitleProps) {
  // const token = useSelector((state: any) => state.user.token);
  return (
    <>
      <PostTitleWrapper>
        {title}
        {like && isLiked && scrap && isScraped && hasAuthority && (
          <PostUtilContainer
            id={id}
            like={like}
            isLiked={isLiked}
            scrap={scrap}
            isScraped={isScraped}
            hasAuthority={hasAuthority}
          />
        )}
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
  font-size: 16px;
  font-weight: 600;
  line-height: 20px;
  text-align: left;
  word-break: break-word;
  overflow-wrap: break-word;
  white-space: normal;

  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
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
