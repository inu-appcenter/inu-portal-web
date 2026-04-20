import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { BottomSheet } from "react-spring-bottom-sheet";
import "react-spring-bottom-sheet/dist/style.css";
import styled from "styled-components";
import { FiChevronRight, FiAlertCircle } from "react-icons/fi";

type SubItem = {
  title: string;
  url: string;
  code: string;
};

type Department = {
  title: string;
  subItems?: SubItem[];
};

type NavBarProps = {
  departments: Department[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  handleClick?: (arg0: string) => void;
};

const DepartmentMenu = ({
  departments,
  isOpen,
  setIsOpen,
  handleClick,
}: NavBarProps) => {
  const [maxHeight, setMaxHeight] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const screenHeight = window.innerHeight;
    setMaxHeight(screenHeight * 0.85);
  }, []);

  return (
    <StyledBottomSheet
      open={isOpen}
      maxHeight={maxHeight}
      blocking={true}
      onDismiss={() => setIsOpen(false)}
      header={
        <Header>
          <Title>학과 선택</Title>
        </Header>
      }
    >
      <ContentWrapper>
        <NoticeBox>
          <FiAlertCircle size={18} />
          <p>
            학과 변경 시 학과 공지 알리미 설정을 다시 해야합니다. 다시 설정하지
            않으면 이전 학과 알림이 갈 수 있습니다.
          </p>
        </NoticeBox>
        <DepartmentsList>
          {departments.map((dept) => (
            <DepartmentSection key={dept.title}>
              <SectionHeader>{dept.title}</SectionHeader>
              <SubItemGrid>
                {dept.subItems &&
                  dept.subItems.map((sub) => (
                    <SubItemButton
                      key={sub.title}
                      onClick={() => {
                        if (handleClick) {
                          handleClick(sub.code);
                          return;
                        }
                        navigate(`/home/deptnotice/${sub.code}`);
                        setIsOpen(false);
                      }}
                    >
                      <span className="sub-title">{sub.title}</span>
                      <FiChevronRight className="arrow" size={16} />
                    </SubItemButton>
                  ))}
              </SubItemGrid>
            </DepartmentSection>
          ))}
        </DepartmentsList>
      </ContentWrapper>
    </StyledBottomSheet>
  );
};

export default DepartmentMenu;

// Styled Components
const StyledBottomSheet = styled(BottomSheet)`
  z-index: 10000 !important;

  /* 라이브러리 내부 오버레이에 직접 z-index 부여 */
  [data-rsbs-overlay] {
    z-index: 10000 !important;
  }

  /* 배경색 및 핸들 색상 변수 설정 */
  --rsbs-bg: #f8f9fa;
  --rsbs-handle-bg: #e9ecef;

  [data-rsbs-header] {
    background-color: #fff;
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
    padding-bottom: 20px;
    /* 헤더 영역도 확실히 위로 */
    z-index: 1;
  }
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 8px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #212529;
`;

const ContentWrapper = styled.div`
  padding: 0 20px 40px;
  box-sizing: border-box;
`;

const NoticeBox = styled.div`
  display: flex;
  gap: 10px;
  background-color: #e7f1ff;
  padding: 14px 16px;
  border-radius: 12px;
  margin-bottom: 24px;
  border: 1px solid #d0e3ff;

  p {
    margin: 0;
    font-size: 13px;
    color: #0056b3;
    line-height: 1.5;
    font-weight: 500;
    word-break: keep-all;
  }

  svg {
    flex-shrink: 0;
    color: #0056b3;
    margin-top: 2px;
  }
`;

const DepartmentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 28px;
`;

const DepartmentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionHeader = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #868e96;
  padding-left: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const SubItemGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
`;

const SubItemButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background-color: #ffffff;
  border: 1px solid #edf2f7;
  border-radius: 12px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);

  .sub-title {
    font-size: 15px;
    font-weight: 600;
    color: #495057;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .arrow {
    color: #ced4da;
    transition: transform 0.2s ease;
  }

  &:active {
    background-color: #f1f3f5;
    transform: scale(0.98);
  }

  &:hover {
    border-color: #dee2e6;
    .arrow {
      color: #adb5bd;
      transform: translateX(2px);
    }
  }
`;
