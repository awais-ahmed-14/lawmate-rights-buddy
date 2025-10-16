import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowRight, MessageSquare } from 'lucide-react';
import heroBackground from '@/assets/hero-bg.jpg';

export const Hero = () => {
  const { t } = useTranslation();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      id="home"
      className="relative min-h-[600px] flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(30, 58, 138, 0.9), rgba(30, 58, 138, 0.85)), url(${heroBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="container relative z-10 py-20 md:py-32">
        <div className="mx-auto max-w-3xl text-center space-y-8 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-white leading-tight">
            {t('hero.title')}
            <br />
            <span className="gradient-text text-accent">{t('hero.subtitle')}</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
            {t('hero.description')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              size="lg"
              onClick={() => scrollToSection('rights')}
              className="bg-accent hover:bg-accent-glow text-primary font-semibold shadow-glow"
            >
              {t('hero.cta.primary')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => scrollToSection('chatbot')}
              className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur"
            >
              <MessageSquare className="mr-2 h-5 w-5" />
              {t('hero.cta.secondary')}
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background pointer-events-none" />
    </section>
  );
};
