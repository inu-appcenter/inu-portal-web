// AiGenerate.tsx
import styled from "styled-components";
import { postFiresPredict } from "apis/fires";
import axios, { AxiosError } from "axios";
import { useRef, useState, useEffect } from "react";
import useUserStore from "stores/useUserStore";
import AiGallery from "components/ai/AiGallery";
import { result } from "apis/genTorch";

export default function AiGenerate() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [eta, setEta] = useState<number>(0);
  const [canRefresh, setCanRefresh] = useState<boolean>(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const { tokenInfo } = useUserStore();

  // 로컬스토리지에서 이미지 데이터 가져오기
  const getImageFromLocalStorage = (requestId: string): string | null => {
    return localStorage.getItem(`image_${requestId}`);
  };

  // 로컬스토리지에 이미지 데이터 저장하기
  const saveImageToLocalStorage = (requestId: string, b64Img: string) => {
    localStorage.setItem(`image_${requestId}`, b64Img);
  };

  // ETA 감소를 위한 useEffect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (eta > 0) {
      interval = setInterval(() => {
        setEta((prevEta) => {
          if (prevEta <= 1) {
            clearInterval(interval);
            setCanRefresh(true);
            return 0;
          } else {
            return prevEta - 1;
          }
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [eta]);

  const handleGenerateClick = async () => {
    if (loading) return;
    if (inputRef.current && !inputRef.current.value.trim()) {
      alert("명령어를 입력해주세요.");
      return;
    }

    if (!tokenInfo.accessToken) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (inputRef.current) {
      setLoading(true);
      setMainImage(null);
      setEta(0);
      setCanRefresh(false);
      setRequestId(null);

      try {
        // 명령어로 이미지 생성 요청
        const response = await postFiresPredict(inputRef.current.value.trim());
        const requestId = response.data.request_id;
        setRequestId(requestId);

        // 로컬스토리지에 이미지가 있는지 확인
        const cachedImage = getImageFromLocalStorage(requestId);
        if (cachedImage) {
          setMainImage(cachedImage);
          setLoading(false);
          return;
        }

        // 이미지 생성 결과 가져오기
        fetchResult(requestId);
      } catch (error) {
        console.error("이미지 생성 요청 실패", error);
        if (
          axios.isAxiosError(error) &&
          !(error as AxiosError & { isRefreshError?: boolean })
            .isRefreshError &&
          error.response
        ) {
          alert("이미지 생성 요청 실패");
        }
        setLoading(false);
      }
    }
  };

  const fetchResult = async (requestId: string) => {
    try {
      const res = await result(requestId);
      if (res.status === 201 && res.body.b64_img) {
        const b64Img = res.body.b64_img;
        saveImageToLocalStorage(requestId, b64Img);
        setMainImage(b64Img);
        setLoading(false);
        setEta(0);
        setCanRefresh(false);
      } else if (res.status === 202 || res.status === 203) {
        // ETA 설정
        if (res.body.eta) {
          setEta(res.body.eta);
        } else {
          // ETA가 없을 경우 기본값 설정 (예: 10초)
          setEta(10);
        }
        setLoading(false);
        setCanRefresh(false);
      } else {
        alert("이미지 생성에 실패했습니다.");
        setLoading(false);
      }
    } catch (error) {
      console.error("이미지 생성 결과 가져오기 실패", error);
      setLoading(false);
    }
  };

  const handleRefreshClick = () => {
    if (requestId) {
      setCanRefresh(false);
      setEta(0);
      setLoading(true);
      fetchResult(requestId);
    }
  };

  return (
    <AiGenerateWrapper>
      <MainContainer>
        {loading ? (
          <LoadingText>이미지를 불러오는 중입니다...</LoadingText>
        ) : mainImage ? (
          <MainImage
            src={`data:image/png;base64,${mainImage}`}
            alt="AI 생성 이미지"
          />
        ) : eta > 0 ? (
          <EtaText>남은 시간: {eta}초</EtaText>
        ) : canRefresh ? (
          <RefreshButton onClick={handleRefreshClick}>확인!</RefreshButton>
        ) : (
          <Placeholder>생성된 이미지가 여기에 표시됩니다.</Placeholder>
        )}
      </MainContainer>
      <InputWrapper>
        <InputField
          ref={inputRef}
          placeholder="명령어를 입력하세요."
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              handleGenerateClick();
            }
          }}
        />
        {tokenInfo.accessToken ? (
          <GenerateButton onClick={handleGenerateClick}>
            생성하기
          </GenerateButton>
        ) : (
          <LoginButton href="/login">로그인</LoginButton>
        )}
      </InputWrapper>
      {/* 하단 갤러리 */}
      <AiGallery />
    </AiGenerateWrapper>
  );
}

const AiGenerateWrapper = styled.div`
  flex: 1;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const MainContainer = styled.div`
  width: 300px;
  height: 300px;
  background-color: #f0f0f0;
  border-radius: 12px;
  margin: 20px 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MainImage = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 12px;
`;

const Placeholder = styled.div`
  color: #333;
  font-size: 16px;
  text-align: center;
`;

const LoadingText = styled.div`
  color: #333;
  font-size: 16px;
  text-align: center;
`;

const EtaText = styled.div`
  color: #333;
  font-size: 16px;
  text-align: center;
`;

const RefreshButton = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  background-color: #6d4dc7;
  color: white;
  border: none;
  border-radius: 12px;
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
`;

const InputField = styled.input`
  width: 200px;
  height: 44px;
  padding: 0 12px;
  border: 1px solid white;
  border-radius: 12px;
  background: transparent;
  color: white;
  font-size: 16px;

  ::placeholder {
    color: white;
  }

  :focus {
    outline: none;
  }
`;

const GenerateButton = styled.button`
  height: 44px;
  padding: 0 20px;
  border-radius: 12px;
  border: none;
  background: #6d4dc7;
  color: white;
  font-size: 16px;
  font-weight: bold;
`;

const LoginButton = styled.a`
  height: 44px;
  padding: 0 20px;
  border-radius: 12px;
  border: none;
  background: #6d4dc7;
  color: white;
  font-size: 16px;
  font-weight: bold;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
`;
