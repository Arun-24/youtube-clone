import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "sonner";
import { UserProvider } from "@/lib/AuthContext";
import { ThemeProvider } from "@/lib/ThemeContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <ThemeProvider>
        <div className="min-h-screen">
          <Header />
          <Toaster />
          <div className="flex">
            <Sidebar />
            <Component {...pageProps} />
          </div>
        </div>
      </ThemeProvider>
    </UserProvider>
  );
}
