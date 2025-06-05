// import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from '../components/Navbar';
import Footer from '../components/Footbar';

// const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  // Choose one of these body themes:
  const bodyTheme = "body-tropical"; // or "body-cyberpunk", "body-earthy", etc.
  
  return (
    <html lang="en">
      <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9631856282418168"
        crossOrigin="anonymous"></script>
      <body className={bodyTheme}>
        <main className="min-h-screen">
            {children}
        </main>
      </body>
    </html>
  );
}