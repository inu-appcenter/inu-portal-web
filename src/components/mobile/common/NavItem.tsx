import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

interface NavItemProps {
  to: string;
  icon: string;
  activeIcon: string;
  label: string;
}

export default function NavItem({ to, icon, activeIcon, label }: NavItemProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive =
    location.pathname === to ||
    (location.pathname.startsWith(to) && to !== ROUTES.HOME);

  const handleClick = () => {
    navigate(to, { replace: true });
  };

  return (
    <NavItemWrapper onClick={handleClick}>
      <Icon src={isActive ? activeIcon : icon} alt={label} />
      <Label $isActive={isActive}>{label}</Label>
    </NavItemWrapper>
  );
}

const NavItemWrapper = styled.button`
  position: relative;
  z-index: 1;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  width: 100%;
  height: 100%;

  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
`;

const Icon = styled.img`
  width: 24px;
  height: 24px;
  margin-bottom: 3px;
  transition: transform 0.2s ease;
`;

const Label = styled.span<{ $isActive: boolean }>`
  font-size: 11px;
  font-weight: ${({ $isActive }) => ($isActive ? "600" : "500")};
  color: ${({ $isActive }) => ($isActive ? "#5E92F0" : "#8E8E93")};
  letter-spacing: -0.3px;
  transition: color 0.2s ease;
`;
