import styled from "styled-components";
import { ClubRecruit } from "../../../types/club.ts";
import ClubContent from "../../components/club/clubcontent.tsx";

interface PostContentContainerProps {
  ClubRecruit?: ClubRecruit;
}

export default function ClubContentContainer({
  ClubRecruit,
}: PostContentContainerProps) {
  return (
    <Wrapper>
      {ClubRecruit && (
        <>
          <ClubContent
            id={1}
            content={ClubRecruit.recruit}
            imageCount={ClubRecruit.imageCount}
            modifiedDate={ClubRecruit.modifiedDate}
            type="CLUBRECRUIT"
          />
        </>
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  margin: 20px 20px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 100px;
`;
