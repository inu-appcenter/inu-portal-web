import styled from "styled-components";
import Manual1 from "resources/assets/helllo-bus/manual-1.svg";
import Manual2 from "resources/assets/helllo-bus/manual-2.svg";
import Manual3 from "resources/assets/helllo-bus/manual-3.svg";
import Manual4 from "resources/assets/helllo-bus/manual-4.svg";
import backbtn from "resources/assets/mobile-common/backbtn.svg";
import { useState } from "react";
// import Title from "mobile/containers/mypage/MobileTitleHeader.tsx"
// import useMobileNavigate from "../../../hooks/useMobileNavigate.ts";

export default function HelloBus() {
  const [show, setShow] = useState(0);
  // const mobileNavigate = useMobileNavigate();

  const manuals = [
    { title: "", steps: [], images: [] },
    {
      title: "헬로버스 앱 다운로드 메뉴얼",
      steps: [
        "1. 헬로버스 앱을 <strong>다운로드</strong>한 후 설치해주세요.",
        "2. 헬로버스 앱을 실행한 후, 위치 정보 엑세스에 대한 팝업창 '<strong>허용</strong>' 버튼을 눌러주세요.",
        "3. (1) 서비스이용약관에 차례대로 동의한 후, 본인의 전화번호를 입력하여 '<strong>인증 요청</strong>'을 해주세요.",
        "3. (2) 문자메시지로 받으신 인증번호를 입력한 후 '<strong>인증 확인</strong>'버튼을 눌러주세요.",
        "4. 서비스 안내 팝업창의 '<strong>확인</strong>' 버튼을 눌러주세요.",
        "5. 헬로버스 앱이 <strong>설치 완료</strong>되었습니다.",
      ],
      images: [
        "/helloBus/1.png",
        "/helloBus/2.png",
        "/helloBus/3.png",
        "/helloBus/4.png",
        "/helloBus/5.png",
      ],
    },
    {
      title: "통학 서비스 이용 권한 요청에 대한 메뉴얼",
      steps: [
        "6. 최초의 지도화면에서 '<strong>나의메뉴</strong>'를 실행하세요.",
        "7. '나의메뉴' 화면에서 '<strong>운행사 사용신청</strong>'을 실행하세요.",
        "8. (1) '<strong>3자 정보제공 동의</strong>'를 해주세요.",
        "8. (2) '운행사 선택'에서 '<strong>인천대학교</strong>'를 검색하여 선택해 주세요.",
        "8. (3) '제공되는 개인정보'에서 '성명'란에 본인이름, '소속'란에 '인천대학교 구성원'을 입력한 후에 <strong>승인요청</strong>을 눌러주세요.",
      ],
      images: ["/helloBus/6.png", "/helloBus/7.png", "/helloBus/8.png"],
    },
    {
      title: "노선등록에 대한 메뉴얼",
      steps: [
        "9. 지도화면에서 '<strong>노선검색</strong>'을 실행하세요.",
        "10. (1) '노선 우선' 또는 '정류장 우선'을 선택해주세요.",
        "10. (2) 노선명 또는 정류장명을 입력한 후 '돋보기' 버튼을 눌러주세요.",
        "11. 검색되어 나온 노선 리스트 중, 이용하길 원하는 노선을 선택하여 주세요.",
        "12. (1) 탑승하고자 하는 정류장의 버튼을 우측으로 밀어 지정해주세요.",
        "12. ※ 1개의 노선당 최대 2개의 탑승정류장을 지정할 수 있습니다.",
        "12. (2) 탑승정류장 등록팝업창에서 '예' 버튼을 눌러주세요.",
        "13. (1) 오른쪽 상단의 '즐겨찾기' 버튼을 눌러주세요.",
        "    (2) 설정완료 팝업창에서 '예' 버튼을 눌러주세요.",
      ],
      images: [
        "/helloBus/9.png",
        "/helloBus/10.png",
        "/helloBus/11.png",
        "/helloBus/12.png",
        "/helloBus/13.png",
      ],
    },
    {
      title: "알림존 설정",
      steps: [
        "14. (1) '<strong>알림존</strong>' 메뉴 선택",
        "14. (2) 화면에 뜬 '빨간색 원' 버튼 선택",
        "15. (1) 알림존 명칭 입력",
        "15. (2) 메세지 수신시간 시간대 설정",
        "15. (3) 알림존 형태 선택",
        "15. (4) '다음' 버튼 선택",
        "16. (1) 지도화면을 이동하여 원하는 경로상에 아이콘을 위치 시켜주세요.",
        "16. (2) 반경을 설정합니다. (50M~100M 추천)",
        "17. 원형 형태의 도착 알림존이 설정 완료되었습니다.",
      ],
      images: [
        "/helloBus/14.png",
        "/helloBus/15.png",
        "/helloBus/16.png",
        "/helloBus/17.png",
      ],
    },
  ];

  return (
    <HelloBusWrapper>
      {/*<Title title={"통학버스"} onback={() => mobileNavigate('/home')}/>*/}

      {show > 0 ? (
        <Section>
          <button onClick={() => setShow(0)}>
            <img src={backbtn} alt="뒤로가기 버튼" />
            <span>{manuals[show].title}</span>
          </button>
          <ImageSlider>
            {manuals[show].images.map((image, idx) => (
              <img
                key={idx}
                src={image}
                onClick={() => window.open(image, "_blank")}
                alt={`Step ${idx + 1}`}
              />
            ))}
          </ImageSlider>
          <Steps>
            {manuals[show].steps.map((step, idx) => (
              <p key={idx} dangerouslySetInnerHTML={{ __html: step }} />
            ))}
          </Steps>
        </Section>
      ) : (
        <div className="manual-wrapper1">
          <div className="manual-wrapper2">
            <img
              src={Manual1}
              onClick={() => setShow(1)}
              alt="헬로버스 앱 다운로드 메뉴얼"
            />
            <img
              src={Manual2}
              onClick={() => setShow(2)}
              alt="통학 서비스 이용 권한 요청에 대한 메뉴얼"
            />
          </div>
          <div className="manual-wrapper2">
            <img
              src={Manual3}
              onClick={() => setShow(3)}
              alt="노선등록에 대한 메뉴얼"
            />
            <img src={Manual4} onClick={() => setShow(4)} alt="알림존 설정" />
          </div>
        </div>
      )}
    </HelloBusWrapper>
  );
}

