import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import Footer from "@/components/Footer";

import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedProducts />
      <Footer />
    </>
  );
}