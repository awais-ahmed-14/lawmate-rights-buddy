import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Globe, Menu, X, BarChart3, Bot, Shield, LogOut, MapPin } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
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
  { code: 'ur', name: 'اردو' },
];

export const Header = () => {
  const { t, i18n } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) { element.scrollIntoView({ behavior: 'smooth' }); setMobileMenuOpen(false); }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-heading font-bold text-primary">⚖️ {t('header.logo')}</span>
        </div>

        <nav className="hidden md:flex items-center gap-4">
          <button onClick={() => scrollToSection('home')} className="text-sm font-medium transition-colors hover:text-primary">{t('header.nav.home')}</button>
          <button onClick={() => scrollToSection('rights')} className="text-sm font-medium transition-colors hover:text-primary">{t('header.nav.rights')}</button>
          <button onClick={() => scrollToSection('scenarios')} className="text-sm font-medium transition-colors hover:text-primary">{t('header.nav.scenarios')}</button>
          <button onClick={() => scrollToSection('scenario-input')} className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-1">
            <Bot className="h-3.5 w-3.5" /> {t('header.nav.ai', 'AI Assistant')}
          </button>
          <button onClick={() => scrollToSection('about')} className="text-sm font-medium transition-colors hover:text-primary">{t('header.nav.about')}</button>
          <button onClick={() => scrollToSection('contact')} className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> {t('header.nav.contact', 'Need Legal Help')}
          </button>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild className="gap-1.5 hidden sm:flex">
            <Link to="/admin"><Shield className="h-4 w-4" /> <span className="hidden lg:inline">{t('header.nav.admin', 'Admin')}</span></Link>
          </Button>
          <Button variant="outline" size="sm" onClick={() => scrollToSection('data-analysis')} className="gap-1.5 hidden sm:flex">
            <BarChart3 className="h-4 w-4" /> <span className="hidden lg:inline">{t('header.nav.analytics', 'Analytics')}</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">{languages.find(l => l.code === i18n.language)?.name || 'English'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {languages.map(lang => (
                <DropdownMenuItem key={lang.code} onClick={() => changeLanguage(lang.code)} className={i18n.language === lang.code ? 'bg-accent' : ''}>
                  {lang.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {user && (
            <Button variant="ghost" size="sm" onClick={signOut} className="gap-1.5 text-destructive hover:text-destructive">
              <LogOut className="h-4 w-4" />
              <span className="hidden lg:inline">Logout</span>
            </Button>
          )}

          <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t md:hidden">
          <nav className="container flex flex-col gap-3 py-4">
            <button onClick={() => scrollToSection('home')} className="text-sm font-medium text-left transition-colors hover:text-primary">{t('header.nav.home')}</button>
            <button onClick={() => scrollToSection('rights')} className="text-sm font-medium text-left transition-colors hover:text-primary">{t('header.nav.rights')}</button>
            <button onClick={() => scrollToSection('scenarios')} className="text-sm font-medium text-left transition-colors hover:text-primary">{t('header.nav.scenarios')}</button>
            <button onClick={() => scrollToSection('scenario-input')} className="text-sm font-medium text-left transition-colors hover:text-primary flex items-center gap-1">
              <Bot className="h-3.5 w-3.5" /> {t('header.nav.ai', 'AI Assistant')}
            </button>
            <button onClick={() => scrollToSection('data-analysis')} className="text-sm font-medium text-left transition-colors hover:text-primary flex items-center gap-1">
              <BarChart3 className="h-3.5 w-3.5" /> {t('header.nav.analytics', 'Analytics')}
            </button>
            <Link to="/admin" className="text-sm font-medium text-left transition-colors hover:text-primary flex items-center gap-1" onClick={() => setMobileMenuOpen(false)}>
              <Shield className="h-3.5 w-3.5" /> {t('header.nav.admin', 'Admin Login')}
            </Link>
            <button onClick={() => scrollToSection('about')} className="text-sm font-medium text-left transition-colors hover:text-primary">{t('header.nav.about')}</button>
            <button onClick={() => scrollToSection('contact')} className="text-sm font-medium text-left transition-colors hover:text-primary">{t('header.nav.contact')}</button>
            {user && (
              <button onClick={signOut} className="text-sm font-medium text-left text-destructive flex items-center gap-1">
                <LogOut className="h-3.5 w-3.5" /> Logout
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
