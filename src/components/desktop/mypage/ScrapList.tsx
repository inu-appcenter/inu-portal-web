import styled from "styled-components";
import { Folder } from "@/types/folders";
import { Post } from "@/types/posts";
import { useLocation, useNavigate } from "react-router-dom";
import ScrapsSort from "@/components/desktop/mypage/ScrapsSort";
import Pagination from "@/components/desktop/posts/Pagination";
import calendarImage from "@/resources/assets/mypage/calendar.svg";
import likeImage from "@/resources/assets/mypage/like.svg";
import { useEffect, useState } from "react";
import { getSearchFolderScrap, getSearchScrap } from "@/apis/search";
import {
  deleteFoldersPosts,
  getFoldersPosts,
  postFoldersPosts,
} from "@/apis/folders";
import { putScrap } from "@/apis/posts";
import { getMembersScraps } from "@/apis/members";
import minus from "@/resources/assets/mypage/minus.svg";
import axios, { AxiosError } from "axios";
import listImage from "@/resources/assets/mypage/list.svg";
import sortDropdownImage from "@/resources/assets/mypage/sort-drop.svg";
import folderImage from "@/resources/assets/mypage/folder.svg";

interface Props {
  folders: Folder[];
}

export default function ScrapList({ folders }: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [openedModalId, setOpenedModalId] = useState<number | null>(null);
  const [selectedFolders, setSelectedFolders] = useState<number[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const folderId = Number(params.get("folderId")) || 0;

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (params.get("searchScrap")) {
          if (Number(params.get("folderId"))) {
            const response = await getSearchFolderScrap(
              params.get("searchScrap") || "",
              params.get("sort") || "date",
              Number(params.get("page")) || 1,
              Number(params.get("folderId")) || 0,
            );
            setPosts(response.data.contents);
            setPages(response.data.pages);
            setTotal(response.data.total);
          } else {
            const response = await getSearchScrap(
              params.get("searchScrap") || "",
              params.get("sort") || "date",
              Number(params.get("page")) || 1,
            );
            console.log("getSearchScrap");
            console.log(response.data);
            setPosts(response.data.contents);
            setPages(response.data.pages);
            setTotal(response.data.total);
          }
        } else {
          if (Number(params.get("folderId"))) {
            const response = await getFoldersPosts(
              Number(params.get("folderId")) || 0,
              params.get("sort") || "date",
              Number(params.get("page")) || 1,
            );
            setPosts(response.data.contents);
            setPages(response.data.pages);
            setTotal(response.data.total);
          } else {
            const response = await getMembersScraps(
              params.get("sort") || "date",
              Number(params.get("page")) || 1,
            );
            setPosts(response.data.contents);
            setPages(response.data.pages);
            setTotal(response.data.total);
          }
        }
      } catch (error) {
        console.error("스크랩 게시글 가져오기 실패", error);
      }
    };

    const params = new URLSearchParams(location.search);
    fetchData();
  }, [location.search]);

  const handleAddToFolders = async (postId: number) => {
    if (selectedFolders.length === 0) return;

    let alreadyExistsCount = 0;
    let successCount = 0;
    let errorCount = 0;

    await Promise.all(
      selectedFolders.map(async (folderId) => {
        try {
          await postFoldersPosts(folderId, [postId]);
          successCount++;
        } catch (error) {
          if (axios.isAxiosError(error) && error.response?.status === 400) {
            // 이미 담겨있는 경우
            alreadyExistsCount++;
          } else {
            // 기타 에러
            errorCount++;
          }
        }
      }),
    );

    // 모달 닫기 및 선택 초기화
    setOpenedModalId(null);
    setSelectedFolders([]);

    // 결과 요약 알림
    alert(
      `담기 결과:\n- 이미 담겨있는 폴더: ${alreadyExistsCount}개\n- 담기 성공: ${successCount}개\n- 에러: ${errorCount}개`,
    );
  };

  const handleRemoveFromFolder = async (postId: number) => {
    try {
      await deleteFoldersPosts(folderId, [postId]);
      setPosts((prev) => prev.filter((post) => post.id !== postId));
    } catch (error) {
      console.error("스크랩폴더에서 게시글 빼기 실패", error);
      // refreshError가 아닌 경우 처리
      if (
        axios.isAxiosError(error) &&
        !(error as AxiosError & { isRefreshError?: boolean }).isRefreshError &&
        error.response
      ) {
        alert("스크랩폴더에서 게시글 빼기 실패");
      }
    }
  };

  const handleDeleteScrap = async (postId: number) => {
    try {
      await putScrap(postId);
      setPosts((prev) => prev.filter((post) => post.id !== postId));
    } catch (error) {
      console.error("스크랩 삭제 실패", error);
      // refreshError가 아닌 경우 처리
      if (
        axios.isAxiosError(error) &&
        !(error as AxiosError & { isRefreshError?: boolean }).isRefreshError &&
        error.response
      ) {
        alert("스크랩 삭제 실패");
      }
    }
  };

  return (
    <ScrapListWrapper>
      <ScrapsSort />
      <span className="total">
        <span>All Scraps</span>
        {total}
      </span>
      <div className="posts-wrapper">
        {posts.map((post) => (
          <div className="post" key={post.id}>
            <div
              className="category-title"
              onClick={() => navigate(`/posts?id=${post.id}`)}
            >
              <span className="category">{post.category}</span>
              <span className="title">{post.title}</span>
            </div>
            <div className="buttons-date-like">
              {folderId ? (
                <button
                  className="remove"
                  onClick={() => handleRemoveFromFolder(post.id)}
                >
                  <img src={minus} alt="" />
                  빼기
                </button>
              ) : (
                <button
                  className="remove"
                  onClick={() => handleDeleteScrap(post.id)}
                >
                  <img src={minus} alt="" />
                  스크랩 삭제
                </button>
              )}

              <button
                className="add"
                onClick={() => {
                  setOpenedModalId(post.id);
                }}
              >
                <img src={listImage} alt="" />
                Add
                <img src={sortDropdownImage} alt="" />
                {openedModalId === post.id && (
                  <Modal>
                    <div className="title">
                      <img src={listImage} alt="" />
                      <span>List</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenedModalId(null);
                        }}
                      >
                        X
                      </button>
                    </div>
                    <ul>
                      {folders.map((folder) => (
                        <li key={folder.id}>
                          <label className="folder">
                            <input
                              type="checkbox"
                              value={folder.id}
                              onChange={(e) => {
                                const value = Number(e.target.value);
                                setSelectedFolders((prev) =>
                                  prev.includes(value)
                                    ? prev.filter((id) => id !== value)
                                    : [...prev, value],
                                );
                              }}
                            />
                            <img src={folderImage} alt="" />
                            {folder.name}
                          </label>
                        </li>
                      ))}
                    </ul>
                    <button
                      className="save"
                      onClick={() => handleAddToFolders(post.id)}
                    >
                      Save
                    </button>
                  </Modal>
                )}
              </button>
              <div className="date-like">
                <img src={calendarImage} alt="" />
                <span className="date">{post.createDate}</span>
                <img src={likeImage} alt="" />
                <span>{post.like}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Pagination pages={pages} />
    </ScrapListWrapper>
  );
}

