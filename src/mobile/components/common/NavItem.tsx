import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";

interface NavItemProps {
  to: string;
  icon: string;
  activeIcon: string;
  label: string;
}

export default function NavItem({ to, icon, activeIcon, label }: NavItemProps) {
  const location = useLocation();
  const navigate = useNavigate();

  // pathname이 정확히 일치하거나, 하위 경로 포함 여부 판단
  const isActive =
    location.pathname === to || location.pathname.startsWith(to + "/");

  const handleClick = () => {
    navigate(to);
  };

  return (
    <NavItemWrapper onClick={handleClick}>
      <Icon src={isActive ? activeIcon : icon} alt={label} />
      <Label $isActive={isActive}>{label}</Label>
    </NavItemWrapper>
  );
}

const NavItemWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px;
  width: 55px;
`;

const Icon = styled.img`
  width: 24px;
  height: 24px;
`;

const Label = styled.div<{ $isActive: boolean }>`
  font-size: 12px;
  color: ${({ $isActive }) => ($isActive ? "#9CAFE2" : "#D6D1D5")};
`;
