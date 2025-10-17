import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Features } from '@/components/Features';
import { Scenarios } from '@/components/Scenarios';
import { FundamentalRights } from '@/components/FundamentalRights';
import { ScenarioInput } from '@/components/ScenarioInput';
import { Chatbot } from '@/components/Chatbot';
import { About } from '@/components/About';
import { Contact } from '@/components/Contact';
import { Footer } from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Features />
      <FundamentalRights />
      <Scenarios />
      <ScenarioInput />
      <Chatbot />
      <About />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
