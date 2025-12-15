import { RouterProvider } from "react-router-dom";
import { router } from "@/router";
import "swiper/swiper-bundle.css";
import "swiper/css/navigation";
import "swiper/css";

export default function App() {
  return <RouterProvider router={router} />;
}
