import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "leaflet/dist/leaflet.css";
import App from "./App.jsx";
import "./assets/styles/experience.css";
import "./assets/styles/responsive.css";
import ErrorBoundary from "./components/common/ErrorBoundary.jsx";
import { LanguageProvider } from "./context";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ErrorBoundary>
  </StrictMode>,
);
