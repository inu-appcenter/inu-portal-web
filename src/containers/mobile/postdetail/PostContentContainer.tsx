import PostTitle from "@/components/mobile/postdetail/post/posttitle";
import PostContent from "@/components/mobile/postdetail/post/postcontent";
import PostActionBar from "@/components/mobile/postdetail/post/PostActionBar";
import styled from "styled-components";
import { PostDetail } from "@/types/posts";
import { CouncilNotice } from "@/types/councilNotices";
import { Petition } from "@/types/petitions";

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
    <OuterContainer>
      {ClubRecruit && (
        <>
          <HeaderAndContentWrapper>
            <PostTitle
              id={ClubRecruit.id}
              title={ClubRecruit.title}
              createDate={ClubRecruit.createDate}
              view={ClubRecruit.view}
              writer={ClubRecruit.writer}
              memberId={ClubRecruit.memberId}
              fireId={ClubRecruit.fireId}
            />
            <PostContent
              id={ClubRecruit.id}
              content={ClubRecruit.content}
              imageCount={ClubRecruit.imageCount}
              modifiedDate={ClubRecruit.modifiedDate}
              type="TIPS"
            />
          </HeaderAndContentWrapper>
          <PostActionBar
            id={ClubRecruit.id}
            like={ClubRecruit.like}
            isLiked={ClubRecruit.isLiked}
            scrap={ClubRecruit.scrap}
            isScraped={ClubRecruit.isScraped}
            replyCount={ClubRecruit.replies?.length || 0}
            title={ClubRecruit.title}
          />
        </>
      )}
      {councilNotice && (
        <HeaderAndContentWrapper>
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
        </HeaderAndContentWrapper>
      )}
      {petition && (
        <HeaderAndContentWrapper>
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
        </HeaderAndContentWrapper>
      )}
    </OuterContainer>
  );
}

const OuterContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: var(--bg-subtle, #f8f9fb);
  width: 100%;
`;

const HeaderAndContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  //padding: 24px 16px 28px;
  padding: 0 16px;
  margin-bottom: 100px;
  //padding-top: 0;
  width: 100%;
  box-sizing: border-box;
`;
