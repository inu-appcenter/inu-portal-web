import { useEffect, useState } from "react";
import styled from "styled-components";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import { getPostsMain } from "@/apis/posts";
import { Post } from "@/types/posts";
import useMobileNavigate from "@/hooks/useMobileNavigate";

import "swiper/swiper-bundle.css";
import "swiper/css/navigation";
import "swiper/css";

export default function TipForm() {
  const [topPosts, setTopPosts] = useState<Post[][]>([]);
  const mobileNavigate = useMobileNavigate();

  useEffect(() => {
    const fetchTopPosts = async () => {
      try {
        const response = await getPostsMain();
        const posts: Post[] = response.data;

        // 3개씩 chunk 분리
        const chunkedPosts: Post[][] = [];
        for (let i = 0; i < posts.length; i += 3) {
          chunkedPosts.push(posts.slice(i, i + 3));
        }

        setTopPosts(chunkedPosts);
      } catch (error) {
        console.error("메인 페이지 게시글 가져오기 실패", error);
      }
    };

    fetchTopPosts();
  }, []);

  return (
    <TipFormWrapper>
      <Swiper
        pagination
        modules={[Pagination, Autoplay]}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false, // 사용자가 조작해도 자동재생 유지
        }}
        className="mySwiper"
      >
        {topPosts.map((chunk, index) => (
          <SwiperSlide key={index}>
            {chunk.map((post) => (
              <PostWrapper
                key={post.id}
                onClick={() => mobileNavigate(`/postdetail?id=${post.id}`)}
              >
                <div className="category">{post.category}</div>
                <div className="title">{post.title}</div>
              </PostWrapper>
            ))}
          </SwiperSlide>
        ))}
      </Swiper>
    </TipFormWrapper>
  );
}

const TipFormWrapper = styled.div`
  //margin-top: 32px;
  height: fit-content;
  width: 100%;

  h1 {
    font-size: 18px;
    font-weight: 500;
    cursor: pointer;

    span {
      margin-right: 4px;
      color: #4071b9;
    }
  }

  .swiper {
    width: 100%;
    height: 100%;
    position: relative;
    padding-bottom: 15px;
  }

  .swiper-slide {
    display: flex;
    flex-direction: column;
    align-items: center;
    //background: #fff;
    font-size: 18px;
    text-align: center;
  }

  .swiper-pagination {
    bottom: -4px !important;
  }

  .swiper-button-next,
  .swiper-button-prev {
    color: #4071b9;
  }

  .swiper-button-next {
    right: 10px;
  }

  .swiper-button-prev {
    left: 10px;
  }

  .swiper-button-prev:after,
  .swiper-button-next:after {
    font-size: 15px;
  }
`;

const PostWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 6px;
  padding: 6px 12px;
  border: 1.5px solid #7aa7e5;
  border-radius: 5px;
  box-sizing: border-box;
  cursor: pointer;

  .category {
    padding: 4px;
    background-color: #aac9ee;
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    border-radius: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: fit-content;
    width: 55px;
  }

  .title {
    flex: 1;
    margin-left: 8px;
    font-size: 14px;
    font-weight: 500;
    text-align: center;
    color: #656565;
  }
`;
