import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';

interface NavItemProps {
  to: string;
  icon: string;
  activeIcon: string;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, activeIcon, label }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = location.pathname === to;

  return (
    <NavItemWrapper onClick={() => { navigate(to); }}>
      <Icon src={isActive ? activeIcon : icon} alt={label} />
      <Label isActive={isActive}>{label}</Label>
    </NavItemWrapper>
  );
};

const NavItemWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px;
`;

const Icon = styled.img`
  width: 24px;
  height: 24px;
`;

const Label = styled.div<{ isActive: boolean }>`
  font-size: 12px;
  color: ${({ isActive }) => (isActive ? '#9CAFE2' : '#D6D1D5')};
`;

export default NavItem;
