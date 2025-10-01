import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import "./print.css"; // Impor stylesheet untuk cetak

createRoot(document.getElementById("root")!).render(<App />);