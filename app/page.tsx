import Hero from "@/components/lp/Hero";
import Audience from "@/components/lp/Audience";
import Features from "@/components/lp/Features";
import Timeline from "@/components/lp/Timeline";
import Requirements from "@/components/lp/Requirements";
import Faq from "@/components/lp/Faq";
import ApplySection from "@/components/lp/ApplySection";
import Footer from "@/components/lp/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <Audience />
      <Features />
      <Timeline />
      <Requirements />
      <Faq />
      <ApplySection />
      <Footer />
    </main>
  );
}
