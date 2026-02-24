import 횃불Logo from "../../resource/assets/횃불-logo.svg";
import { getNotices } from "old/utils/API/Notices";
import { useEffect, useState } from "react";
import styled from "styled-components";
import Homepage횃불Img from "../../resource/assets/homepage-횃불-img.svg";
import { useNavigate } from "react-router-dom";

interface Notice {
  id: number;
  category: string;
  title: string;
  writer: string;
  createDate: string;
  view: number;
  url: string;
}

export default function NoticeItems() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemWidth = 214 + 10; // ./noticeitems.css에서 item의 width, 설정하고 싶은 gap 더하기
  const [itemsToShow, setItemsToShow] = useState(5);
  const navigate = useNavigate();

  const updateItemsToShow = () => {
    const container = document.querySelector(".items-container") as HTMLElement;
    if (container) {
      const containerWidth = container.offsetWidth;
      const itemsByWidth = Math.floor(containerWidth / itemWidth);
      setItemsToShow(itemsByWidth - 1);
    }
  };

  const goPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
  };

  const goNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex < notices.length - itemsToShow ? prevIndex + 1 : prevIndex,
    );
  };

  useEffect(() => {
    const fetchNotices = async () => {
      const response = await getNotices("전체", "date", "1");
      if (response.status === 200) {
        setNotices(response.body.data.notices);
      }
    };
    fetchNotices();
    updateItemsToShow();
    window.addEventListener("resize", updateItemsToShow);

    return () => {
      window.removeEventListener("resize", updateItemsToShow);
    };
  }, []);

  return (
    <SliderContainer>
      <ItemsContainer className="items-container">
        <Item onClick={() => navigate("/tips/notice")}>
          <Item0>
            <span>
              <TextIncheonUniv>인천대</TextIncheonUniv>
              <CategoryUnderbar />
            </span>
            <img src={횃불Logo} />
          </Item0>
          <div>
            <TextNotice>공지사항</TextNotice>
          </div>
        </Item>
        {notices
          .slice(currentIndex, currentIndex + itemsToShow)
          .map((notice, index) => (
            <Item
              key={index}
              className="item item-1"
              onClick={() => window.open("https://" + notice.url, "_blank")}
            >
              <Card1>
                <NoticeCategory>
                  <CategoryText>{notice.category}</CategoryText>
                  <CategoryUnderbar />
                </NoticeCategory>
              </Card1>
              <NoticeTitle>{notice.title}</NoticeTitle>
              <NoticeDate>{notice.createDate}</NoticeDate>
            </Item>
          ))}
      </ItemsContainer>
      <ImgContainer>
        <img src={Homepage횃불Img} />
      </ImgContainer>
      <HLine />
      <PreviousNextContainer>
        <PreviousNext onClick={goPrevious}>
          <h2>← 이전</h2>
        </PreviousNext>
        <PreviousNext onClick={goNext}>
          <h2>다음 →</h2>
        </PreviousNext>
      </PreviousNextContainer>
    </SliderContainer>
  );
}

// Styled Components
const SliderContainer = styled.div``;

const ItemsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const Item = styled.div`
  width: 194px;
  min-height: 156px;
  border-radius: 5px;
  border: 3px solid #9cafe2;

  display: flex;
  flex-direction: column;
  gap: 5px;
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 15px;
  padding-bottom: 15px;

  &.item-1 {
    @media (max-width: 768px) {
      display: none;
    }
  }
`;

const Item0 = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-left: 20px;
  margin-top: 25px;
  gap: 20px;
`;

const TextIncheonUniv = styled.span`
  font-size: 30px;
  font-weight: 500;
  color: #0e4d9d;
`;

const TextNotice = styled.div`
  font-size: 30px;
  font-weight: 800;
  color: #0e4d9d;
  margin-left: 20px;
`;

const NoticeCategory = styled.div`
  display: flex;
  flex-direction: column;
`;

const CategoryText = styled.div`
  font-size: 15px;
  font-weight: 500;
  line-height: 20px;
  color: #0e4d9d;
`;

const CategoryUnderbar = styled.div`
  height: 1px;
  width: 100%;
  background-color: #7aa7e5;
`;

const NoticeTitle = styled.div`
  margin-top: 10px;
  flex-grow: 1;
  font-size: 15px;
  font-weight: 600;
`;

const NoticeDate = styled.div`
  font-size: 30px;
  font-weight: 700;
  color: #7aa7e5;
  text-align: center;
`;

const ImgContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const HLine = styled.div`
  border: 2px solid #9cafe2;
`;

const PreviousNextContainer = styled.div`
  display: flex;
  flex-direction: row;

  @media (max-width: 768px) {
    display: none;
  }
`;

const PreviousNext = styled.div`
  flex-grow: 1;
  display: flex;
  justify-content: center;
`;

const Card1 = styled.span``;
