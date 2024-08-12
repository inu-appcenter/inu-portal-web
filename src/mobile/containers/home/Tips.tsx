import styled from 'styled-components';
import { getPostsMain } from '../../../utils/API/Posts';
import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/swiper-bundle.css';
import 'swiper/css/navigation';
import 'swiper/css';
import { useNavigate } from 'react-router-dom';

interface Post {
    id: number;
    title: string;
    category: string;
}

export default function TipForm() {
    const [topPosts, setTopPosts] = useState<Post[][]>([]);
    const navigate = useNavigate();
    useEffect(() => {
        const fetchTopPosts = async () => {
            try {
                const response = await getPostsMain();
                if (response.status === 200) {
                    const posts: Post[] = response.body.data;  // Adjust this line if necessary based on actual response structure
                    const chunkedPosts: Post[][] = [];
                    for (let i = 0; i < posts.length; i += 3) {
                        chunkedPosts.push(posts.slice(i, i + 3));
                    }
                    setTopPosts(chunkedPosts);
                } else {
                    console.error('Failed to fetch top posts, status code:', response.status);
                }
            } catch (error) {
                console.error('Error fetching top posts:', error);
            }
        };

        fetchTopPosts();
    }, []);
    
    return (
        <TipFormWrapper>
            <p><span>TIP</span>인기글</p>
            <Swiper
                slidesPerView={1}
                navigation={true}
                modules={[Navigation]}
                className="mySwiper"
            >
                {topPosts.map((chunk, index) => (
                    <SwiperSlide key={index}>
                        {chunk.map((topPost) => (
                            <PostWrapper key={topPost.id} onClick={()=>navigate(`/m/home/tips/postdetail?id=${topPost.id}`)}>
                                <p className='category'>{topPost.category}</p>
                                <p className='title'>{topPost.title}</p>
                            </PostWrapper>
                        ))}
                    </SwiperSlide>
                ))}
            </Swiper>
        </TipFormWrapper>
    );
}

const TipFormWrapper = styled.div`
    font-size: 12px;
    font-weight: 500;
    margin-top: 32px;

    span {
        margin-right: 4px;
        color: #4071B9;
    }

    .swiper {
        width: 100%;
        height: auto;
    }

    .swiper-slide {
        text-align: center;
        font-size: 18px;
        background: #fff;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
    }

    .swiper-button-next, .swiper-button-prev {
        color: #4071B9;
    }

    .swiper-button-next {
        right: 10px;
    }

    .swiper-button-prev {
        left: 10px;
    }

    .swiper-button-prev:after, .swiper-button-next:after {
        font-size: 15px;
    }
`;

const PostWrapper = styled.div`
    display: flex;
    border: 1.5px solid #7AA7E5;
    padding: 0 11px;
    border-radius: 5px;
    margin-bottom: 8px;
    width: 90%;

    .category {
        width: 20%;
        background-color: #AAC9EE;
        color: white;
        font-family: Inter;
        font-size: 7px;
        font-weight: 600;
        border-radius: 2px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 3px;
        margin-bottom: 5px;
    }

    .title {
        width: 100%;
        font-family: Inter;
        font-size: 9px;
        font-weight: 600;
        text-align: center;
        color: #656565;
    }
`;
