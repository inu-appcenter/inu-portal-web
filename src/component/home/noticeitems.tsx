import 횃불Logo from "../../resource/assets/횃불-logo.svg"
import getNotices from '../../utils/getNotices';
import { useEffect, useState } from 'react';
import './noticeitems.css';
import Homepage횃불Img from '../../resource/assets/homepage-횃불-img.svg';
 
interface Notice {
    id: number;
    category: string;
    title: string;
    writer: string;
    date: string;
    view: number;
    url: string;
}

export default function NoticeItems() {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const itemWidth = 214+5+5 + 10; // ./noticeitems.css에서 item의 width, padding-left, padding-right 더하고 설정하고 싶은 gap 더하기
    const [itemsToShow, setItemsToShow] = useState(5);

    const updateItemsToShow = () => {
        const containerWidth = document.querySelector('.items-container').offsetWidth;
        const itemsByWidth = Math.floor(containerWidth / itemWidth);
        setItemsToShow(itemsByWidth-1);
    }

    const goPrevious = () => {
        setCurrentIndex((prevIndex) => prevIndex > 0 ? prevIndex - 1 : 0);
    }

    const goNext = () => {
        setCurrentIndex((prevIndex) => prevIndex < notices.length - itemsToShow ? prevIndex + 1 : prevIndex);
    }

    useEffect(() => {
        const fetchNotices = async () => {
            const notices = await getNotices('전체', 'date', '1');
            setNotices(notices['notices']);
        }
        fetchNotices();
        updateItemsToShow();
        window.addEventListener('resize', updateItemsToShow);

        return () => {
            window.removeEventListener('resize', updateItemsToShow);
        };
    }, []);

    return (
        <div className='slider-container'>
            <div className='items-container'>
                <div className='item' onClick={() => window.open('https://www.inu.ac.kr/inu/1534/subview.do', '_blank')}>
                    <div className='item-0'>
                        <span>
                            <span className='text인천대'>인천대</span>
                            <div className='category-underbar'></div>
                        </span>
                        <img src={횃불Logo} />
                    </div>
                    <div>
                        <div className='text공지사항'>공지사항</div>

                    </div>
                </div>
                {notices.slice(currentIndex, currentIndex + itemsToShow).map((notice, index) => (
                    <div key={index} className='item' onClick={() => window.open('https://'+ notice.url, '_blank')}>
                    <div className='card-1'>
                      <div className='notice-category'>
                        <div className='category-text'>{notice.category}</div>
                        <div className='category-underbar'></div>
                      </div>
                    </div>
                    <div className='notice-title'>{notice.title}</div>
                    <div className='notice-date'>{notice.date}</div>
                    </div>
                ))}
            </div>
            <div className='img-container'><img src={Homepage횃불Img} /></div>
            <div className='hline' />
            <div className='PreviousNextContainer'>
                <div className='PreviousNext' onClick={goPrevious}><h2>← 이전</h2></div>
                <div className='PreviousNext' onClick={goNext}><h2>다음 →</h2></div>
            </div>
        </div>
    );
}