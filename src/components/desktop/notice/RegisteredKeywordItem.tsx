import styled from "styled-components";
import { FiTrash2 } from "react-icons/fi";

interface RegisteredKeywordItemProps {
  keyword: string;
  isExcluded?: boolean;
  onDelete: () => void;
}

const RegisteredKeywordItem = ({
  keyword,
  isExcluded = false,
  onDelete,
}: RegisteredKeywordItemProps) => {
  return (
    <RegisteredKeywordItemWrapper>
      <KeywordRow>
        {isExcluded && <ExcludeBadge>제외</ExcludeBadge>}
        <span className="keyword" style={{ color: isExcluded ? "#b91c1c" : "#444" }}>
          {keyword}
        </span>
      </KeywordRow>
      <FiTrash2
        size={18}
        onClick={onDelete}
        color={"#888"}
        style={{ cursor: "pointer", flexShrink: 0 }}
      />
    </RegisteredKeywordItemWrapper>
  );
};

export default RegisteredKeywordItem;

const RegisteredKeywordItemWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
`;

const KeywordRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  min-width: 0;

  .keyword {
    font-size: 15px;
    font-weight: 500;
    line-height: 20px;
    word-break: break-all;
  }
`;

const ExcludeBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 7px;
  background-color: #fee2e2;
  color: #dc2626;
  border: 1px solid #fca5a5;
  border-radius: 9999px;
  font-size: 11.5px;
  font-weight: 700;
  line-height: 1;
  flex-shrink: 0;
`;
