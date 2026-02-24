import styled from "styled-components";
import { useHeader } from "@/context/HeaderContext";
import Box from "@/components/common/Box";
import { useMemo, useState } from "react";
import CategorySelectorNew from "@/components/mobile/common/CategorySelectorNew";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import callinuBanner from "@/resources/assets/phonebook/callinu-banner.webp";
import callinuLogo from "@/resources/assets/phonebook/callinu-logo.webp";
import ComingSoonModal from "@/components/mobile/common/ComingSoonModal";

const MobilePhoneBookPage = () => {
  const navigate = useNavigate();
  const [isModalOpen] = useState(true);

  const [categoryList] = useState<string[]>([
    "전체",
    "대학본부",
    "대학",
    "대학원",
    "부속기관",
  ]);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const selectedCategory = params.get("category") || "전체";

  const subHeader = useMemo(
    () => (
      <CategorySelectorNew
        categories={categoryList}
        selectedCategory={selectedCategory}
      />
    ),
    [categoryList, selectedCategory],
  );

  useHeader({
    title: "INU 전화번호부",
    hasback: true,
    subHeader,
    floatingSubHeader: true,
  });

  return (
    <MobilePhoneBookPageWrapper>
      <ComingSoonModal
        isOpen={isModalOpen}
        onClose={() => navigate(ROUTES.HOME, { replace: true })}
      />
      <Box>
        <BannerSection>
          <BannerImage src={callinuBanner} alt="Callin U" />
        </BannerSection>
      </Box>

      <DescriptionSection>
        <LogoInfo>
          <LogoIcon src={callinuLogo} alt="INTIP" />
          <div className="text-group">
            <p className="sub-text">우리 학교의 연락처 앱</p>
            <h2 className="main-title">
              <span>Callin U</span>가 <span className="highlight">INTIP</span>
              으로 돌아왔어요.
            </h2>
            <p className="sub-text">원하는 연락처를 검색해보세요.</p>
          </div>
        </LogoInfo>

        <GuideList>
          <GuideItem>
            <span className="number">1.</span>
            <div className="content">
              <h3>
                <strong>내선번호</strong>로 검색해보세요.
              </h3>
              <p>
                우리 학교 전화번호는 032 - 835 - <strong>[내선번호]</strong>{" "}
                형식입니다.
              </p>
            </div>
          </GuideItem>

          <GuideItem>
            <span className="number">2.</span>
            <div className="content">
              <h3>
                <strong>교수님 이름</strong>으로 검색해보세요.
              </h3>
              <p>담당 선생님 이름 검색은 지원되지 않아요.</p>
            </div>
          </GuideItem>

          <GuideItem>
            <span className="number">3.</span>
            <div className="content">
              <h3>
                <strong>학과명</strong>으로 검색해보세요.
              </h3>
            </div>
          </GuideItem>
        </GuideList>
      </DescriptionSection>
    </MobilePhoneBookPageWrapper>
  );
};

export default MobilePhoneBookPage;

/** 스타일 정의 **/
const MobilePhoneBookPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 0 16px 40px 16px;
`;

const BannerSection = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

const BannerImage = styled.img`
  width: 100px;
  max-width: 200px;
  height: auto;
`;

const DescriptionSection = styled.div`
  padding: 0 20px;
`;

const LogoInfo = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 32px;

  .text-group {
    display: flex;
    flex-direction: column;
    //gap: 4px;
  }

  .sub-text {
    font-size: 14px;
    color: #666;
    margin: 0;
  }

  .main-title {
    font-size: 18px;
    font-weight: 500;
    color: #333;
    line-height: 1.4;
    margin: 0;

    span {
      font-weight: 700;
      color: #2b6cb0;
    }

    .highlight {
      color: #4a90e2;
    }
  }
`;

const LogoIcon = styled.img`
  width: 54px;
  height: 54px;
`;

const GuideList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const GuideItem = styled.div`
  display: flex;
  gap: 4px;

  .number {
    font-size: 16px;
    font-weight: 700;
    color: #333;
    min-width: 20px;
  }

  .content {
    h3 {
      font-size: 16px;
      color: #333;
      margin: 0;
      margin-bottom: 4px;

      strong {
        font-weight: 700;
      }
    }

    p {
      font-size: 14px;
      color: #666;
      margin: 0;
      //line-height: 1.5;

      strong {
        color: #333;
      }
    }
  }
`;
