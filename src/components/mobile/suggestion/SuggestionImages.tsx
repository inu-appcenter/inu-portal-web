import { useEffect, useState } from "react";
import styled from "styled-components";
import { getSuggestionImage } from "@/apis/suggestions";

// 이미지는 인증이 필요한 바이너리라 blob으로 받아 object URL로 보여 준다.
// 언마운트(또는 글이 바뀔 때) URL을 revoke한다.
function useSuggestionImageUrl(suggestionId: number, n: number) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;
    getSuggestionImage(suggestionId, n)
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [suggestionId, n]);

  return { url, failed };
}

function SuggestionImage({ id, n }: { id: number; n: number }) {
  const { url, failed } = useSuggestionImageUrl(id, n);
  return (
    <Thumb>
      {url && <img src={url} alt={`첨부 사진 ${n}`} />}
      {failed && <Failed>불러오지 못했어요</Failed>}
    </Thumb>
  );
}

export default function SuggestionImages({
  suggestionId,
  count,
}: {
  suggestionId: number;
  count: number;
}) {
  if (count <= 0) return null;
  return (
    <Row>
      {Array.from({ length: count }, (_, i) => (
        <SuggestionImage key={`${suggestionId}-${i + 1}`} id={suggestionId} n={i + 1} />
      ))}
    </Row>
  );
}

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Thumb = styled.div`
  width: 112px;
  height: 112px;
  border-radius: 12px;
  border: 1px solid var(--border-default);
  background: var(--bg-muted);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Failed = styled.span`
  font-size: 12px;
  line-height: 16px;
  color: var(--text-tertiary);
  text-align: center;
`;
