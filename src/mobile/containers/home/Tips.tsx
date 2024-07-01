import styled from 'styled-components';
import { getPostsTop } from '../../../utils/API/Posts';
import { useEffect,useState } from 'react';
interface Post {
    id: number;
    title: string;
    category: string;

}

export default function TipForm() {
    const [topPosts, setTopPosts] = useState<Post[]>([]);
    useEffect(() => {
        const fetchTopPosts = async () => {
          try {
            const response = await getPostsTop('전체');
            if (response.status === 200) {
                    setTopPosts(response.body.data.slice(0,3));
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
        {topPosts.map((topPost,index)=> (
            <PostWrapper key={index}>
                <p className='category'>{topPost.category}</p>
                <p className='title'>{topPost.title}</p>
            </PostWrapper>
        ))}
    </TipFormWrapper>
  );
}

const TipFormWrapper = styled.div`
    font-size:12px;
    font-weight: 500;
    margin-top:32px;
    span {
        margin-right: 4px;
        color:#4071B9;
    }
`;

const PostWrapper = styled.div`
display: flex;
border: 1.5px solid #7AA7E5;
padding:0 11px;
border-radius: 5px;
margin-bottom: 8px;
.category {
    width: 32px;
    background-color:  #AAC9EE;
    color: white;
    font-family: Inter;
    font-size: 7px;
    font-weight: 600;
    border-radius: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding:3px;
}

.title {
    width: 100%;
    font-family: Inter;
    font-size: 9px;
    font-weight: 600;
    text-align: center;
    color:#656565;
}   
`



