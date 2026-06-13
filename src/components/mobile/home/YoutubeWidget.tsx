import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import Divider from "@/components/common/Divider";
import Skeleton from "@/components/common/Skeleton";
import SortDropBox from "@/components/mobile/notice/Sort";
import Box from "@/components/common/Box";
import type { NoticeSort } from "@/apis/notices";
import { mixpanelTrack } from "@/utils/mixpanel";

import Ripple from "@/components/common/Ripple";

interface VideoData {
  id: string;
  title: string;
  thumbnailUrl: string;
  publishedAt: string;
  viewCount: string;
}

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const CHANNEL_ID = "UCqOO8FqoVW6Y87jLnqhdflA";
const UPLOADS_PLAYLIST_ID = "UUqOO8FqoVW6Y87jLnqhdflA";

const fetchYoutubeVideos = async (sort: NoticeSort): Promise<VideoData[]> => {
  let videoIds = "";

  if (sort === "date") {
    const playlistResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?key=${API_KEY}&playlistId=${UPLOADS_PLAYLIST_ID}&part=snippet&maxResults=3`,
    );

    if (!playlistResponse.ok) throw new Error("유튜브 API 호출 실패");

    const playlistData = await playlistResponse.json();

    if (!playlistData.items || playlistData.items.length === 0) {
      return [];
    }

    const targetItems = playlistData.items.slice(0, 3);
    videoIds = targetItems
      .map((item: any) => item.snippet.resourceId.videoId)
      .join(",");
  } else {
    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=id&order=viewCount&maxResults=3&type=video`,
    );

    if (!searchResponse.ok) throw new Error("유튜브 API 호출 실패");

    const searchData = await searchResponse.json();

    if (!searchData.items || searchData.items.length === 0) {
      return [];
    }

    const targetItems = searchData.items.slice(0, 3);
    videoIds = targetItems.map((item: any) => item.id.videoId).join(",");
  }

  const videosResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?key=${API_KEY}&id=${videoIds}&part=snippet,statistics`,
  );

  if (!videosResponse.ok) throw new Error("유튜브 상세 정보 호출 실패");

  const videosData = await videosResponse.json();

  const formattedVideos = videosData.items.map((item: any) => ({
    id: item.id,
    title: item.snippet.title,
    thumbnailUrl: item.snippet.thumbnails.medium.url,
    publishedAt: item.snippet.publishedAt,
    viewCount: item.statistics.viewCount,
  }));

  return formattedVideos.slice(0, 3);
};

const YoutubeListWidget = () => {
  const [sort, setSort] = useState<NoticeSort>("date");

  const handleSortChange = (nextSort: NoticeSort) => {
    mixpanelTrack.featureClicked(`Youtube Sort: ${nextSort}`, "Home Youtube Widget");
    setSort(nextSort);
  };

  const {
    data: videos = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["youtubeVideos", sort],
    queryFn: () => fetchYoutubeVideos(sort),
    staleTime: 1000 * 60 * 60,
    retry: false,
  });

  const formatViewCount = (count: string) => {
    const num = parseInt(count, 10);
    if (num >= 10000) return `${(num / 10000).toFixed(1)}만회`;
    return `${num.toLocaleString()}회`;
  };

  const handleVideoClick = (videoTitle: string, videoId: string) => {
    mixpanelTrack.featureClicked(videoTitle, "Home Youtube Widget");
    window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank");
  };

  return (
    <Box>
      <SortHeader>
        <SortDropBox sort={sort} setSort={handleSortChange} />
      </SortHeader>

      {isLoading || isError ? (
        <ListContainer>
          {[...Array(3)].map((_, i) => (
            <div key={i}>
              <VideoItemWrapper style={{ cursor: "default" }}>
                <InnerContent>
                  <Skeleton width={120} height={68} />

                  <InfoWrapper>
                    <TitleSkeletonWrapper>
                      <Skeleton width="100%" height={15} />
                      <Skeleton width="70%" height={15} />
                    </TitleSkeletonWrapper>

                    <Skeleton width="40%" height={12} />
                  </InfoWrapper>
                </InnerContent>
              </VideoItemWrapper>
              {i < 2 && <Divider margin="0" />}
            </div>
          ))}
        </ListContainer>
      ) : (
        <ListContainer>
          {videos.map((video, i) => (
            <div key={video.id}>
              <VideoItemWrapper onClick={() => handleVideoClick(video.title, video.id)}>
                <Ripple />
                <InnerContent>
                  <Thumbnail src={video.thumbnailUrl} alt={video.title} />
                  <InfoWrapper>
                    <VideoTitle
                      dangerouslySetInnerHTML={{ __html: video.title }}
                    />
                    <MetaInfo>
                      <InfoText>
                        조회수 {formatViewCount(video.viewCount)}
                      </InfoText>
                      <DividerDot>•</DividerDot>
                      <InfoText className="date">
                        {new Date(video.publishedAt).toLocaleDateString()}
                      </InfoText>
                    </MetaInfo>
                  </InfoWrapper>
                </InnerContent>
              </VideoItemWrapper>
              {videos.length - 1 > i && <Divider margin="0" />}
            </div>
          ))}
        </ListContainer>
      )}
    </Box>
  );
};

export default YoutubeListWidget;

const SortHeader = styled.div`
  padding: 16px 20px 0;
`;

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const InnerContent = styled.div`
  display: flex;
  width: 100%;
  transition: transform 0.12s ease-in-out;
`;

const VideoItemWrapper = styled.div`
  display: flex;
  width: 100%;
  box-sizing: border-box;
  padding: 16px 20px;
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &.active-touch {
    ${InnerContent} {
      transform: scale(0.97);
    }
  }
`;

const Thumbnail = styled.img`
  width: 120px;
  height: 68px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
  background-color: #eee;
`;

const InfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-left: 12px;
  padding: 2px 0;
  flex: 1;
`;

const TitleSkeletonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const VideoTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MetaInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const InfoText = styled.span`
  font-size: 11px;
  color: #888;
  &.date {
    color: #4071b9;
    font-weight: 500;
  }
`;

const DividerDot = styled.span`
  font-size: 10px;
  color: #ccc;
`;
