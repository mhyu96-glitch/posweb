import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import "./print.css";
import { ThemeProvider } from "./components/theme-provider.tsx";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
    <App />
  </ThemeProvider>
);