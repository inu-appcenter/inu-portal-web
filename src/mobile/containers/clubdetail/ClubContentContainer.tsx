import styled from "styled-components";
import { ClubRecruit } from "../../../types/club.ts";
import ClubContent from "../../components/club/clubcontent.tsx";

interface PostContentContainerProps {
  ClubRecruit?: ClubRecruit;
  clubId: string | null;
}

export default function ClubContentContainer({
  ClubRecruit,
  clubId,
}: PostContentContainerProps) {
  return (
    <Wrapper>
      {ClubRecruit && (
        <>
          <ClubContent
            id={clubId || "0"}
            content={ClubRecruit.recruit}
            imageCount={ClubRecruit.imageCount}
            modifiedDate={ClubRecruit.modifiedDate}
          />
        </>
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  padding: 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 100px;
`;
