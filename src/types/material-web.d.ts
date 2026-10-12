import React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "md-fab": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          variant?: "surface" | "primary" | "secondary" | "tertiary";
          label?: string;
          lowered?: boolean;
          size?: "medium" | "small" | "large";
        },
        HTMLElement
      >;
    }
  }
}
