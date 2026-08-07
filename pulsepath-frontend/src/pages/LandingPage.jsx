import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import HowItWorks from "../components/landing/HowItWorks";
import RecoverySection from "../components/landing/RecoverySection";
import CTA from "../components/landing/CTA";
import Footer from "../components/landing/Footer";

function LandingPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <RecoverySection />
      <CTA />
      <Footer />
    </>
  );
}

export default LandingPage;