const ScrapListWrapper = styled.div`
  border: 6px solid #eaeaea;
  border-width: 6px 0 0 6px;
  padding: 24px 64px;
  display: flex;
  flex-direction: column;
  gap: 24px;

  .total {
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    padding-left: 4px;
    font-size: 20px;
    color: rgba(14, 77, 157, 1);
    span {
      color: rgba(150, 150, 150, 1);
    }
  }
  .posts-wrapper {
    display: flex;
    flex-direction: column;
    min-height: 457.83px;
    gap: 16px;
    .post {
      font-weight: 500;
      padding: 16px;
      background: transparent;
      border: 2px solid rgba(122, 167, 229, 1);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .category-title {
        display: flex;
        align-items: center;
        gap: 16px;
        .category {
          background-color: rgba(170, 201, 238, 1);
          color: white;
          font-size: 16px;
          border-radius: 12px;
          padding: 12px 16px;
          display: flex;
          align-items: center;
        }
        .title {
          font-size: 16px;
        }
      }
      .buttons-date-like {
        display: flex;
        align-items: center;
        gap: 16px;
        position: relative;
        .remove {
          display: flex;
          align-items: center;
          gap: 8px;
          border: none;
          background-color: transparent;
        }
        .add {
          position: relative;
          display: flex;
          align-items: center;
          gap: 8px;
          background-color: transparent;
          border-radius: 12px;
          border: 1px solid rgba(136, 136, 136, 1);
          padding: 8px 16px;
        }
        .date-like {
          img {
            height: 14px;
          }
          .date {
            color: rgba(150, 150, 150, 1);
          }
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }
      }
    }
  }
`;

const Modal = styled.div`
  position: absolute;
  top: 112%;
  right: 0;
  z-index: 100;
  background: white;
  border-radius: 8px;
  border: 1px solid rgba(136, 136, 136, 1);
  .title {
    height: 32px;
    padding: 0 16px;
    border-bottom: 1px solid rgba(136, 136, 136, 1);
    display: flex;
    align-items: center;
    gap: 8px;
    span {
      flex: 1;
    }
    button {
      background-color: transparent;
      border: none;
    }
  }
  ul {
    list-style: none;
    padding: 0 16px;
    li {
      label {
        display: flex;
        gap: 4px;
        img {
          width: 16px;
        }
      }
      margin-bottom: 8px;
    }
  }
  .save {
    width: 100%;
    height: 32px;
    border: none;
    background-color: transparent;
    border-top: 1px solid rgba(136, 136, 136, 1);
  }
`;
