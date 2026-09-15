import styled from "styled-components";
import TitleContentArea from "@/components/desktop/common/TitleContentArea";
import Box from "@/components/common/Box";
import Divider from "@/components/common/Divider";
import Skeleton from "@/components/common/Skeleton"; // 스켈레톤 컴포넌트 임포트
import { CafeteriaSection } from "@/utils/cafeteriaMenu";
import { DESKTOP_MEDIA } from "@/styles/responsive";

interface CafeteriaItemProps {
  section?: CafeteriaSection & { title: string };
  isLoading: boolean;
}

export default function CafeteriaItem({ section, isLoading }: CafeteriaItemProps) {
  // 로딩 상태 레이아웃
  if (isLoading) {
    return (
      <TitleContentArea title={<Skeleton width={120} height={24} />}>
        <Box>
          <DetailWrapper>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <Skeleton width="40%" height={16} />
              <Skeleton width="30%" height={16} />
              <Skeleton width="50%" height={16} />
              <Skeleton width="40%" height={16} />
              <Skeleton width="30%" height={16} />
            </div>
            <Divider />
            <div className="detail-wrapper">
              <div className="sub-detail-wrapper">
                <Skeleton width={40} height={14} />
                <TinyCircle />
                <Skeleton width={40} height={14} />
              </div>
            </div>
          </DetailWrapper>
        </Box>
      </TitleContentArea>
    );
  }

  if (!section) {
    return null;
  }

  return (
    <TitleContentArea title={section.title}>
      <Box>
        <DetailWrapper>
          <p className="info">
            {section.menu === "업데이트 전" ? (
              <>
                아직 업데이트 되지 않았습니다.
                <br />
                2기숙사 식당은 당일 식사 시간 전에 업데이트 됩니다!
              </>
            ) : (
              section.menu
            )}
          </p>
          <Divider />
          {section.price && section.calorie && (
            <div className="detail-wrapper">
              <div className="sub-detail-wrapper">
                <span className="price">{section.calorie}</span>
                <TinyCircle />
                <span className="calory">{section.price}</span>
              </div>
            </div>
          )}
        </DetailWrapper>
      </Box>
    </TitleContentArea>
  );
}

const TinyCircle = styled.p`
  width: 1px;
  height: 1px;
  background-color: #888888;
  border-radius: 50%;
`;

const DetailWrapper = styled.div`
  width: 100%;
  min-height: 90px;
  box-sizing: border-box;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 16px 20px;

  .info {
    font-size: 13px;
    font-weight: 500;
    color: #404040;
    margin: 0;
    /* 서버가 코너와 메뉴를 개행으로 구분해 내려준다. */
    white-space: pre-line;
  }

  .detail-wrapper {
    display: flex;
    gap: 6px;
    justify-content: flex-end;
    align-items: center;

    .sub-detail-wrapper {
      display: flex;
      gap: 10px;
      border: none;
      align-items: center;
      justify-content: center;
      border-radius: 5px;
      padding: 3px;
      font-size: 10px;
      font-weight: 500;
      color: #888888;
    }
  }

  @media ${DESKTOP_MEDIA} {
    min-height: 220px;

    .info {
      font-size: 15px;
      line-height: 1.7;
    }

    .detail-wrapper {
      margin-top: auto;

      .sub-detail-wrapper {
        gap: 12px;
        padding: 6px 8px;
        font-size: 12px;
      }
    }
  }
`;
