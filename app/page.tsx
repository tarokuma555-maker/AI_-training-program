import Hero from "@/components/lp/Hero";
import ForWhom from "@/components/lp/ForWhom";
import Features from "@/components/lp/Features";
import Timeline from "@/components/lp/Timeline";
import Requirements from "@/components/lp/Requirements";
import Faq from "@/components/lp/Faq";
import ApplySection from "@/components/lp/ApplySection";
import Footer from "@/components/lp/Footer";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <ForWhom />
      <Features />
      <Timeline />
      <Requirements />
      <Faq />
      <ApplySection />
      <Footer />
    </main>
  );
}
