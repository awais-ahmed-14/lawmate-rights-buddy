import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Scale, BookOpen, Landmark, Shield, Loader2, Mail, Lock, Phone, User, Gavel,
  UserPlus, LogIn, Upload, ArrowRight,
} from 'lucide-react';

const SUPER_ADMIN_P1 = 'lawmate2026';
const SUPER_ADMIN_P2 = 'admin@secure';

const DISTRICTS = [
  'Hyderabad', 'Ranga Reddy', 'Warangal', 'Karimnagar', 'Nizamabad',
  'Khammam', 'Nalgonda', 'Mahabubnagar', 'Medak', 'Adilabad',
];

type LoginType = 'user' | 'lawyer' | 'super-admin' | 'lawyer-register';

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

  // Lawyer login (email + password)
  const [llEmail, setLlEmail] = useState('');
  const [llPassword, setLlPassword] = useState('');

  // Super admin
  const [saP1, setSaP1] = useState('');
  const [saP2, setSaP2] = useState('');

  // Lawyer registration
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDistrict, setRegDistrict] = useState('');
  const [regFile, setRegFile] = useState<File | null>(null);
  const [regPassword, setRegPassword] = useState('');

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

  const handleLawyerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!llEmail || !llPassword) {
      toast({ title: 'Email and password required', variant: 'destructive' }); return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lawyer-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        body: JSON.stringify({ action: 'login-simple', email: llEmail, password: llPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      sessionStorage.setItem('lawyer_session', JSON.stringify(data.lawyer));
      toast({ title: `Welcome, ${data.lawyer.name} ✅` });
      navigate('/lawyer-dashboard', { replace: true });
    } catch (err: any) {
      toast({ title: 'Login Failed', description: err.message, variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const handleSuperAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (saP1 === SUPER_ADMIN_P1 && saP2 === SUPER_ADMIN_P2) {
      sessionStorage.setItem('super_admin_session', '1');
      navigate('/admin', { replace: true });
    } else {
      toast({ title: 'Access Denied', variant: 'destructive' });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPhone || !regDistrict || !regPassword) {
      toast({ title: 'All fields required', variant: 'destructive' }); return;
    }
    setLoading(true);
    try {
      let fileUrl = '';
      if (regFile) {
        const ext = regFile.name.split('.').pop();
        const path = `${Date.now()}_${regEmail}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from('lawyer-docs').upload(path, regFile);
        if (uploadErr) throw uploadErr;
        fileUrl = path;
      }
      const { error } = await (supabase.from as any)('lawyers').insert({
        name: regName, email: regEmail, phone: regPhone,
        district: regDistrict, verification_file_url: fileUrl,
        password1: regPassword, password2: regPassword,
      });
      if (error) throw error;
      toast({ title: 'Registration Submitted ✅', description: 'Pending approval by super admin.' });
      setRegName(''); setRegEmail(''); setRegPhone(''); setRegDistrict(''); setRegFile(null); setRegPassword('');
      setActiveLogin('lawyer');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const loginOptions = [
    { id: 'user' as LoginType, label: 'User Login', icon: User, desc: 'For citizens seeking legal help' },
    { id: 'lawyer' as LoginType, label: 'Lawyer Login', icon: Gavel, desc: 'Approved lawyers — manage cases' },
    { id: 'super-admin' as LoginType, label: 'Super Admin Login', icon: Shield, desc: 'Approve lawyer registrations' },
    { id: 'lawyer-register' as LoginType, label: 'Lawyer Registration', icon: UserPlus, desc: 'Register as a district lawyer' },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <FloatingIcon icon={Scale} className="top-[5%] right-[8%] animate-bounce" />
      <FloatingIcon icon={BookOpen} className="top-[25%] right-[15%] animate-pulse" />
      <FloatingIcon icon={Landmark} className="bottom-[15%] right-[10%] animate-pulse" />
      <FloatingIcon icon={Gavel} className="bottom-[5%] right-[20%] animate-bounce" />

      {/* Left Sidebar — Login Options */}
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
                className={`w-full text-left p-3 rounded-lg border transition-all flex items-start gap-3 group ${
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
          {/* USER LOGIN — preserves existing flow */}
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
                        <Input type="email" placeholder="Email (e.g. user@outlook.com)" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="pl-10" required />
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
                        <Input type="email" placeholder="Email (e.g. user@outlook.com)" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} className="pl-10" required />
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

          {/* LAWYER LOGIN */}
          {activeLogin === 'lawyer' && (
            <>
              <CardHeader className="text-center">
                <Gavel className="h-10 w-10 mx-auto text-primary mb-2" />
                <CardTitle className="text-xl">Lawyer Login</CardTitle>
                <CardDescription>Sign in to view and manage user complaints</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLawyerLogin} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input type="email" placeholder="Registered Email" value={llEmail} onChange={e => setLlEmail(e.target.value)} className="pl-10" required />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input type="password" placeholder="Password" value={llPassword} onChange={e => setLlPassword(e.target.value)} className="pl-10" required />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />} Login as Lawyer
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Not registered?{' '}
                    <button type="button" onClick={() => setActiveLogin('lawyer-register')} className="text-primary hover:underline font-medium">
                      Register here
                    </button>
                  </p>
                </form>
              </CardContent>
            </>
          )}

          {/* SUPER ADMIN LOGIN */}
          {activeLogin === 'super-admin' && (
            <>
              <CardHeader className="text-center">
                <Shield className="h-10 w-10 mx-auto text-primary mb-2" />
                <CardTitle className="text-xl">Super Admin Login</CardTitle>
                <CardDescription>Dual-password authentication required</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSuperAdmin} className="space-y-4">
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input type="password" placeholder="Password 1" value={saP1} onChange={e => setSaP1(e.target.value)} className="pl-10" required />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input type="password" placeholder="Password 2" value={saP2} onChange={e => setSaP2(e.target.value)} className="pl-10" required />
                  </div>
                  <Button type="submit" className="w-full">
                    <Shield className="mr-2 h-4 w-4" /> Access Super Admin Panel
                  </Button>
                </form>
              </CardContent>
            </>
          )}

          {/* LAWYER REGISTRATION */}
          {activeLogin === 'lawyer-register' && (
            <>
              <CardHeader className="text-center">
                <UserPlus className="h-10 w-10 mx-auto text-primary mb-2" />
                <CardTitle className="text-xl">Lawyer Registration</CardTitle>
                <CardDescription>Submit your details for super admin approval</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-3">
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Full Name" value={regName} onChange={e => setRegName(e.target.value)} className="pl-10" required />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input type="email" placeholder="Email" value={regEmail} onChange={e => setRegEmail(e.target.value)} className="pl-10" required />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input type="tel" placeholder="Phone Number" value={regPhone} onChange={e => setRegPhone(e.target.value)} className="pl-10" required />
                  </div>
                  <Select value={regDistrict} onValueChange={setRegDistrict}>
                    <SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger>
                    <SelectContent>
                      {DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block flex items-center gap-1">
                      <Upload className="h-3 w-3" /> Verification Document
                    </label>
                    <Input type="file" accept=".pdf,.jpg,.png,.doc,.docx" onChange={e => setRegFile(e.target.files?.[0] || null)} />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input type="password" placeholder="Set Password" value={regPassword} onChange={e => setRegPassword(e.target.value)} className="pl-10" required />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />} Submit Registration
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