const HelloBusWrapper = styled.div`
  width: 100%;
  box-sizing: border-box;

  .manual-wrapper1 {
    //padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;

    .manual-wrapper2 {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;

      img {
        width: 48%;
      }
    }
  }
`;

const Section = styled.div`
  button {
    border: none;
    font-size: 14px;
    background-color: transparent;
    display: flex;
    align-items: center;
    gap: 8px;
    //width: fit-content;

    img {
      height: 14px;
    }

    span {
      padding-top: 2px;
      min-width: fit-content;
    }
  }
`;

const Steps = styled.div`
  line-height: 1.6;
  background-color: rgba(248, 248, 248, 1);
  padding: 8px;
< < < < < < < Updated upstream padding-bottom: 80 px;
= = = = = = = >>> >>> > Stashed changes p {
  font-weight: 500;
}

  strong {
    color: rgba(14, 77, 157, 1);
    font-weight: 700;
  }
`;

const ImageSlider = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 10px;
  padding: 10px 20px;
  width: 100%;
  box-sizing: border-box;

  img {
    flex: 0 0 auto;
    height: auto;
    border-radius: 8px;
    border: 1px solid rgba(14, 77, 157, 1);
    width: 160px;
  }

  &::-webkit-scrollbar {
    height: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #aaa;
  }
`;
