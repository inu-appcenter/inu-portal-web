import styled from "styled-components";
import PostLike from "mobile/components/postdetail/util/m.postlike";
import PostScrap from "mobile/components/postdetail/util/m.postscrap";
import utilfolder from "resources/assets/mobile-tips/utilfolder.svg";
import { useEffect, useRef, useState } from "react";
import DeletePostBtn from "mobile/components/postdetail/util/DeletePostBtn";
import EditPostBtn from "mobile/components/postdetail/util/EditPostBtn";
import ReportsPostBtn from "mobile/components/postdetail/util/ReportsPostBtn";

interface PostUtilityProps {
  id: number;
  like: number;
  isLiked: boolean;
  scrap: number;
  isScraped: boolean;
  hasAuthority: boolean;
}

export default function PostUtilContainer({
  id,
  like,
  isLiked,
  scrap,
  isScraped,
  hasAuthority,
}: PostUtilityProps) {
  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  const handleFolderClick = () => {
    setShowPopup((prev) => !prev);
  };
  const handleClickOutside = (event: MouseEvent) => {
    if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
      setShowPopup(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const handlePostUpdate = () => {
    //
  };

  return (
    <>
      <UtilWrapper>
        <PostLike id={id} like={like} isLikedProp={isLiked} />
        <PostScrap id={id} scrap={scrap} isScrapedProp={isScraped} />
        <DelOrModifyWrapper>
          <img
            src={utilfolder}
            alt="del or modify folder"
            onClick={handleFolderClick}
            style={{ cursor: "pointer" }}
          />
          {showPopup && (
            <Popup ref={popupRef}>
              {hasAuthority && (
                <>
                  <DeletePostBtn id={id} onPostUpdate={handlePostUpdate} />
                  <EditPostBtn id={id} />
                </>
              )}
              <ReportsPostBtn id={id} />
            </Popup>
          )}
        </DelOrModifyWrapper>
      </UtilWrapper>
    </>
  );
}

const UtilWrapper = styled.div`
  margin-left: auto;
  display: flex;
  flex-direction: row;
  gap: 20px;
`;
const DelOrModifyWrapper = styled.div`
  img {
    padding: 4px 8px 0 8px;
  }
`;

const Popup = styled.div`
  position: absolute;
  top: 10%;
  right: 12px;
  background-color: #fff;
  border: 1px solid #ccc;
  padding: 10px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 5px;
  z-index: 10;
`;
