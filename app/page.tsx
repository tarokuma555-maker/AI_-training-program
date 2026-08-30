import Header from "@/components/lp/Header";
import Hero from "@/components/lp/Hero";
import ForWhom from "@/components/lp/ForWhom";
import Features from "@/components/lp/Features";
import MidCta from "@/components/lp/MidCta";
import Timeline from "@/components/lp/Timeline";
import Requirements from "@/components/lp/Requirements";
import Faq from "@/components/lp/Faq";
import ApplySection from "@/components/lp/ApplySection";
import Footer from "@/components/lp/Footer";
import StickyCta from "@/components/lp/StickyCta";

export default function HomePage() {
  return (
    <main>
      <Header />
      <Hero />
      <ForWhom />
      <Features />
      <MidCta />
      <Timeline />
      <Requirements />
      <Faq />
      <ApplySection />
      <Footer />
      <StickyCta />
    </main>
  );
}
