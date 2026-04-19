import { useState, ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';
import { AboutFooter } from './AboutFooter';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const languages = [
  { code: 'en', name: 'English' }, { code: 'hi', name: 'हिंदी' },
  { code: 'te', name: 'తెలుగు' }, { code: 'ta', name: 'தமிழ்' },
  { code: 'bn', name: 'বাংলা' }, { code: 'ur', name: 'اردو' },
];

export const AppLayout = ({ children, title }: { children: ReactNode; title: string }) => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background w-full">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <AppSidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-14 border-b bg-background/95 backdrop-blur flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-2">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                <AppSidebar onNavigate={() => setSheetOpen(false)} />
              </SheetContent>
            </Sheet>
            <h2 className="text-base lg:text-lg font-heading font-semibold truncate">{title}</h2>
          </div>
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
        </header>

        <main className="flex-1 p-4 lg:p-6">{children}</main>
        <AboutFooter />
      </div>
    </div>
  );
};
