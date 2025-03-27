import PostTitle from "mobile/components/postdetail/post/posttitle";
import PostContent from "mobile/components/postdetail/post/postcontent";
import styled from "styled-components";
import { PostDetail } from "types/posts";
import { CouncilNotice } from "types/councilNotices";
import { Petition } from "types/petitions";

interface PostContentContainerProps {
  ClubRecruit?: PostDetail;
  councilNotice?: CouncilNotice;
  petition?: Petition;
}

export default function PostContentContainer({
  ClubRecruit,
  councilNotice,
  petition,
}: PostContentContainerProps) {
  return (
    <Wrapper>
      {ClubRecruit && (
        <>
          <PostTitle
            id={ClubRecruit.id}
            title={ClubRecruit.title}
            createDate={ClubRecruit.createDate}
            view={ClubRecruit.view}
            writer={ClubRecruit.writer}
          />
          <PostContent
            id={ClubRecruit.id}
            content={ClubRecruit.content}
            imageCount={ClubRecruit.imageCount}
            modifiedDate={ClubRecruit.modifiedDate}
            type="TIPS"
          />
        </>
      )}
      {councilNotice && (
        <>
          <PostTitle
            id={councilNotice.id}
            title={councilNotice.title}
            createDate={councilNotice.createDate}
            view={councilNotice.view}
          />
          <PostContent
            id={councilNotice.id}
            content={councilNotice.content}
            imageCount={councilNotice.imageCount}
            modifiedDate={councilNotice.modifiedDate}
            type="COUNCILNOTICE"
          />
        </>
      )}
      {petition && (
        <>
          <PostTitle
            id={petition.id}
            title={petition.title}
            createDate={petition.createDate}
            view={petition.view}
            writer={petition.writer}
          />
          <PostContent
            id={petition.id}
            content={petition.content}
            imageCount={petition.imageCount}
            modifiedDate={petition.modifiedDate}
            type="PETITION"
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
