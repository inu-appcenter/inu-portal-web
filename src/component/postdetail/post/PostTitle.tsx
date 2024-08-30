import eyeImg from "../../../resource/assets/eye-img.svg";
import datePencilImg from "../../../resource/assets/date-pencil-img.svg";
import { useSelector } from "react-redux";
import styled from "styled-components";
import DeletePostBtn from "./DeletePostBtn";
import EditPostBtn from "./EditPostBtn";

interface PostTitleProps {
  title: string;
  createDate: string;
  view: number;
  writer: string;
  id: string;
  hasAuthority: boolean;
}

export default function PostTitle({
  title,
  createDate,
  view,
  writer,
  id,
  hasAuthority,
}: PostTitleProps) {
  const token = useSelector((state: any) => state.user.token);

  const handlePostUpdate = () => {
    // Functionality for post update
  };

  return (
    <PostTitleWrapper>
      <TitleText>{title}</TitleText>
      <PostInfo key={id}>
        {hasAuthority && (
          <EditPostWrapper>
            <DeletePostBtn
              token={token}
              id={id}
              onPostUpdate={handlePostUpdate}
            />
            <EditPostBtn id={id} />
          </EditPostWrapper>
        )}
        <TitleInfo>
          <InfoText>
            <img src={datePencilImg} alt="date pencil" /> {createDate}
          </InfoText>
          <InfoText>
            <img src={eyeImg} alt="eye" /> {view}
          </InfoText>
          <WriterInfo>{writer}</WriterInfo>
        </TitleInfo>
      </PostInfo>
    </PostTitleWrapper>
  );
}

// Styled Components
const PostTitleWrapper = styled.div`
  display: grid;
  flex-direction: column;
  justify-content: space-between;
`;

const TitleText = styled.span`
  margin: 30px 20px;
  font-size: 25px;
  font-weight: 400;
  align-items: center;
`;

const PostInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const EditPostWrapper = styled.div`
  display: inline-flex;
  margin: 0 10px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

const TitleInfo = styled.div`
  margin: 0px 10px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 30px;
`;

const InfoText = styled.span`
  font-size: 13px;
  font-weight: 400;
  gap: 10px;
  display: flex;
  align-items: center;
  color: #969696;
`;

const WriterInfo = styled.span`
  display: flex;
  align-items: center;
  height: 31px;
  width: auto;
  border-radius: 100px;
  background: linear-gradient(270deg, #ffffff 24.49%, #aac9ee 100%);
  padding-left: 10px;
  padding-right: 10px;
  font-size: 13px;
  font-weight: 400;
`;
