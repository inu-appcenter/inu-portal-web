import { useEffect, useState } from "react";
import { BottomSheet } from "react-spring-bottom-sheet";
import styled from "styled-components";
import useMobileNavigate from "../../../hooks/useMobileNavigate.ts";

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
};

const DepartmentMenu = ({ departments, isOpen, setIsOpen }: NavBarProps) => {
  const [maxHeight, setMaxHeight] = useState(0);

  const mobileNavigate = useMobileNavigate();

  useEffect(() => {
    const screenHeight = window.innerHeight;
    setMaxHeight(screenHeight * 0.7);
  }, []);

  return (
    <BottomSheet
      open={isOpen}
      maxHeight={maxHeight}
      blocking={true}
      onDismiss={() => setIsOpen(false)} // 외부 클릭 시 호출
    >
      <ContentWrapper>
        <h2>학과 선택</h2>
        <DepartmentsWrapper>
          {departments.map((dept) => (
            <DepartmentBlock key={dept.title}>
              <DepartmentTitle>{dept.title}</DepartmentTitle>
              <SubItemList>
                {dept.subItems &&
                  dept.subItems.map((sub) => (
                    <SubItem
                      key={sub.title}
                      onClick={() => {
                        mobileNavigate(`/home/deptnotice/${sub.code}`);
                        setIsOpen(false);
                      }}
                    >
                      {sub.title}
                    </SubItem>
                  ))}
              </SubItemList>
            </DepartmentBlock>
          ))}
        </DepartmentsWrapper>
      </ContentWrapper>
    </BottomSheet>
  );
};

export default DepartmentMenu;

// Styled Components
const ContentWrapper = styled.div`
  padding: 16px;
  padding-top: 0;
  box-sizing: border-box;
`;

const DepartmentsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap; // 넘치는 항목은 다음 줄로 이동
  align-items: flex-start; // 상단 정렬

  gap: 12px;

  justify-content: center;
  //align-items: center;
`;

const DepartmentBlock = styled.div`
  //min-width: 100px;
  //max-width: 120px; // 최대 너비 제한
  width: 110px;
`;

const DepartmentTitle = styled.h3`
  color: #0e4d9d;
  font-size: 16px;
  font-weight: 600;
`;

const SubItemList = styled.ul`
  list-style: none;
  padding: 0;
`;

const SubItem = styled.li`
  margin: 5px 0;
  text-decoration: none;
  color: #000;
  font-size: 16px;
  font-weight: 400;
`;
