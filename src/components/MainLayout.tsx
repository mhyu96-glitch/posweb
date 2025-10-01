import { Outlet } from "react-router-dom";
import { Header } from "@/components/Header";
import { ThemeProvider } from "@/components/theme-provider";

const MainLayout = () => {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </ThemeProvider>
  );
};

export default MainLayout;