import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Globe, Menu, X } from 'lucide-react';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिंदी' },
  { code: 'te', name: 'తెలుగు' },
  { code: 'ta', name: 'தமிழ்' },
  { code: 'bn', name: 'বাংলা' },
];

export const Header = () => {
  const { t, i18n } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-heading font-bold text-primary">
            {t('header.logo')}
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <button
            onClick={() => scrollToSection('home')}
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            {t('header.nav.home')}
          </button>
          <button
            onClick={() => scrollToSection('rights')}
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            {t('header.nav.rights')}
          </button>
          <button
            onClick={() => scrollToSection('scenarios')}
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            {t('header.nav.scenarios')}
          </button>
          <button
            onClick={() => scrollToSection('chatbot')}
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            {t('header.nav.chatbot')}
          </button>
          <button
            onClick={() => scrollToSection('about')}
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            {t('header.nav.about')}
          </button>
          <button
            onClick={() => scrollToSection('contact')}
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            {t('header.nav.contact')}
          </button>
        </nav>

        <div className="flex items-center gap-4">
          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">{languages.find(l => l.code === i18n.language)?.name || 'English'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={i18n.language === lang.code ? 'bg-accent' : ''}
                >
                  {lang.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t md:hidden">
          <nav className="container flex flex-col gap-4 py-4">
            <button
              onClick={() => scrollToSection('home')}
              className="text-sm font-medium text-left transition-colors hover:text-primary"
            >
              {t('header.nav.home')}
            </button>
            <button
              onClick={() => scrollToSection('rights')}
              className="text-sm font-medium text-left transition-colors hover:text-primary"
            >
              {t('header.nav.rights')}
            </button>
            <button
              onClick={() => scrollToSection('scenarios')}
              className="text-sm font-medium text-left transition-colors hover:text-primary"
            >
              {t('header.nav.scenarios')}
            </button>
            <button
              onClick={() => scrollToSection('chatbot')}
              className="text-sm font-medium text-left transition-colors hover:text-primary"
            >
              {t('header.nav.chatbot')}
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="text-sm font-medium text-left transition-colors hover:text-primary"
            >
              {t('header.nav.about')}
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="text-sm font-medium text-left transition-colors hover:text-primary"
            >
              {t('header.nav.contact')}
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};
