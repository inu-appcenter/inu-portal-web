import styled from "styled-components";
import { useNavigate } from "react-router-dom";

interface TitleLineProps {
  title: string | React.ReactNode;
  link?: string;
  externalLink?: string;
}

const TitleLine = ({ title, link, externalLink }: TitleLineProps) => {
  const navigate = useNavigate();
  const hasMoreLink = Boolean(link || externalLink);

  return (
    <TitleLineWrapper
      $clickable={hasMoreLink}
      onClick={() => {
        if (link) {
          navigate(link);
        } else if (externalLink) {
          window.open(externalLink, "_blank");
        }
      }}
    >
      <div className="title">{title}</div>
      {hasMoreLink && (
        <MoreIcon
          aria-hidden="true"
          viewBox="0 0 9 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1.1 1.2L7.9 9L1.1 16.8"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </MoreIcon>
      )}
    </TitleLineWrapper>
  );
};

export default TitleLine;

const TitleLineWrapper = styled.div<{ $clickable: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-sizing: border-box;
  gap: 8px;
  cursor: ${({ $clickable }) => ($clickable ? "pointer" : "default")};

  width: 100%;
  height: fit-content;

  .title {
    color: #000;
    //text-align: center;
    font-size: 18px;
    font-style: normal;
    font-weight: 600;
    line-height: normal;

    width: 100%;
  }
`;

const MoreIcon = styled.svg`
  flex: 0 0 auto;
  width: 8px;
  height: 16px;
  color: #000;
  display: block;
`;
