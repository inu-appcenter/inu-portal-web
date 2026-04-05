import { Fragment, type ReactNode, useMemo } from "react";
import { Copy } from "lucide-react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import styled from "styled-components";

import { ROUTES } from "@/constants/routes";
import { useHeader } from "@/context/HeaderContext";
import {
  PhonebookDetailState,
  loadPhonebookDetailState,
} from "@/pages/mobile/phonebook/phonebookDetailState";
import { normalizeExternalUrl } from "@/pages/mobile/phonebook/phonebookConfig";
import { DESKTOP_MEDIA, MOBILE_PAGE_GUTTER } from "@/styles/responsive";
import { SOFT_CARD_SHADOW, SOFT_PILL_SHADOW } from "@/styles/shadows";
import { CollegeOfficeContact, DirectoryEntry } from "@/types/directory";
import Divider from "@/components/common/Divider";
import Box from "@/components/common/Box";

const URL_SPLIT_PATTERN =
  /((?:https?:\/\/|www\.)[^\s]+|(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s]*)?)/gi;
const URL_MATCH_PATTERN =
  /^((?:https?:\/\/|www\.)[^\s]+|(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s]*)?)$/i;

function splitTrailingPunctuation(value: string) {
  const match = value.match(/^(.*?)([),.!?;:]*)$/);

  if (!match) {
    return { core: value, suffix: "" };
  }

  return {
    core: match[1],
    suffix: match[2] ?? "",
  };
}

function joinDistinctText(
  values: Array<string | null | undefined>,
  separator: string,
) {
  const uniqueValues = values.reduce<string[]>((accumulator, value) => {
    const trimmedValue = value?.trim();

    if (!trimmedValue || accumulator.includes(trimmedValue)) {
      return accumulator;
    }

    accumulator.push(trimmedValue);
    return accumulator;
  }, []);

  return uniqueValues.join(separator);
}

