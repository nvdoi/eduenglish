import "./globals.css";
import { Inter } from "next/font/google";
import { ReactNode } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { AuthProvider } from "./contexts/AuthContext";
import ToastProvider from "./components/ToastProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "English AI - Học tiếng Anh thông minh cùng AI",
  description: "Ứng dụng học tiếng Anh với trí tuệ nhân tạo. Luyện tập với AI chatbot, sửa ngữ pháp và gợi ý từ vựng thông minh.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body className={`${inter.className} bg-white text-gray-900 antialiased`}>
        <AuthProvider>
          <ToastProvider />
          <Navbar />
          <main>{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
