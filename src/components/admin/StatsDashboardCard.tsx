import React from "react";
import styled from "styled-components";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { DESKTOP_MEDIA } from "@/styles/responsive";

interface StatsDashboardCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isUp: boolean;
  };
  description?: string;
  color?: string;
  onClick?: () => void;
}

const StatsDashboardCard: React.FC<StatsDashboardCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  description,
  color = "#0f766e",
  onClick,
}) => {
  return (
    <Card onClick={onClick} $isClickable={!!onClick}>
      <MobileIconWrapper>
        <IconWrapper $color={color}>
          <Icon size={20} />
        </IconWrapper>
      </MobileIconWrapper>
      <Header>
        <IconWrapper $color={color}>
          <Icon size={24} />
        </IconWrapper>
        {trend && (
          <TrendBadge $isUp={trend.isUp}>
            {trend.isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{trend.value}%</span>
          </TrendBadge>
        )}
      </Header>
      <Body>
        <Title>{title}</Title>
        <Value>{value}</Value>
        {description && <Description>{description}</Description>}
      </Body>
    </Card>
  );
};

export default StatsDashboardCard;

const Card = styled.div<{ $isClickable: boolean }>`
  background: #ffffff;
  border-radius: 12px;
  padding: 12px 8px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: ${(props) => (props.$isClickable ? "pointer" : "default")};
  aspect-ratio: 1 / 1;

  @media ${DESKTOP_MEDIA} {
    padding: 24px;
    gap: 16px;
    border-radius: 20px;
    aspect-ratio: auto;
    align-items: flex-start;
    justify-content: flex-start;
  }

  &:hover {
    ${(props) =>
      props.$isClickable &&
      `
      transform: translateY(-4px);
      border-color: #cbd5e1;
      box-shadow: 0 12px 24px -8px rgba(15, 23, 42, 0.12);
    `}
  }

  &:active {
    ${(props) => props.$isClickable && `transform: translateY(-2px) scale(0.98);`}
  }
`;

const Header = styled.div`
  display: none;
  justify-content: space-between;
  align-items: flex-start;

  @media ${DESKTOP_MEDIA} {
    display: flex;
  }
`;

// Simplified Mobile view: Icon separate from Header
const MobileIconWrapper = styled.div`
  display: flex;
  @media ${DESKTOP_MEDIA} { display: none; }
`;

const IconWrapper = styled.div<{ $color: string }>`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background-color: ${(props) => props.$color}15;
  color: ${(props) => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;

  svg { width: 14px; height: 14px; }

  @media ${DESKTOP_MEDIA} {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    svg { width: 24px; height: 24px; }
  }
`;

const TrendBadge = styled.div<{ $isUp: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  background-color: ${(props) => (props.$isUp ? "#f0fdf4" : "#fef2f2")};
  color: ${(props) => (props.$isUp ? "#16a34a" : "#dc2626")};
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;

  @media ${DESKTOP_MEDIA} {
    align-items: flex-start;
    gap: 4px;
  }
`;

const Title = styled.h4`
  margin: 0;
  color: #64748b;
  font-size: 0.65rem;
  font-weight: 600;

  @media ${DESKTOP_MEDIA} {
    font-size: 0.875rem;
  }
`;

const Value = styled.div`
  color: #0f172a;
  font-size: 1.125rem;
  font-weight: 800;
  letter-spacing: -0.02em;

  @media ${DESKTOP_MEDIA} {
    font-size: 1.75rem;
  }
`;

const Description = styled.p`
  display: none;
  margin: 4px 0 0;
  color: #94a3b8;
  font-size: 0.8125rem;

  @media ${DESKTOP_MEDIA} {
    display: block;
  }
`;
