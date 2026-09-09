import { RouterProvider } from "react-router-dom";
import { router } from "@/router";
import ToastContainer from "@/components/common/Toast";
import "swiper/swiper-bundle.css";
import "swiper/css/navigation";
import "swiper/css";
import "../fontello/css/fontello.css";

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer />
    </>
  );
}
