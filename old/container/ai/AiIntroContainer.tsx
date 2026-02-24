import styled from "styled-components";
import GlassCube from "../../resource/assets/glasscube.svg";
import AiExampleImage1 from "../../resource/assets/AiExampleImage/AiExampleImage1.svg";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import AiLoading from "../../component/ai/AiLoading";
import { predict } from "old/utils/API/Fires";

interface loginInfo {
  user: {
    token: string;
  };
}

export default function AiIntroContainer() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const user = useSelector((state: loginInfo) => state.user);

  const handleGenerateClick = async () => {
    if (inputRef.current && !inputRef.current.value.trim()) {
      alert("명령어를 입력해주세요.");
      return;
    }
    if (inputRef.current) {
      // sessionStorage.setItem("lastInput", inputRef.current.value); // Save input
      setIsLoading(true);
      try {
        // const response = await postFires(inputRef.current.value, user.token);
        // if (response.status === 201) {
        //   navigate(`/ai/result/${response.body.data}`);
        // } else if (response.status === 401) {
        //   alert("로그인 후 이용이 가능합니다.");
        // } else if (response.status === 400) {
        //   alert("이미지 생성 실패");
        // } else if (response.status === 403) {
        //   alert("축제 기간에는 관리자만 이미지 생성 가능!");
        // } else {
        //   console.error("이미지 생성 실패:", response.status);
        // }
        const response = await predict(user.token, inputRef.current.value);
        if (response.status === 200) {
          navigate("/ai/gallery");
        } else if (response.status === 400) {
          alert("잘못된 요청입니다.");
        } else {
          console.error(
            "이미지 생성 요청 실패:",
            response.status,
            response.body.msg,
          );
        }
      } catch (error) {
        setIsLoading(false);
        console.error("이미지 생성 실패:", error);
      }
    }
  };

  useEffect(() => {
    const lastInput = sessionStorage.getItem("lastInput");
    if (lastInput && inputRef.current) {
      inputRef.current.value = lastInput;
    }
  }, []);

  return (
    <>
      {isLoading ? (
        <AiLoading />
      ) : (
        <AiIntroWrapper>
          <AiIntroText />
          <BottomWrapper>
            <GlassCubeImg src={GlassCube} alt="Glass Cube" />
            <RightWrapper>
              <HowToUseWrapper>
                <HowToUseTitleWrapper>
                  <HowToUseTitleText>HOW TO USE</HowToUseTitleText>
                  <AiExampleImage src={AiExampleImage1} alt="Example" />
                </HowToUseTitleWrapper>
                <HowToUseLine />
                <HowToUseText>
                  <span style={{ fontSize: "20px", lineHeight: "30px" }}>
                    1. 원하는 행동 또는 상황을 입력합니다. 예를 들어,
                    "exercising", "studying" 등을 입력하세요.
                    <br />
                    2. 앱은 입력된 내용을 바탕으로 AI로 캐릭터 이미지를
                    생성합니다.
                    <br />
                    3. 생성된 이미지를 즐겨보세요! 필요에 따라 저장하거나 공유할
                    수 있습니다.
                    <br />
                  </span>
                </HowToUseText>
              </HowToUseWrapper>
              <AiFunctionWrapper>
                <AiInputWrapper>
                  <AiInputLine />
                  <AiInput
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
                  {user.token ? (
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
            </RightWrapper>
          </BottomWrapper>
        </AiIntroWrapper>
      )}
    </>
  );
}

function AiIntroText() {
  return (
    <AiIntroTextWrapper>
      <AiIntroTextStyled>
        <span style={{ fontSize: "16px", lineHeight: "20px" }}>
          <b style={{ fontSize: "20px" }}>AI 횃불이</b>는 창의적이고 재미있는
          캐릭터를 AI로 생성하는 앱입니다.
          <br />
          <br />
          이 앱은 사용자가 입력한 특정 행동이나 상황을 바탕으로 고유한 캐릭터
          이미지를 생성합니다.
          <br />
          예를 들어, <b>
            사용자가 "피자를 먹는 횃불이"와 같은 명령을 입력
          </b>{" "}
          하면, 앱은 피자를 먹고 있는 횃불이의 이미지를 AI로 생성하여
          제공합니다.
        </span>
      </AiIntroTextStyled>
      <DummyDiv />
    </AiIntroTextWrapper>
  );
}

// Styled Components
const AiIntroWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  flex-grow: 1;
`;

const AiIntroTextWrapper = styled.div`
  width: 100%;
  margin-top: 0px;
  display: flex;
  align-items: center;
  justify-content: space-around;
`;

const AiIntroTextStyled = styled.div`
  padding: 30px;
`;

const DummyDiv = styled.div`
  width: 400px;
  @media (max-width: 1400px) {
    display: none;
  }
`;

const BottomWrapper = styled.div`
  width: 100%;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-around;
`;

const GlassCubeImg = styled.img`
  padding: 30px;
  @media (max-width: 1400px) {
    display: none;
  }
`;

const RightWrapper = styled.div`
  max-width: 815px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 60px;
`;

const HowToUseWrapper = styled.div``;

const HowToUseTitleWrapper = styled.div`
  display: flex;
  align-items: end;
  justify-content: space-between;
`;

const HowToUseTitleText = styled.span`
  font-size: 30px;
  font-weight: 800;
`;

const AiExampleImage = styled.img`
  height: 300px;
`;

const HowToUseLine = styled.div`
  margin-top: 10px;
  margin-bottom: 10px;
  background: white;
  width: 100%;
  height: 1px;
`;

const HowToUseText = styled.div``;

const AiFunctionWrapper = styled.div`
  width: 90%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  .buttons-wrapper {
    display: flex;
    gap: 12px;
    @media (max-width: 425px) {
      flex-direction: column;
    }
  }
`;

const AiInputWrapper = styled.div`
  width: 100%;
  height: 43px;
  padding-left: 20px;
  background: transparent;
  border: 1px solid white;
  border-radius: 15px;
  display: flex;
  align-items: center;
`;

const AiInputLine = styled.div`
  width: 1px;
  height: 27px;
  background: white;
`;

const AiInput = styled.input`
  flex-grow: 1;
  padding-left: 10px;
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
`;

const AiGenerateButton = styled.div`
  width: 143px;
  padding: 0 20px;
  height: 46px;
  border-radius: 10px;
  background: #6d4dc7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 800;
  cursor: pointer;
`;

const DesktopLoginButton = styled(AiGenerateButton)`
  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileLoginButton = styled(AiGenerateButton)`
  display: none;
  @media (max-width: 768px) {
    display: flex;
  }
`;
