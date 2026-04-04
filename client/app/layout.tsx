import NavbarWrapper from "@/components/NavbarWrapper";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ErrorBoundary from "@/components/ErrorBoundary";
import Toast from "@/components/Toast";
import ScrollToTop from "@/components/ScrollToTop";

export const metadata = {
  title: "TurNext — Shop",
  description: "Modern e-commerce. Browse, wishlist, and buy.",
  openGraph: {
    title: "TurNext",
    description: "Modern e-commerce. Browse, wishlist, and buy.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <ScrollToTop />
        <NavbarWrapper />
        {children}
         <Toast />
        </ErrorBoundary>
      </body>
    </html>
  );
}

