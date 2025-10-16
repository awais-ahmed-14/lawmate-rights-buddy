import { useTranslation } from 'react-i18next';
import { Scale } from 'lucide-react';

export const About = () => {
  const { t } = useTranslation();

  return (
    <section id="about" className="py-20">
      <div className="container max-w-4xl">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-hero flex items-center justify-center shadow-glow">
              <Scale className="h-10 w-10 text-white" />
            </div>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-heading font-bold">
            {t('about.title')}
          </h2>
          
          <p className="text-xl text-muted-foreground leading-relaxed">
            {t('about.description')}
          </p>

          <p className="text-lg font-medium text-primary">
            {t('about.subtitle')}
          </p>
        </div>
      </div>
    </section>
  );
};