const LinkedMultilineText = ({ text }: { text: string }) => {
  const parts = text.split(URL_SPLIT_PATTERN);

  return (
    <RichTextValue>
      {parts.map((part, index) => {
        if (!part) {
          return null;
        }

        const { core, suffix } = splitTrailingPunctuation(part);
        const isUrlLike = URL_MATCH_PATTERN.test(core) && !core.includes("@");

        if (!isUrlLike) {
          return <Fragment key={`${part}-${index}`}>{part}</Fragment>;
        }

        return (
          <Fragment key={`${core}-${index}`}>
            <a
              href={normalizeExternalUrl(core)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {core}
            </a>
            {suffix}
          </Fragment>
        );
      })}
    </RichTextValue>
  );
};

async function copyText(value: string) {
  if (!value) {
    return;
  }

  try {
    await navigator.clipboard.writeText(value);
    return;
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }
}

interface DetailFieldProps {
  label: string;
  value?: string | null;
  valueNode?: ReactNode;
  copyValue?: string | null;
  href?: string;
  external?: boolean;
}

const DetailField = ({
  label,
  value,
  valueNode,
  copyValue,
  href,
  external = false,
}: DetailFieldProps) => {
  const content = valueNode ? (
    <FieldValue as="div">{valueNode}</FieldValue>
  ) : href && value ? (
    <FieldLink
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
    >
      {value}
    </FieldLink>
  ) : (
    <FieldValue>{value}</FieldValue>
  );

  return (
    <DetailRow>
      <FieldContent>
        <FieldLabel>{label}</FieldLabel>
        {content}
      </FieldContent>

      {copyValue ? (
        <CopyIconButton
          type="button"
          aria-label={`${label} 복사`}
          onClick={() => void copyText(copyValue)}
        >
          <Copy size={14} />
        </CopyIconButton>
      ) : null}
    </DetailRow>
  );
};

function PersonDetailContent({ entry }: { entry: DirectoryEntry }) {
  const siteUrl = entry.profileUrl?.trim() ?? "";

  const fields = [
    entry.phoneNumber && (
      <DetailField
        key="phone"
        label="전화번호"
        value={entry.phoneNumber}
        copyValue={entry.phoneNumber}
        href={`tel:${entry.phoneNumber}`}
      />
    ),
    entry.email && (
      <DetailField
        key="email"
        label="이메일"
        value={entry.email}
        copyValue={entry.email}
        href={`mailto:${entry.email}`}
      />
    ),
    siteUrl && (
      <DetailField
        key="site"
        label="사이트"
        value={siteUrl}
        copyValue={siteUrl}
        href={normalizeExternalUrl(siteUrl)}
        external
      />
    ),
    entry.duties && (
      <DetailField
        key="duties"
        label="담당업무"
        valueNode={<LinkedMultilineText text={entry.duties} />}
      />
    ),
  ].filter(Boolean);

  // 디버깅 로그: 필드 배열 상태 확인
  console.log("Person Fields:", fields);
  console.log("Person Fields Length:", fields.length);

  return (
    <>
      {fields.map((field, index) => {
        const isLast = index === fields.length - 1;
        // 디버깅 로그: 루프 인덱스 및 마지막 여부 확인
        console.log(`Person Field Index: ${index}, Is Last: ${isLast}`);

        return (
          <Fragment key={index}>
            {field}
            {!isLast && <Divider />}
          </Fragment>
        );
      })}
    </>
  );
}

function OfficeDetailContent({ entry }: { entry: CollegeOfficeContact }) {
  const siteUrl = entry.homepageUrl?.trim() || entry.sourceUrl?.trim() || "";

  const fields = [
    entry.officePhoneNumber && (
      <DetailField
        key="officePhone"
        label="전화번호"
        value={entry.officePhoneNumber}
        copyValue={entry.officePhoneNumber}
        href={`tel:${entry.officePhoneNumber}`}
      />
    ),
    entry.officeLocation && (
      <DetailField
        key="location"
        label="위치"
        value={entry.officeLocation}
        copyValue={entry.officeLocation}
      />
    ),
    siteUrl && (
      <DetailField
        key="site"
        label="사이트"
        value={siteUrl}
        copyValue={siteUrl}
        href={normalizeExternalUrl(siteUrl)}
        external
      />
    ),
  ].filter(Boolean);

  return (
    <>
      {fields.map((field, index) => {
        const isLast = index === fields.length - 1;
        // 디버깅 로그: 루프 인덱스 및 마지막 여부 확인
        console.log(`Office Field Index: ${index}, Is Last: ${isLast}`);

        return (
          <Fragment key={index}>
            {field}
            {!isLast && <Divider />}
          </Fragment>
        );
      })}
    </>
  );
}

const MobilePhoneBookDetailPage = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const kind = searchParams.get("kind") === "office" ? "office" : "person";
  const id = Number(searchParams.get("id"));
  const navigationState =
    (location.state as PhonebookDetailState | null) ?? null;

  const detailState = useMemo(() => {
    if (
      navigationState &&
      navigationState.kind === kind &&
      navigationState.entry.id === id
    ) {
      return navigationState;
    }

    return loadPhonebookDetailState(kind, id);
  }, [id, kind, navigationState]);

  useHeader({
    title: "상세 정보",
    hasback: true,
  });

  if (!detailState) {
    return (
      <PageWrapper>
        <ContentColumn>
          <EmptyStateCard>
            <h2>상세 정보를 찾을 수 없어요.</h2>
            <p>검색 결과에서 카드를 다시 선택해 주세요.</p>
            <EmptyActionLink to={ROUTES.PHONEBOOK.SEARCH}>
              검색 결과로 이동
            </EmptyActionLink>
          </EmptyStateCard>
        </ContentColumn>
      </PageWrapper>
    );
  }

  const personEntry = detailState.kind === "person" ? detailState.entry : null;
  const officeEntry = detailState.kind === "office" ? detailState.entry : null;
  const actionUrl = personEntry
    ? personEntry.profileUrl?.trim() || ""
    : officeEntry?.homepageUrl?.trim() || officeEntry?.sourceUrl?.trim() || "";
  const actionLabel =
    personEntry || officeEntry?.homepageUrl
      ? "홈페이지에서 보기"
      : "사이트에서 보기";

  const title = personEntry
    ? personEntry.name?.trim() ||
      personEntry.position ||
      personEntry.detailAffiliation ||
      personEntry.affiliation
    : officeEntry?.departmentName || "";

  const badgeLabel = personEntry
    ? personEntry.position || personEntry.categoryName
    : officeEntry?.collegeName || "";

  const subtitle = personEntry
    ? joinDistinctText(
        [personEntry.affiliation, personEntry.detailAffiliation],
        " ",
      )
    : officeEntry?.officeLocation || officeEntry?.collegeLocationSummary || "";

  return (
    <PageWrapper>
      <ContentColumn>
        <Box>
          <HeroHeader>
            <HeroTitleBlock>
              <HeroTitle>{title}</HeroTitle>
              {subtitle && <HeroSubtitle>{subtitle}</HeroSubtitle>}
            </HeroTitleBlock>

            {badgeLabel && <HeroBadge>{badgeLabel}</HeroBadge>}
          </HeroHeader>
        </Box>

        <Box>
          {personEntry ? (
            <PersonDetailContent entry={personEntry} />
          ) : (
            officeEntry && <OfficeDetailContent entry={officeEntry} />
          )}
        </Box>

        {actionUrl && (
          <ActionButton
            href={normalizeExternalUrl(actionUrl)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {actionLabel}
          </ActionButton>
        )}
      </ContentColumn>
    </PageWrapper>
  );
};

export default MobilePhoneBookDetailPage;

const PageWrapper = styled.div`
  width: 100%;
  min-height: calc(100dvh - 56px);
  padding: 12px ${MOBILE_PAGE_GUTTER} 36px;
  box-sizing: border-box;

  @media ${DESKTOP_MEDIA} {
    padding: 16px 0 40px;
  }
`;

const ContentColumn = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media ${DESKTOP_MEDIA} {
    width: min(100%, 520px);
    margin: 0 auto;
  }
`;

const HeroHeader = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
`;

const HeroTitleBlock = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const HeroTitle = styled.h1`
  margin: 0;
  color: #2456ad;
  font-size: 28px;
  font-weight: 800;
  line-height: 1.2;
  word-break: keep-all;
`;

const HeroSubtitle = styled.p`
  margin: 0;
  color: #1f2937;
  font-size: 15px;
  line-height: 1.45;
  word-break: keep-all;
`;

const HeroBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  min-height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(94, 146, 240, 0.14);
  color: #4a74c9;
  font-size: 12px;
  font-weight: 700;
`;

const DetailRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
`;

const FieldContent = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
`;

const FieldLabel = styled.span`
  color: #8a94a6;
  font-size: 13px;
  font-weight: 700;
`;

const FieldValue = styled.p`
  margin: 0;
  color: #111827;
  font-size: 15px;
  line-height: 1.5;
  word-break: break-word;
  white-space: pre-wrap;
`;

const FieldLink = styled.a`
  color: #111827;
  text-decoration: none;
  font-size: 15px;
  line-height: 1.5;
  word-break: break-word;
`;

const RichTextValue = styled.div`
  color: #111827;
  font-size: 15px;
  line-height: 1.5;
  word-break: break-word;
  white-space: pre-wrap;

  a {
    color: #2f5fb3;
    text-decoration: none;
  }
`;

const CopyIconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 999px;
  padding: 0;
  background: #f6f8fc;
  color: #2f5fb3;
  cursor: pointer;
  flex-shrink: 0;
  align-self: center;
`;

const ActionButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  align-self: center;
  min-width: 176px;
  border-radius: 999px;
  padding: 13px 22px;
  background: linear-gradient(180deg, #6f9ffc 0%, #4d7ee2 100%);
  color: #fff;
  text-decoration: none;
  font-size: 15px;
  font-weight: 700;
  box-shadow: ${SOFT_PILL_SHADOW};
`;

const EmptyStateCard = styled.section`
  border-radius: 24px;
  padding: 24px 20px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: ${SOFT_CARD_SHADOW};
  text-align: center;

  h2 {
    margin: 0 0 8px;
    font-size: 20px;
    color: #1f2937;
  }

  p {
    margin: 0;
    color: #667085;
    font-size: 14px;
    line-height: 1.5;
  }
`;

const EmptyActionLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 18px;
  border-radius: 999px;
  padding: 12px 18px;
  background: #eef4ff;
  color: #2f5fb3;
  text-decoration: none;
  font-size: 14px;
  font-weight: 700;
`;
