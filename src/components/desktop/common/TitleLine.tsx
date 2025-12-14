import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { MdChevronRight } from "react-icons/md";

interface TitleLineProps {
  title: string;
  link?: string;
}

const TitleLine = ({ title, link }: TitleLineProps) => {
  const navigate = useNavigate();
  return (
    <TitleLineWrapper
      onClick={() => {
        if (!link) return;
        navigate(link);
      }}
    >
      <div className="title">{title}</div>
      {link && <MdChevronRight size={24} style={{ display: "block" }} />}
    </TitleLineWrapper>
  );
};

export default TitleLine;

const TitleLineWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-sizing: border-box;
  gap: 8px;

  width: 100%;
  height: fit-content;

  .title {
    color: #000;
    text-align: center;
    font-size: 18px;
    font-style: normal;
    font-weight: 600;
    line-height: normal;
  }
`;
