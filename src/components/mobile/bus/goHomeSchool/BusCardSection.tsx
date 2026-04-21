import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { DESKTOP_MEDIA } from "@/styles/responsive";
import { getPreferredBusUiRoute } from "@/utils/busUiPreference";
import { mixpanelTrack } from "@/utils/mixpanel";

const BUS_PAGE_TABLET_MEDIA = "(min-width: 760px)";

const BUS_CARDS = [
  {
    src: "/Bus/학교갈래요버튼.webp",
    alt: "학교갈래요버튼",
    type: "go-school",
    featured: true,
  },
  {
    src: "/Bus/집갈래요버튼.webp",
    alt: "집갈래요버튼",
    type: "go-home",
  },
  {
    src: "/Bus/셔틀버스버튼.webp",
    alt: "셔틀버스버튼",
    type: "shuttle",
  },
] as const;

export default function BusCardSection() {
  const navigate = useNavigate();
  const [featuredCard, ...stackCards] = BUS_CARDS;
  const handleCardClick = (type: (typeof BUS_CARDS)[number]["type"]) => {
    mixpanelTrack.busChecked(type, "N/A", "Category Select");
    navigate(getPreferredBusUiRoute(type));
  };

  return (
    <Wrapper>
      <FeatureColumn>
        <CardButton
          type="button"
          onClick={() => handleCardClick(featuredCard.type)}
        >
          <CardImg src={featuredCard.src} alt={featuredCard.alt} $featured />
        </CardButton>
      </FeatureColumn>

      <StackColumn>
        {stackCards.map((card) => (
          <CardButton
            key={card.type}
            type="button"
            onClick={() => handleCardClick(card.type)}
          >
            <CardImg src={card.src} alt={card.alt} />
          </CardButton>
        ))}
      </StackColumn>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;

  @media ${BUS_PAGE_TABLET_MEDIA} {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(260px, 0.86fr);
    gap: 14px;
    align-items: start;
  }

  @media ${DESKTOP_MEDIA} {
    grid-template-columns:
      var(--bus-feature-column, minmax(0, 1.04fr))
      var(--bus-stack-column, minmax(300px, 0.88fr));
    gap: var(--bus-desktop-column-gap, 16px);
    align-items: start;
  }
`;

const FeatureColumn = styled.div`
  width: 100%;
  min-width: 0;
`;

const StackColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  min-width: 0;

  @media ${BUS_PAGE_TABLET_MEDIA} {
    gap: 14px;
  }

  @media ${DESKTOP_MEDIA} {
    gap: var(--bus-desktop-column-gap, 16px);
  }
`;

const CardButton = styled.button`
  display: block;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  padding: 0;
  border: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;
  appearance: none;
  transition: transform 0.2s ease;

  @media ${BUS_PAGE_TABLET_MEDIA} {
    max-width: none;
    margin: 0;
  }

  @media ${DESKTOP_MEDIA} {
    &:hover,
    &:focus-visible {
      transform: translateY(-1px);
    }
  }
`;

const CardImg = styled.img<{ $featured?: boolean }>`
  display: block;
  width: 100%;
  border-radius: 18px;
  box-shadow: 0 12px 28px rgba(20, 35, 67, 0.08);
  transition: box-shadow 0.2s ease;

  @media ${BUS_PAGE_TABLET_MEDIA} {
    border-radius: ${({ $featured }) => ($featured ? "20px" : "16px")};
    box-shadow: 0 10px 22px rgba(20, 35, 67, 0.08);
  }

  @media ${DESKTOP_MEDIA} {
    border-radius: ${({ $featured }) => ($featured ? "22px" : "18px")};
    box-shadow: 0 10px 24px rgba(20, 35, 67, 0.08);

    ${CardButton}:hover &,
    ${CardButton}:focus-visible & {
      box-shadow: 0 14px 28px rgba(20, 35, 67, 0.1);
    }
  }
`;
