import type { FC, SVGProps } from "react";
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { mixpanelTrack } from "@/utils/mixpanel";

interface NavItemProps {
  to: string;
  icon: FC<SVGProps<SVGSVGElement>>;
  activeColor: string;
  inactiveColor: string;
  /** home 아이콘처럼 active 상태에서만 별색 파트가 있는 경우의 강조색. */
  activeAccentColor?: string;
  label: string;
  onClick?: () => void;
  badge?: number;
}

export default function NavItem({
  to,
  icon: Icon,
  activeColor,
  inactiveColor,
  activeAccentColor,
  label,
  onClick,
  badge,
}: NavItemProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive =
    location.pathname === to ||
    (location.pathname.startsWith(to) && to !== ROUTES.HOME);

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    mixpanelTrack.navTabClicked(label);
    navigate(to, { replace: true });
  };

  return (
    <NavItemWrapper onClick={handleClick}>
      <IconWrapper>
        <IconImg
          as={Icon}
          aria-label={label}
          style={
            {
              color: isActive ? activeColor : inactiveColor,
              "--mobile-nav-home-accent": isActive
                ? activeAccentColor
                : undefined,
            } as React.CSSProperties
          }
        />
        {badge !== undefined && badge > 0 && (
          <Badge>{badge > 99 ? "99+" : badge}</Badge>
        )}
      </IconWrapper>
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

const IconWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const IconImg = styled.svg`
  width: 24px;
  height: 24px;
  margin-bottom: 3px;
  transition: transform 0.2s ease;
`;

const Badge = styled.div`
  position: absolute;
  top: -4px;
  right: -8px;
  background-color: #ff3b30;
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 1px 4px;
  border-radius: 10px;
  min-width: 12px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid white;
`;

const Label = styled.span<{ $isActive: boolean }>`
  font-size: 11px;
  font-weight: ${({ $isActive }) => ($isActive ? "600" : "500")};
  color: ${({ $isActive }) => ($isActive ? "#5E92F0" : "#8E8E93")};
  letter-spacing: -0.3px;
  transition: color 0.2s ease;
`;
