// Noticeitems.tsx
// import { useEffect, useState } from "react";
import "./Noticeitems.css";
import img from "../../../assets/Images/image 6.png";
interface Notice {
  category: string;
  title: string;
  content: string;
  editor: string;
  date: Date;
}

interface NoticesProps {
  notices: Notice[];
}

const Noticeitems: React.FC<NoticesProps> = ({ notices }) => {
  // const [startIndex, setStartIndex] = useState(0);

  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     setStartIndex((prevIndex) => (prevIndex + 3) % notices.length);
  //   }, 5000);

  //   return () => clearInterval(intervalId);
  // }, [notices.length]);

  return (
    <div className="div">
      <p className="notice-header">📌 NOTICE</p>
      <div className="notice-container">
        {/* {notices.slice(startIndex, startIndex + 7).map((notice, index) => (
          <div key={index} className={`notice visible`}>
            <div className="notice-container">
              <div>
                <span className="notice-title">{notice.title}</span>
              </div>
              {/* <div className="notice-content">
                <span>{notice.content}</span>
              </div> */}
            
            {/* <div className="notice-readmore">
              <span>READ MORE</span>
            </div>
          </div> */}
        <div className="notice-items-container">
        <div className="notice-link">
          <span>인천대</span>
          <img src={img} alt="인천대학교 로고" />
          <p>공지사항 &gt; </p>
        </div>
        {notices.map((notice, index) => (
          <div key={index} className={`notice visible`}>
            <div className="notice-container">
                <span className="notice-title">{notice.title}</span>
              {/* <div className="notice-content">
                <span>{notice.content}</span>
              </div> */}
            </div>
            {/* <div className="notice-readmore">
              <span>READ MORE</span>
            </div>
          </div> */}
        </div>
        ))}
        </div>
    </div>
    </div>
  );
};

export default Noticeitems;
