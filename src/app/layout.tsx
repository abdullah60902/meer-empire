import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Navbar from "@/components/Navbar/Navbar";
import SlideCart from "@/components/Cart/SlideCart";
import FloatingWhatsApp from "@/components/FloatingWhatsApp/FloatingWhatsApp";
import BackToTop from "@/components/BackToTop/BackToTop";
import Footer from "@/components/Footer/Footer";

export const metadata: Metadata = {
  title: "MEER EMPIRE – Imported Branded Shoes | Premium Quality | Cash On Delivery",
  description:
    "Shop premium imported branded shoes from Nike, Adidas, Puma, New Balance and more at MEER EMPIRE. Premium quality, original designs, comfortable fit. Cash on Delivery available across Pakistan.",
  keywords: "imported branded shoes, premium shoes, Nike, Adidas, Puma, MEER EMPIRE, online shoes Pakistan, cash on delivery shoes",
  openGraph: {
    title: "MEER EMPIRE – Premium Imported Branded Shoes",
    description: "Premium quality imported branded shoes. Original designs. Cash On Delivery available.",
    type: "website",
    locale: "en_PK",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0B2345" />
      </head>
      <body>
        <ThemeProvider>
          <CartProvider>
            <WishlistProvider>
              <Navbar />
              <SlideCart />
              <main className="page-enter">{children}</main>
              <Footer />
              <FloatingWhatsApp />
              <BackToTop />
            </WishlistProvider>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
