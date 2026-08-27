import Nav from "/src/components/marketing/Nav";
import Hero from "/src/components/marketing/Hero";
import FeaturesGrid from "/src/components/marketing/FeaturesGrid";
import HowItWorks from "/src/components/marketing/HowItWorks";
import LearningModels from "/src/components/marketing/LearningModels";
import RoleCallouts from "/src/components/marketing/RoleCallouts";
import Footer from "/src/components/marketing/Footer";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <Nav />
      <main className="flex-1 pt-[80px]">
        <Hero />
        <FeaturesGrid />
        <HowItWorks />
        <LearningModels />
        <RoleCallouts />
      </main>
      <Footer />
    </div>
  );
}
