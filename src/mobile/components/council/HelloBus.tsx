import styled from "styled-components";

export default function HelloBus() {
  const manuals = [
    {
      title: "<헬로버스 앱 다운로드 메뉴얼>",
      steps: [
        "1. 헬로버스 앱을 다운로드한 후 설치해주세요.",
        "2. 헬로버스 앱을 실행한 후, 위치 정보 엑세스에 대한 팝업창 '허용' 버튼을 눌러주세요.",
        "3. (1) 서비스이용약관에 차례대로 동의한 후, 본인의 전화번호를 입력하여 '인증 요청'을 해주세요.",
        "   (2) 문자메시지로 받으신 인증번호를 입력한 후 '인증 확인'버튼을 눌러주세요.",
        "4. 서비스 안내 팝업창의 '확인' 버튼을 눌러주세요.",
        "5. 헬로버스 앱이 설치 완료되었습니다.",
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
      title: "<통학 서비스 이용 권한 요청에 대한 메뉴얼>",
      steps: [
        "6. 최초의 지도화면에서 '나의메뉴'를 실행하세요.",
        "7. '나의메뉴' 화면에서 '운행사 사용신청'을 실행하세요.",
        "8. (1) '제3자 정보제공 동의'를 해주세요.",
        "   (2) '운행사 선택'에서 '인천대학교'를 검색하여 선택해 주세요.",
        "   (3) '제공되는 개인정보'에서 '성명'란에 본인이름, '소속'란에 '인천대학교 구성원'을 입력한 후에 승인요청을 눌러주세요.",
      ],
      images: ["/helloBus/6.png", "/helloBus/7.png", "/helloBus/8.png"],
    },
    {
      title: "<노선등록에 대한 메뉴얼>",
      steps: [
        "9. 지도화면에서 '노선검색'을 실행하세요.",
        "10. (1) '노선 우선' 또는 '정류장 우선'을 선택해주세요.",
        "    (2) 노선명 또는 정류장명을 입력한 후 '돋보기' 버튼을 눌러주세요.",
        "11. 검색되어 나온 노선 리스트 중, 이용하길 원하는 노선을 선택하여 주세요.",
        "12. (1) 탑승하고자 하는 정류장의 버튼을 우측으로 밀어 지정해주세요.",
        "    ※ 1개의 노선당 최대 2개의 탑승정류장을 지정할 수 있습니다.",
        "    (2) 탑승정류장 등록팝업창에서 '예' 버튼을 눌러주세요.",
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
      title: "<알림존 설정>",
      steps: [
        "14. (1) '알림존' 메뉴 선택",
        "    (2) 화면에 뜬 '빨간색 원' 버튼 선택",
        "15. (1) 알림존 명칭 입력",
        "    (2) 메세지 수신시간 시간대 설정",
        "    (3) 알림존 형태 선택)",
        "    (4) '다음' 버튼 선택",
        "16. (1) 지도화면을 이동하여 원하는 경로상에 아이콘을 위치 시켜주세요.",
        "    (2) 반경을 설정합니다. (50M~100M 추천)",
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
      {manuals.map((manual, index) => (
        <Section key={index}>
          <h3>{manual.title}</h3>
          <Steps>
            {manual.steps.map((step, idx) => (
              <p key={idx}>{step}</p>
            ))}
          </Steps>
          <ImageSlider>
            {manual.images.map((image, idx) => (
              <img key={idx} src={image} alt={`Step ${idx + 1}`} />
            ))}
          </ImageSlider>
        </Section>
      ))}
    </HelloBusWrapper>
  );
}

const HelloBusWrapper = styled.div`
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
`;

const Section = styled.div`
  margin-bottom: 40px;
`;

const Steps = styled.div`
  margin: 20px 0;
  line-height: 1.6;
`;

const ImageSlider = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 10px;
  padding: 10px 0;

  img {
    flex: 0 0 auto;
    width: 200px;
    height: auto;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
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
