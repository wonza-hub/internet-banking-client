import ReactDOM from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./router.jsx";
import { GlobalStyle } from "./styles/global-style.js";

ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
  <>
    <GlobalStyle />
    <RouterProvider router={router} />
  </>
  // </React.StrictMode>
);
