import Categories from "@/components/desktop/posts/Categories";

import RentalTitle from "@/components/mobile/util/rental/RentalTitle.tsx";
import styled from "styled-components";

import { ThemeProvider } from "styled-components";

const theme = {
  colors: {
    primary: "#007bff",
    secondary: "#f5f5f5",
    text: "#333",
    background: "#ffffff",
    border: "#ddd",
  },
};

import Rental from "../../components/desktop/rental/Rental.tsx";

export default function RentalPage() {
  return (
    <PostsPageWrapper>
      <Categories />
      <ContentsWrapper>
        <RentalTitle />
        <ThemeProvider theme={theme}>
          <Rental isOpen={false} />
        </ThemeProvider>
      </ContentsWrapper>
    </PostsPageWrapper>
  );
}

//styled components

const PostsPageWrapper = styled.div`
  padding: 0 32px;
  display: flex;
  gap: 16px;
  position: relative;
`;

const ContentsWrapper = styled.div`
  flex: 1;

  display: flex;
  flex-direction: column;
`;
