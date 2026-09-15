import { useEffect, useState } from "react";
import styled from "styled-components";
import { useHeader } from "@/context/HeaderContext";
import useUserStore from "@/stores/useUserStore";
import { ROUTES } from "@/constants/routes";
import {
  MOBILE_PAGE_GUTTER,
  DESKTOP_MEDIA,
  DESKTOP_CONTENT_MAX_WIDTH,
} from "@/styles/responsive";

import NoticeTabWidget from "@/containers/mobile/home/NoticeTabWidget";
import CommunityWidget from "@/components/mobile/community/CommunityWidget";
import SwipeMenuWidget from "@/containers/mobile/home/SwipeMenuWidget";
import SwipeBusWidget from "@/containers/mobile/home/SwipeBusWidget";
import TodayTimetableWidget from "@/components/mobile/home/TodayTimetableWidget";
import HomeChipGroup from "@/components/mobile/home/HomeChipGroup";
import Calendar from "@/components/mobile/calendar/Calendar";
import YoutubeWidget from "@/components/mobile/home/YoutubeWidget";
import TitleContentArea from "@/components/desktop/common/TitleContentArea";
import Icon from "@/components/common/Icon";
import type { FontelloIconName } from "@/components/common/fontelloIcons";
import Banner from "@/containers/mobile/home/Banner";

const CHANNEL_ID = "UCqOO8FqoVW6Y87jLnqhdflA";

const POLICY_LINKS = [
  { label: "이용약관", href: "/terms-of-use.html" },
  { label: "개인정보 처리 방침", href: "/privacy-policy.html" },
  { label: "커뮤니티 이용 규칙", href: "/community-guideline.html" },
  { label: "청소년 보호 정책", href: "/youth-protection.html" },
  {
    label: "문의하기",
    href: "https://docs.google.com/forms/d/e/1FAIpQLSc1DAOC2N_HVzsMa6JMoSOqckpkX39SkHbrZD_eKTtr2cfKqA/viewform",
  },
] as const;

// Fontello 글리프는 정사각 em 박스라 피그마 원본의 아이콘별 미세한
// 가로/세로 차이(22 x 21.1667 등)는 20px 정사각으로 통일된다.
const SOCIAL_LINKS = [
  {
    label: "카카오톡 채널",
    href: "https://pf.kakao.com/_xgxaSLd",
    icon: "kakaotalk",
  },
  {
    label: "인스타그램",
    href: "https://www.instagram.com/inuappcenter",
    icon: "instagram-line",
  },
  {
    label: "GitHub",
    href: "https://github.com/inu-appcenter",
    icon: "github-invertocat-black-1",
  },
  {
    label: "이메일 문의",
    href: "mailto:support@inuappcenter.kr",
    icon: "mail",
  },
] as const satisfies readonly {
  label: string;
  href: string;
  icon: FontelloIconName;
}[];

