import { getFolders } from "@/apis/folders";
import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { Folder } from "@/types/folders";
import ScrapTop from "@/components/desktop/mypage/ScrapTop";
import ScrapList from "@/components/desktop/mypage/ScrapList";

export default function Scrap() {
  const [folders, setFolders] = useState<Folder[]>([]);

  const fetchFolders = async () => {
    try {
      const response = await getFolders();
      setFolders(response.data);
    } catch (error) {
      console.error("회원의 모든 스크랩폴더 가져오기 실패", error);
      // refreshError가 아닌 경우 처리
      if (
        axios.isAxiosError(error) &&
        !(error as AxiosError & { isRefreshError?: boolean }).isRefreshError &&
        error.response
      ) {
        alert("회원의 모든 스크랩폴더 가져오기 실패");
      }
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  return (
    <ScrapWrapper>
      <ScrapTop folders={folders} setFolders={setFolders} />
      <ScrapList folders={folders} />
    </ScrapWrapper>
  );
}

const ScrapWrapper = styled.div``;
