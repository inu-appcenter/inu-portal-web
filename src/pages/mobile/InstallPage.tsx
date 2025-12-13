import { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import logoWithText from "@/resources/assets/mobile-login/logo-with-text.svg";
import install_iOS from "@/resources/assets/install/install-iOS.svg";
import install_Android from "@/resources/assets/install/install-Android.svg";
import install_Mac from "@/resources/assets/install/install-Mac.svg";
import check_Mac from "@/resources/assets/install/check-Mac.svg";
import install_Windows from "@/resources/assets/install/install-Windows.svg";
import check_Windows from "@/resources/assets/install/check-Windows.svg";

export default function InstallPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [selectedTab, setSelectedTab] = useState<string>("android");
  const navigate = useNavigate();

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: any) => {
      console.log("beforeinstallprompt event triggered");
      event.preventDefault();
      setDeferredPrompt(event);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === "accepted") {
          console.log("User accepted the install prompt");
        } else {
          console.log("User dismissed the install prompt");
        }
        setDeferredPrompt(null);
      });
    } else {
      alert("설치 프롬프트를 사용할 수 없습니다.");
    }
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case "ios":
        return (
          <TabContent>
            <h2>iOS 설치 방법</h2>
            <span>Safari 브라우저를 이용합니다.</span>
            <span>
              <Clickable onClick={() => navigate("/m/home")}>
                메인 페이지
              </Clickable>
              로 이동한 후, 홈 화면에 추가를 이용합니다.
            </span>
            <span>아래의 설치 이미지를 참고하여 설치를 진행합니다.</span>
            <ImageWrapper>
              <InstallImage src={install_iOS} alt="iOS 설치 방법" />
            </ImageWrapper>
          </TabContent>
        );
      case "android":
        return (
          <TabContent>
            <h2>Android 설치 방법</h2>
            <span>크로미움 브라우저(예: Chrome)를 이용합니다.</span>
            <span>
              <Clickable onClick={() => navigate("/m/home")}>
                메인 페이지
              </Clickable>
              로 이동한 후, 홈 화면에 추가를 이용합니다.
            </span>
            <span>아래의 설치 이미지를 참고하여 설치를 진행합니다.</span>
            <ImageWrapper>
              <InstallImage src={install_Android} alt="Android 설치 방법" />
            </ImageWrapper>
            <span>
              또는, 아래 설치 버튼을 클릭하여 설치 프롬프트를 이용합니다.
            </span>
            <InstallButton onClick={handleInstallClick}>앱 설치</InstallButton>
            <div style={{ marginTop: 20 }}>
              <h2>설치 프롬프트가 활성화되지 않는 경우</h2>
              <ul>
                <li>
                  앱이 이미 설치된 경우, 설치 프롬프트가 나타나지 않습니다.
                </li>
                <li>
                  Chromium 기반이 아닌 브라우저를 사용 중인 경우, 설치
                  프롬프트가 나타나지 않습니다.
                </li>
                <li>
                  일부 운영체제에서는 앱 설치가 지원되지 않을 수 있습니다.
                </li>
              </ul>
            </div>
          </TabContent>
        );
      case "windows":
        return (
          <TabContent>
            <h2>Windows 설치 방법</h2>
            <span>크로미움 브라우저(예: Edge)를 이용합니다.</span>
            <span>
              <Clickable onClick={() => navigate("/")}>메인 페이지</Clickable>로
              이동한 후, 아래의 사진처럼 앱 설치 아이콘을 이용합니다.
            </span>
            <ImageWrapper>
              <InstallImage src={install_Windows} alt="Windows 설치 방법" />
              <CheckImage src={check_Windows} alt="Windows 설치 아이콘 확인" />
            </ImageWrapper>
          </TabContent>
        );
      case "mac":
        return (
          <TabContent>
            <h2>Mac 설치 방법</h2>
            <span>크로미움 브라우저(예: Chrome)를 이용합니다.</span>
            <span>
              <Clickable onClick={() => navigate("/")}>메인 페이지</Clickable>로
              이동한 후, 아래의 사진처럼 앱 설치 아이콘을 이용합니다.
            </span>
            <ImageWrapper>
              <InstallImage src={install_Mac} alt="Mac 설치 방법" />
              <CheckImage src={check_Mac} alt="Mac 설치 아이콘 확인" />
            </ImageWrapper>
          </TabContent>
        );
      default:
        return null;
    }
  };

  return (
    <InstallPageWrapper>
      <IntroImage src={logoWithText} />
      <h1>앱 설치하기</h1>
      <Tabs>
        <TabButton
          onClick={() => setSelectedTab("ios")}
          selected={selectedTab === "ios"}
        >
          iOS
        </TabButton>
        <TabButton
          onClick={() => setSelectedTab("android")}
          selected={selectedTab === "android"}
        >
          Android
        </TabButton>
        <TabButton
          onClick={() => setSelectedTab("windows")}
          selected={selectedTab === "windows"}
        >
          Windows
        </TabButton>
        <TabButton
          onClick={() => setSelectedTab("mac")}
          selected={selectedTab === "mac"}
        >
          Mac
        </TabButton>
      </Tabs>
      <div style={{ marginTop: 20 }}>{renderTabContent()}</div>
    </InstallPageWrapper>
  );
}

const InstallPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const IntroImage = styled.img`
  max-width: 75%;
  max-height: 200px;
`;

const Tabs = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
`;

const TabButton = styled.button<{ selected: boolean }>`
  padding: 10px 20px;
  background-color: ${(props) => (props.selected ? "#007bff" : "#f1f1f1")};
  color: ${(props) => (props.selected ? "#fff" : "#000")};
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #007bff;
    color: #fff;
  }
`;

const TabContent = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
`;

const ImageWrapper = styled.div`
  margin-top: 20px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 90%;
`;
const InstallImage = styled.img`
  width: 100%;
`;

const CheckImage = styled.img`
  width: 100%;
`;

const InstallButton = styled.button`
  margin-top: 10px;
  padding: 10px 20px;
  background-color: "#f1f1f1";
  color: "#000";
  border: none;
  border-radius: 5px;
`;

const Clickable = styled.span`
  color: blue;
  text-decoration: underline;
  cursor: pointer;

  &:hover {
    color: darkblue;
  }
`;
