import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Features } from '@/components/Features';
import { Scenarios } from '@/components/Scenarios';
import { ScenarioInput } from '@/components/ScenarioInput';
import { FundamentalRights } from '@/components/FundamentalRights';
import { DataAnalysis } from '@/components/DataAnalysis';

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
      
      <DataAnalysis />
      <Contact />
      <About />
      <Footer />
    </div>
  );
};

export default Index;
