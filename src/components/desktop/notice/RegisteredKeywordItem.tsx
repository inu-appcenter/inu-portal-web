import styled from "styled-components";
import { FiTrash2 } from "react-icons/fi";

interface RegisteredKeywordItemProps {
  keyword: string;
  onDelete: () => void;
}

const RegisteredKeywordItem = ({
  keyword,
  onDelete,
}: RegisteredKeywordItemProps) => {
  return (
    <RegisteredKeywordItemWrapper>
      <div className="keyword">{keyword}</div>{" "}
      <FiTrash2 size={20} onClick={onDelete} />
    </RegisteredKeywordItemWrapper>
  );
};

export default RegisteredKeywordItem;

const RegisteredKeywordItemWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  border-bottom: 1px solid #e2e2e2;
  padding: 16px 0;

  .keyword {
    color: #444;
    font-feature-settings:
      "liga" off,
      "clig" off;
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: 20px; /* 125% */
  }
`;
