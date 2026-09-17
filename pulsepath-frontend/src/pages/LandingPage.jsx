// Composes the public marketing sections shown before authentication.
import Navbar from "../components/Landing/Navbar";
import Hero from "../components/Landing/Hero";
import Features from "../components/Landing/Features";
import HowItWorks from "../components/Landing/HowItWorks";
import RecoverySection from "../components/Landing/RecoverySection";
import CTA from "../components/Landing/CTA";
import Footer from "../components/Landing/Footer";

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