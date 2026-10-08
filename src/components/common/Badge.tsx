import styled from "styled-components";

interface BadgeProps {
  text: string;
}

const Badge = ({ text }: BadgeProps) => {
  return <BadgeWrapper>{text}</BadgeWrapper>;
};

export default Badge;

const BadgeWrapper = styled.div`
  display: flex;
  padding: 2px 8px;
  justify-content: center;
  align-items: center;

  border-radius: 50px;
  background: var(--bg-brand);

  color: var(--text-secondary);
  font-size: 10px;
  font-weight: 400;
`;