export default function MobileHomePageV2() {
  const { userInfo } = useUserStore();
  const [isDesktopLayout, setIsDesktopLayout] = useState(false);
  const [activeNoticeTab, setActiveNoticeTab] = useState<"school" | "dept">(
    "school",
  );

  useHeader({
    showAlarm: true,
  });

  useEffect(() => {
    const handleResize = () => {
      setIsDesktopLayout(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <V2Wrapper>
      <UpperSection>
        <SectionInner>
          <TodayTimetableWidget />

          <GridWidgets>
            <SwipeBusWidget />

            <SwipeMenuWidget />
          </GridWidgets>
        </SectionInner>
      </UpperSection>

      <LowerSheetSection>
        <SectionInner>
          <ContentContainer>
            <HomeChipGroup />
          </ContentContainer>

          <FeedLayout>
            {isDesktopLayout ? (
              <DesktopWidgetColumns>
                <DesktopWidgetColumn>
                  <TitleContentArea
                    title="커뮤니티"
                    children={<CommunityWidget />}
                    link={ROUTES.BOARD.TIPS}
                  />
                  <Banner />
                  <TitleContentArea
                    title="공지사항"
                    children={
                      <NoticeTabWidget
                        activeTab={activeNoticeTab}
                        setActiveTab={setActiveNoticeTab}
                      />
                    }
                    link={
                      activeNoticeTab === "school"
                        ? ROUTES.BOARD.NOTICE
                        : userInfo?.department
                          ? ROUTES.BOARD.DEPT_NOTICE_DETAIL(userInfo.department)
                          : ROUTES.BOARD.DEPT_NOTICE
                    }
                  />
                </DesktopWidgetColumn>
                <DesktopWidgetColumn>
                  <TitleContentArea
                    title="학사일정"
                    children={<Calendar mode="weekly" />}
                    link={ROUTES.BOARD.CALENDAR}
                  />
                  <TitleContentArea
                    title="인천대학교 YouTube"
                    externalLink={`https://www.youtube.com/channel/${CHANNEL_ID}`}
                  >
                    <YoutubeWidget />
                  </TitleContentArea>
                </DesktopWidgetColumn>
              </DesktopWidgetColumns>
            ) : (
              <>
                <TitleContentArea
                  title="커뮤니티"
                  children={<CommunityWidget />}
                  link={ROUTES.BOARD.TIPS}
                />
                <Banner />
                <TitleContentArea
                  title="공지사항"
                  children={
                    <NoticeTabWidget
                      activeTab={activeNoticeTab}
                      setActiveTab={setActiveNoticeTab}
                    />
                  }
                  link={
                    activeNoticeTab === "school"
                      ? ROUTES.BOARD.NOTICE
                      : userInfo?.department
                        ? ROUTES.BOARD.DEPT_NOTICE_DETAIL(userInfo.department)
                        : ROUTES.BOARD.DEPT_NOTICE
                  }
                />
                <TitleContentArea
                  title="학사일정"
                  children={<Calendar mode="weekly" />}
                  link={ROUTES.BOARD.CALENDAR}
                />
                <TitleContentArea
                  title="인천대학교 YouTube"
                  externalLink={`https://www.youtube.com/channel/${CHANNEL_ID}`}
                >
                  <YoutubeWidget />
                </TitleContentArea>
              </>
            )}
          </FeedLayout>
        </SectionInner>
      </LowerSheetSection>

      <FooterSection>
        <FooterInner>
          <FooterMain>
            <BrandHeader
              href="https://home.inuappcenter.kr"
              target="_blank"
              rel="noopener noreferrer"
            >
              <BrandLogo
                src="/images/logo_text_icon_combination.svg"
                alt="INTIP"
                width={180}
                height={56}
                loading="lazy"
              />
            </BrandHeader>

            <PolicyLinks>
              {POLICY_LINKS.map(({ label, href }) => (
                <PolicyLink
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {label}
                </PolicyLink>
              ))}
            </PolicyLinks>
          </FooterMain>

          <OrgContainer>
            <OrgHeader>
              <AppcenterMark
                src="/images/AppCenter_Logo.svg"
                alt=""
                width={12}
                height={16}
                loading="lazy"
              />
              <OrgName>인천대학교 IT Innovation LAB</OrgName>
            </OrgHeader>

            <OrgAddress>
              인천광역시 아카데미로 119, 4호관 정보전산원(BM컨텐츠관) 107호
            </OrgAddress>

            <SocialLinks>
              {SOCIAL_LINKS.map(({ label, href, icon }) => (
                <SocialLink
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                >
                  <SocialIcon name={icon} size={20} />
                </SocialLink>
              ))}
            </SocialLinks>
          </OrgContainer>

          <FooterNote>
            <span>© {new Date().getFullYear()} INTIP. All rights reserved.</span>
            <span>본 서비스는 인천대학교 공식 서비스가 아닙니다.</span>
          </FooterNote>

          <BottomScrollSpacer />
        </FooterInner>
      </FooterSection>
    </V2Wrapper>
  );
}

const V2Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  background-color: #eff5fc;
  min-height: 100vh;
`;

const UpperSection = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: calc(var(--header-height, 56px) + 8px);
  padding-bottom: 24px;
  background: #eff5fc;
`;

const GridWidgets = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 12px;
`;

const LowerSheetSection = styled.div`
  background-color: #ffffff;
  border-top-left-radius: 32px;
  border-top-right-radius: 32px;
  //margin-top: -24px;
  position: relative;
  z-index: 5;
  box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.02);
  padding-top: 12px;
  padding-bottom: 40px;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 16px;
`;

const FeedLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  width: 100%;
`;

const DesktopWidgetColumns = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
  gap: 24px;
  align-items: start;
  width: 100%;
`;

const DesktopWidgetColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 0;
`;

const SectionInner = styled.div`
  width: 100%;
  max-width: ${DESKTOP_CONTENT_MAX_WIDTH};
  margin: 0 auto;
  box-sizing: border-box;
  padding-left: ${MOBILE_PAGE_GUTTER};
  padding-right: ${MOBILE_PAGE_GUTTER};

  @media ${DESKTOP_MEDIA} {
    padding-left: clamp(24px, 4vw, 48px);
    padding-right: clamp(24px, 4vw, 48px);
  }
`;

const FooterSection = styled.footer`
  background: var(--gray-50, #f8f9fb);
  width: 100%;
  box-sizing: border-box;
`;

const FooterInner = styled(SectionInner)`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 40px;
  padding-top: 32px;
  padding-bottom: 32px;
`;

const FooterMain = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 32px;
  width: 100%;
`;

const BrandHeader = styled.a`
  display: inline-flex;
  align-items: center;
  text-decoration: none;
`;

const BrandLogo = styled.img`
  display: block;
  width: 180px;
  height: 56px;
`;

const PolicyLinks = styled.nav`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4px;
  width: 100%;
`;

const PolicyLink = styled.a`
  display: flex;
  align-items: center;
  height: 24px;
  color: var(--text-secondary, #333d4b);
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  text-decoration: none;
  word-break: keep-all;

  &:hover {
    color: var(--text-brand, #0061ff);
  }
`;

const OrgContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
`;

const OrgHeader = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 4px;
`;

const AppcenterMark = styled.img`
  display: block;
  width: 12px;
  height: 16px;
`;

const OrgName = styled.span`
  color: var(--text-secondary, #333d4b);
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
`;

const OrgAddress = styled.p`
  margin: 0;
  color: var(--text-secondary, #333d4b);
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  word-break: keep-all;
`;

const SocialLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
`;

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: 1px solid var(--border-default, #e5e8eb);
  background: var(--bg-base, #ffffff);

  &:hover {
    background: var(--gray-100, #f1f3f5);
  }
`;

const SocialIcon = styled(Icon)`
  color: #8b95a1;
`;

const FooterNote = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  color: var(--text-tertiary, #8b95a1);
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
`;

const BottomScrollSpacer = styled.div`
  width: 100%;
  height: calc(var(--nav-height, 0px) + 48px);
`;
