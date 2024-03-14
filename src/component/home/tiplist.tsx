import  { useEffect, useState } from 'react';
import styled from 'styled-components';
import { tipList } from '../../resource/string/tip';
import { useNavigate } from 'react-router-dom';


interface Article {
    id: number;
    title: string;
    date: string;
}

  
export default function MainTip() {
    const navigate = useNavigate();
    const [articles, setArticles] = useState<Article[]>([]);

    const handleArticleClick = (id: number) => {
        // TODO: tip 본문 이동 구현
        alert(`article.id: ${id}`);
    };
    
    useEffect(() => {
        setArticles(tipList);
      }, []);
    
      const goToAllTips = () => {
        navigate('/tips'); // '/Tips' 경로로 이동
      };
    return (
        <TipWrapper>
            {articles.map((article) => (
                <div className="article" key={article.id} onClick={() => handleArticleClick(article.id)}>
                    <h3>{article.title}</h3>
                    <p>{article.date}</p>
                </div>
            ))}
            <TotalTip onClick={goToAllTips}>(임시)Tip 전체</TotalTip>
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
        justify-content: space-between;

        height: 46px;
        border-radius: 10px;
        background: linear-gradient(90deg, rgba(156, 175, 226, 0.7) 0%, rgba(181, 197, 242, 0.7) 50%, rgba(156, 175, 226, 0.7) 100%);

        padding-left: 8px;
        padding-right: 8px;
        font-size: 12px;
    }
`

const TotalTip = styled.button`
    height: 46px;
    background-color: #0E4D9D;
    padding-left: 8px;
    padding-right: 8px;
    border:none;
    color:white;
    font-size: 12px;
    font-weight: 800;
`