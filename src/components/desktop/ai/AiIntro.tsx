import styled from "styled-components";
import { postFiresPredict } from "@/apis/fires";
import axios, { AxiosError } from "axios";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "@/stores/useUserStore";
import AiLoading from "@/components/desktop/ai/AiLoading";
import AiExample from "@/resources/assets/ai/ai-example.svg";

export default function AiIntro() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const { tokenInfo } = useUserStore();

  const handleGenerateClick = async () => {
    if (loading) {
      return;
    }
    if (inputRef.current && !inputRef.current.value.trim()) {
      alert("명령어를 입력해주세요.");
      return;
    }
    if (inputRef.current) {
      setLoading(true);
      try {
        await postFiresPredict(inputRef.current.value);
        navigate("/ai/gallery");
      } catch (error) {
        console.error("횃불이 ai 그림 요청 실패", error);
        // refreshError가 아닌 경우 처리
        if (
          axios.isAxiosError(error) &&
          !(error as AxiosError & { isRefreshError?: boolean })
            .isRefreshError &&
          error.response
        ) {
          alert("횃불이 ai 그림 요청 실패");
        }
      }
    }
    setLoading(false);
  };

  return (
    <>
      {loading ? (
        <AiLoading />
      ) : (
        <AiIntroWrapper>
          <AiIntroText>
            <span style={{ fontSize: "16px", lineHeight: "20px" }}>
              <b style={{ fontSize: "20px" }}>AI 횃불이</b>는 창의적이고
              재미있는 캐릭터를 AI로 생성하는 앱입니다.
              <br />
              <br />
              이 앱은 사용자가 입력한 특정 행동이나 상황을 바탕으로 고유한
              캐릭터 이미지를 생성합니다.
              <br />
              예를 들어, <b>
                사용자가 "피자를 먹는 횃불이"와 같은 명령을 입력
              </b>{" "}
              하면, 앱은 피자를 먹고 있는 횃불이의 이미지를 AI로 생성하여
              제공합니다.
            </span>
          </AiIntroText>
          <HowToUse>
            <div className="title-img">
              <span className="title">HOW TO USE</span>
              <img src={AiExample} alt="" />
            </div>
            <span style={{ fontSize: "20px", lineHeight: "30px" }}>
              1. 원하는 행동 또는 상황을 입력합니다. 예를 들어, "exercising",
              "studying" 등을 입력하세요.
              <br />
              2. 앱은 입력된 내용을 바탕으로 AI로 캐릭터 이미지를 생성합니다.
              <br />
              3. 생성된 이미지를 즐겨보세요! 필요에 따라 저장하거나 공유할 수
              있습니다.
              <br />
            </span>
            <AiFunctionWrapper>
              <AiInputWrapper>
                <div className="line" />
                <input
                  ref={inputRef}
                  placeholder="명령어를 입력하세요."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      handleGenerateClick();
                    }
                  }}
                />
              </AiInputWrapper>
              <div className="buttons-wrapper">
                {tokenInfo.accessToken ? (
                  <>
                    <AiGenerateButton onClick={handleGenerateClick}>
                      생성하기
                    </AiGenerateButton>
                    <AiGenerateButton onClick={() => navigate("/ai/gallery")}>
                      내가 만든 횃불이
                    </AiGenerateButton>
                  </>
                ) : (
                  <>
                    <DesktopLoginButton onClick={() => navigate("/login")}>
                      로그인
                    </DesktopLoginButton>
                    <MobileLoginButton onClick={() => navigate("/m/login")}>
                      로그인
                    </MobileLoginButton>
                  </>
                )}
              </div>
            </AiFunctionWrapper>
          </HowToUse>
        </AiIntroWrapper>
      )}
    </>
  );
}

const AiIntroWrapper = styled.div`
  flex: 1;
  color: white;
  display: flex;
  flex-direction: column;

  @media (min-width: 768px) {
    justify-content: space-between;
  }
`;

const AiIntroText = styled.div``;

const HowToUse = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-self: flex-end;
  .title-img {
    border-bottom: 2px solid white;
    display: flex;
    justify-content: space-between;
  }
  .title {
    align-self: flex-end;
    font-size: 32px;
    font-weight: 800;
  }
  img {
    @media (max-width: 768px) {
      width: 100px;
    }
  }
`;

const AiFunctionWrapper = styled.div`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  .buttons-wrapper {
    display: flex;
    gap: 12px;
    @media (max-width: 768px) {
      flex-direction: column;
    }
  }
`;

const AiInputWrapper = styled.div`
  width: 100%;
  height: 44px;
  padding-left: 20px;
  background: transparent;
  border: 1px solid white;
  border-radius: 16px;
  display: flex;
  align-items: center;

  .line {
    width: 1px;
    height: 28px;
    background: white;
  }
  input {
    flex-grow: 1;
    padding-left: 12px;
    border: none;
    background: transparent;
    font-size: 20px;
    font-weight: 500;
    color: white;

    ::placeholder {
      color: white;
    }

    :focus {
      outline: none;
    }
  }
`;

const AiGenerateButton = styled.button`
  min-width: 144px;
  padding: 0 20px;
  height: 48px;
  border-radius: 12px;
  border: none;
  background: #6d4dc7;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 800;
`;

// 1440px 이상에서 보이는 버튼
const DesktopLoginButton = styled(AiGenerateButton)`
  display: flex;
  @media (max-width: 1440px) {
    display: none;
  }
`;

// 1440px 이하에서 보이는 버튼
const MobileLoginButton = styled(AiGenerateButton)`
  display: flex;
  @media (min-width: 1440px) {
    display: none;
  }
`;
