import { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { navItems as originalNavItems } from "@/resources/strings/navItems";
import { useNavigate } from "react-router-dom";
import useUserStore from "@/stores/useUserStore";
import VVector from "@/resources/assets/nav/v-vector.svg";
import LoginModal from "@/components/desktop/common/LoginModal";
import LightCircle from "@/resources/assets/nav/light-circle.svg";

interface NavMenuProps {
  isInFooter: boolean;
}

export default function NavMenu({ isInFooter }: NavMenuProps) {
  const [toggleIndex, setToggleIndex] = useState<number | null>(null);
  const [subToggleIndex, setSubToggleIndex] = useState<number | null>(null);
  const { tokenInfo } = useUserStore();
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [selectedChildItems, setSelectedChildItems] = useState<any[]>([]);
  const navigate = useNavigate();

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setToggleIndex(null);
        setSubToggleIndex(null);
        setSelectedChildItems([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const handleToggle = (index: number) => {
    setToggleIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  const handleMyPageClick = (url: string) => {
    if (tokenInfo.accessToken) {
      navigate(url);
    } else {
      setIsOpenModal(true);
    }
  };

  const handleSubItemClick = (item: any, index: number, event: any) => {
    event.stopPropagation(); // 이벤트 전파 중지
    if (item.subItems) {
      setSubToggleIndex(index);
      setSelectedChildItems(item.subItems); // 자식 항목의 모달 상태 업데이트
    } else {
      window.open(item.url);
      setSelectedChildItems([]);
      setToggleIndex(null);
    }
  };

  const closeSubModal = () => {
    setSelectedChildItems([]); // child toggle2가 닫힐 때 selectedChildItems 초기화
  };

  const navBarList = isInFooter
    ? [...originalNavItems, { title: "공지사항" }, { title: "TIPS" }]
    : originalNavItems;

  return (
    <Items ref={wrapperRef}>
      {navBarList.map((items, index) => (
        <ItemWrapper key={index}>
          <div
            onClick={() => {
              handleToggle(index);
              if (items.title === "마이 페이지") {
                handleMyPageClick("/mypage");
              } else if (items.title === "공지사항") {
                navigate("/posts?type=notice");
              } else if (items.title === "TIPS") {
                navigate("/posts");
              }
            }}
          >
            <div
              onMouseEnter={() => handleToggle(index)}
              onMouseLeave={() => closeSubModal()}
            >
              {items.title}
              {(items.title === "학과 홈페이지" ||
                items.title === "학교 홈페이지") &&
                toggleIndex === index && (
                  <div
                    className={`child toggle ${isInFooter ? "footer" : ""}`}
                    onMouseEnter={() => handleToggle(index)}
                    onMouseLeave={() => handleToggle(0)}
                  >
                    <img className="v-vector" src={VVector} />
                    <div className="line-vector" />
                    {items.child?.map((item, itemIndex) => (
                      <ChildDetail
                        key={itemIndex}
                        onClick={(event) =>
                          handleSubItemClick(item, itemIndex, event)
                        }
                      >
                        <img
                          src={LightCircle}
                          alt="LightCircle"
                          style={{ width: "8px", margin: "0 10px" }}
                        />
                        {item.title}
                        {items.title === "학과 홈페이지" &&
                          toggleIndex === index &&
                          selectedChildItems.length > 0 &&
                          itemIndex === subToggleIndex && (
                            <div
                              className="child toggle2"
                              onClick={closeSubModal}
                            >
                              {selectedChildItems.map(
                                (subItem, subItemIndex) => (
                                  <ChildDetail2
                                    key={subItemIndex}
                                    onClick={(event) =>
                                      handleSubItemClick(
                                        subItem,
                                        subItemIndex,
                                        event,
                                      )
                                    }
                                  >
                                    {subItem.title}
                                  </ChildDetail2>
                                ),
                              )}
                            </div>
                          )}
                      </ChildDetail>
                    ))}
                  </div>
                )}
            </div>
          </div>
        </ItemWrapper>
      ))}
      {isOpenModal && (
        <LoginModal
          openModal={() => setIsOpenModal(true)}
          closeModal={() => setIsOpenModal(false)}
        />
      )}
    </Items>
  );
}

const ItemWrapper = styled.div`
  user-select: none;
  position: relative;
  line-height: 2rem;
  font-size: 18px;
  transition: text-shadow 0.3s;

  &:hover {
    text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2); /* 그림자 추가 */
    cursor: pointer; /* 클릭 가능함을 나타내는 커서 */
  }

  .child {
    width: 5rem;
    top: 2.5rem;
    transition:
      opacity 0.5s,
      visibility 0.5s;
    visibility: hidden;
    opacity: 0;
  }

  .toggle {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    visibility: visible;
    opacity: 1;
    z-index: 10;
    margin: 10px 0;
    width: 210px;
    padding: 30px 20px;
    border-radius: 10px;
    background: linear-gradient(
      180deg,
      #8da6ec 4.5%,
      #9cafe2 54%,
      #7590d9 100%
    );
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .footer {
    top: auto;
    bottom: 2.5rem;
  }

  .toggle2 {
    position: absolute;
    left: 180px;
    top: 0px;
    visibility: visible;
    opacity: 1;
    z-index: 999;
    width: max-content;
    padding: 10px;
    border-radius: 10px;
    background: #ffffffdd;
    color: #656565;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .v-vector {
    height: 8px;
    width: 14.6px;
    padding-top: 7px;
    padding-bottom: 7px;
  }

  .line-vector {
    height: 0px;
    width: 179px;
    border: 1px solid white;
    margin-top: 7px;
    margin-bottom: 7px;
  }
`;

const Items = styled.div`
  display: flex;
  max-width: 500px;
  justify-content: space-around;
  align-items: center;
  flex-grow: 1;
`;

const ChildDetail = styled.div`
  font-size: 15px;
  font-weight: 700;
  padding-top: 7px;
  padding-bottom: 7px;
  color: #ffffff99;
  width: 100%;
  transition: color 0.2s;
  border-radius: 10px;

  &:hover {
    color: #ffffff;
  }
  position: relative;
`;

const ChildDetail2 = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #656565;
  padding: 0 16px;
  transition: background-color 0.3s;
  border-radius: 10px;

  &:hover {
    color: #000000;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  }

  &:hover img {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
  }
`;
