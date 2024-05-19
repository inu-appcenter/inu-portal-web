import  { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import getTopPosts from '../../utils/getTopPosts';


interface Post {
    id: number;
    title: string;
    createDate: string;
}

  
export default function MainTip() {
    const [topPosts, setTopPosts] = useState<Post[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTopPosts = async () => {
          try {
            const posts = await getTopPosts();
            setTopPosts(posts.slice(0, 7));
          } catch (error) {
            console.error('Error fetching top posts:', error);
          }
        };
    
        fetchTopPosts();
      }, []);
    
    const handlePostClick = (postId: number) => {
        navigate(`/tips/${postId}`);
    };

    
      const goToAllTips = () => {
        navigate('/tips'); // '/Tips' 경로로 이동
      };
    return (
        <TipWrapper>
            {topPosts.map((topPost) => (
                <div className="article" key={topPost.id} onClick={() => handlePostClick(topPost.id)}>
                    <h3>{topPost.title}</h3>
                </div>
            ))}
            <TotalTip onClick={goToAllTips}>
                <span className='TotalTip-text'>전체보기</span>
                <span className='TotalTip-text'>+</span>
            </TotalTip>
        </TipWrapper>
    )
}

const TipWrapper = styled.div`
    display: flex;
    flex-direction: column;

    margin-top: 15px;
    gap: 8px;

    .article {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;

        height: 46px;
        border-radius: 10px;
        background: linear-gradient(90deg, rgba(156, 175, 226, 0.7) 0%, rgba(181, 197, 242, 0.7) 50%, rgba(156, 175, 226, 0.7) 100%);

        padding-left: 8px;
        padding-right: 8px;
        font-size: 12px;
    }
`

const TotalTip = styled.span`
    height: 26px;
    width: 81px;
    border-radius: 5px;
    border: 1px solid #656565;

    margin-left: auto;

    display: flex;
    align-items: center;
    justify-content: space-around;

    .TotalTip-text {
        font-size: 12px;
        font-weight: 300;
        cursor: url('/pointers/cursor-pointer.svg'), pointer;
    }

`