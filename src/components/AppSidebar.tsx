import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Bot, BarChart3, MessageSquareWarning, LogOut, Scale, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const AppSidebar = ({ onNavigate }: { onNavigate?: () => void }) => {
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { to: '/assistant', label: t('sidebar.aiAssistant'), icon: Bot },
    { to: '/complaint', label: t('sidebar.complaint'), icon: MessageSquareWarning },
    { to: '/analysis', label: t('sidebar.caseAnalysis'), icon: BarChart3 },
  ];

  // highlight AI Assistant on root route too
  const isAssistantRoute = location.pathname === '/' || location.pathname === '/assistant';

  const handleLogout = async () => {
    await signOut();
    navigate('/auth', { replace: true });
  };

  return (
    <aside className="w-full lg:w-64 lg:min-h-screen border-r bg-card/80 backdrop-blur flex flex-col">
      <div className="p-5 border-b">
        <div className="flex items-center gap-2">
          <Scale className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-lg font-heading font-bold text-primary">⚖️ LAWMATE</h1>
            <p className="text-[11px] text-muted-foreground -mt-0.5">{t('sidebar.knowYourRights')}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 mb-2 font-semibold">Main</p>
        {navItems.map(({ to, label, icon: Icon }) => {
          const forcedActive = to === '/assistant' && isAssistantRoute;
          return (
            <NavLink
              key={to}
              to={to}
              onClick={onNavigate}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                (isActive || forcedActive)
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-foreground/80 hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t space-y-2">
        {user && (
          <div className="px-2 py-2 rounded-md bg-muted/50">
            <p className="text-xs font-medium truncate">{profile?.full_name || user.email}</p>
            <p className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
              <Shield className="h-3 w-3" /> User
            </p>
          </div>
        )}
        <Button variant="ghost" size="sm" className="w-full justify-start text-destructive hover:text-destructive" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" /> Logout
        </Button>
      </div>
    </aside>
  );
};
