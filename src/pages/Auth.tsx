import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Scale, BookOpen, Landmark, Shield, Loader2, Mail, Lock, Phone, User, Gavel, ArrowRight,
} from 'lucide-react';

const SUPER_ADMIN_PASSWORD = 'lawmate2026';

type LoginType = 'user' | 'super-admin';

const FloatingIcon = ({ icon: Icon, className }: { icon: any; className: string }) => (
  <div className={`absolute ${className} pointer-events-none`}>
    <Icon className="h-16 w-16 text-primary/10" />
  </div>
);

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeLogin, setActiveLogin] = useState<LoginType>('user');
  const [loading, setLoading] = useState(false);

  // User auth
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  // Super admin
  const [saPassword, setSaPassword] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/', { replace: true });
    });
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
    setLoading(false);
    if (error) toast({ title: 'Login Failed', description: error.message, variant: 'destructive' });
    else navigate('/', { replace: true });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupPhone.trim()) {
      toast({ title: 'Phone Required', variant: 'destructive' }); return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: {
        data: { full_name: signupName, phone: signupPhone },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);
    if (error) toast({ title: 'Signup Failed', description: error.message, variant: 'destructive' });
    else toast({ title: 'Account Created ✅', description: 'Check your email to verify, then log in.' });
  };

  const handleSuperAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (saPassword === SUPER_ADMIN_PASSWORD) {
      sessionStorage.setItem('super_admin_session', '1');
      navigate('/admin', { replace: true });
    } else {
      toast({ title: 'Access Denied', variant: 'destructive' });
    }
  };

  const loginOptions = [
    { id: 'user' as LoginType, label: 'User Login', icon: User, desc: 'For citizens seeking legal help' },
    { id: 'super-admin' as LoginType, label: 'Super Admin', icon: Shield, desc: 'Verify lawyer registrations' },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <FloatingIcon icon={Scale} className="top-[5%] right-[8%] animate-bounce" />
      <FloatingIcon icon={BookOpen} className="top-[25%] right-[15%] animate-pulse" />
      <FloatingIcon icon={Landmark} className="bottom-[15%] right-[10%] animate-pulse" />
      <FloatingIcon icon={Gavel} className="bottom-[5%] right-[20%] animate-bounce" />

      {/* Left Sidebar */}
      <aside className="lg:w-[340px] lg:min-h-screen border-b lg:border-b-0 lg:border-r bg-card/80 backdrop-blur p-6 lg:p-8 z-10">
        <div className="flex items-center gap-2 mb-8">
          <Scale className="h-8 w-8 text-primary animate-pulse" />
          <div>
            <h1 className="text-xl font-heading font-bold text-primary">⚖️ LAWMATE</h1>
            <p className="text-xs text-muted-foreground">Know Your Rights</p>
          </div>
        </div>

        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-semibold">Choose Login Type</p>
        <nav className="space-y-2">
          {loginOptions.map(opt => {
            const Icon = opt.icon;
            const active = activeLogin === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setActiveLogin(opt.id)}
                className={`w-full text-left p-3 rounded-lg border transition-all flex items-start gap-3 ${
                  active
                    ? 'bg-primary text-primary-foreground border-primary shadow-md scale-[1.02]'
                    : 'bg-background/50 border-border hover:border-primary/50 hover:bg-accent/30'
                }`}
              >
                <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${active ? 'animate-pulse' : 'text-primary'}`} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm flex items-center justify-between">
                    {opt.label}
                    {active && <ArrowRight className="h-4 w-4" />}
                  </div>
                  <p className={`text-xs mt-0.5 ${active ? 'opacity-90' : 'text-muted-foreground'}`}>{opt.desc}</p>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="mt-8 pt-6 border-t hidden lg:block">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Empowering every Indian citizen with AI-powered legal guidance and multilingual support.
          </p>
          <div className="mt-4 flex gap-3 opacity-40">
            <BookOpen className="h-5 w-5" /><Landmark className="h-5 w-5" /><Gavel className="h-5 w-5" /><Shield className="h-5 w-5" />
          </div>
        </div>
      </aside>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 z-10">
        <Card className="w-full max-w-md shadow-xl animate-scale-in">
          {activeLogin === 'user' && (
            <>
              <CardHeader className="text-center">
                <User className="h-10 w-10 mx-auto text-primary mb-2" />
                <CardTitle className="text-xl">Welcome to Lawmate</CardTitle>
                <CardDescription>Sign in or create an account to get started</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="login">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input type="email" placeholder="Email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="pl-10" required />
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input type="password" placeholder="Password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="pl-10" required />
                      </div>
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />} Login
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="signup">
                    <form onSubmit={handleSignup} className="space-y-4">
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input type="text" placeholder="Full Name" value={signupName} onChange={e => setSignupName(e.target.value)} className="pl-10" required />
                      </div>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input type="email" placeholder="Email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} className="pl-10" required />
                      </div>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input type="tel" placeholder="Phone Number" value={signupPhone} onChange={e => setSignupPhone(e.target.value)} className="pl-10" required />
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input type="password" placeholder="Password (min 6 characters)" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} className="pl-10" minLength={6} required />
                      </div>
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shield className="mr-2 h-4 w-4" />} Create Account
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </>
          )}

          {activeLogin === 'super-admin' && (
            <>
              <CardHeader className="text-center">
                <Shield className="h-10 w-10 mx-auto text-primary mb-2" />
                <CardTitle className="text-xl">Super Admin Login</CardTitle>
                <CardDescription>Enter the admin password to verify lawyer registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSuperAdmin} className="space-y-4">
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input type="password" placeholder="Admin Password" value={saPassword} onChange={e => setSaPassword(e.target.value)} className="pl-10" required autoFocus />
                  </div>
                  <Button type="submit" className="w-full">
                    <Shield className="mr-2 h-4 w-4" /> Access Verification Panel
                  </Button>
                </form>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Auth;
