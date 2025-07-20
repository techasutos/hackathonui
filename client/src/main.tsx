import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // ✅ Add this
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter> {/* ✅ Wrap App */}
    <App />
  </BrowserRouter>
);