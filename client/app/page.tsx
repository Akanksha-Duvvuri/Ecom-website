import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import Footer from "@/components/Footer";
import Categories from "@/components/Categories";
import BrandStory from "@/components/BrandStory";
import PhotoGrid from "@/components/PhotoGrid";

import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Home() {
  return (
    <>
      <Hero />
      <Categories />
      <FeaturedProducts />
      <BrandStory />
      <PhotoGrid />
      <Footer />
    </>
  );
}