import { useTranslation } from 'react-i18next';
import { Instagram, Linkedin, Youtube } from 'lucide-react';

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container">
        <div className="flex flex-col items-center space-y-6">
          <div className="text-3xl font-heading font-bold">
            ⚖️ LAWMATE
          </div>

          <div className="flex gap-6">
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors"
            >
              <Instagram className="h-6 w-6" />
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors"
            >
              <Linkedin className="h-6 w-6" />
            </a>
            <a 
              href="https://youtube.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors"
            >
              <Youtube className="h-6 w-6" />
            </a>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm opacity-90">
              {t('footer.copyright')}
            </p>
            <p className="text-sm opacity-80">
              {t('footer.tagline')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
