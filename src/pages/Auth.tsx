import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Scale, BookOpen, Landmark, Shield, Loader2, Mail, Lock, Phone, User, Gavel, ArrowRight, UserPlus, Upload, MapPin, Award, Briefcase,
} from 'lucide-react';

const SUPER_ADMIN_PASSWORD = 'lawmate2026';

const TELANGANA_DISTRICTS = [
  'Hyderabad', 'Rangareddy', 'Medchal', 'Sangareddy', 'Warangal',
  'Karimnagar', 'Nizamabad', 'Khammam', 'Nalgonda', 'Mahbubnagar',
];

type LoginType = 'user' | 'lawyer-login' | 'lawyer-register' | 'super-admin';

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

  // Lawyer login
  const [lwEmail, setLwEmail] = useState('');
  const [lwPassword, setLwPassword] = useState('');

  // Lawyer registration
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regQualification, setRegQualification] = useState('');
  const [regSpecialization, setRegSpecialization] = useState('');
  const [regDistrict, setRegDistrict] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regFile, setRegFile] = useState<File | null>(null);

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
    if (!signupPhone.trim()) { toast({ title: 'Phone Required', variant: 'destructive' }); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: signupEmail, password: signupPassword,
      options: { data: { full_name: signupName, phone: signupPhone }, emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (error) toast({ title: 'Signup Failed', description: error.message, variant: 'destructive' });
    else toast({ title: 'Account Created ✅', description: 'Check your email to verify, then log in.' });
  };

  const handleLawyerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lawyer-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        body: JSON.stringify({ action: 'login-simple', email: lwEmail, password: lwPassword }),
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

  const handleLawyerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFile) { toast({ title: 'Document Required', description: 'Please upload your certificate/proof.', variant: 'destructive' }); return; }
    if (regPassword.length < 6) { toast({ title: 'Password too short', description: 'Use at least 6 characters.', variant: 'destructive' }); return; }
    setLoading(true);
    try {
      // Upload document to lawyer-docs bucket
      const ext = regFile.name.split('.').pop();
      const filePath = `${Date.now()}-${regEmail.replace(/[^a-z0-9]/gi, '_')}.${ext}`;
      const { error: upErr } = await supabase.storage.from('lawyer-docs').upload(filePath, regFile);
      if (upErr) throw upErr;

      // Insert lawyer (combine qualification+specialization into name display via separate fields-by-storing in name? no — store in district/phone fields are taken)
      // We have: name, email, phone, district, password1, password2, verification_file_url, approved
      // Embed qualification & specialization into the name field for now (e.g. "Adv. X — LLB, Criminal Law")
      const fullName = `${regName.trim()} — ${regQualification.trim()}, ${regSpecialization.trim()}`;
      const { error: insErr } = await (supabase.from as any)('lawyers').insert({
        name: fullName,
        email: regEmail.trim().toLowerCase(),
        phone: regPhone.trim(),
        district: regDistrict,
        password1: regPassword,
        password2: regPassword,
        verification_file_url: filePath,
        approved: false,
      });
      if (insErr) throw insErr;

      toast({ title: 'Registration Submitted ✅', description: 'Awaiting Super Admin approval. You will be able to log in once verified.' });
      // reset
      setRegName(''); setRegEmail(''); setRegPhone(''); setRegQualification('');
      setRegSpecialization(''); setRegDistrict(''); setRegPassword(''); setRegFile(null);
      setActiveLogin('lawyer-login');
    } catch (err: any) {
      toast({ title: 'Registration Failed', description: err.message, variant: 'destructive' });
    } finally { setLoading(false); }
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
    { id: 'lawyer-login' as LoginType, label: 'Lawyer Login', icon: Gavel, desc: 'Verified lawyers — view complaints' },
    { id: 'lawyer-register' as LoginType, label: 'Lawyer Registration', icon: UserPlus, desc: 'New lawyers — apply for verification' },
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

          {activeLogin === 'lawyer-login' && (
            <>
              <CardHeader className="text-center">
                <Gavel className="h-10 w-10 mx-auto text-primary mb-2" />
                <CardTitle className="text-xl">Lawyer Login</CardTitle>
                <CardDescription>Sign in to view assigned complaints</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLawyerLogin} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input type="email" placeholder="Registered Email" value={lwEmail} onChange={e => setLwEmail(e.target.value)} className="pl-10" required />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input type="password" placeholder="Password" value={lwPassword} onChange={e => setLwPassword(e.target.value)} className="pl-10" required />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Gavel className="mr-2 h-4 w-4" />} Login
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Only verified lawyers can log in. New? Use Lawyer Registration.
                  </p>
                </form>
              </CardContent>
            </>
          )}

          {activeLogin === 'lawyer-register' && (
            <>
              <CardHeader className="text-center">
                <UserPlus className="h-10 w-10 mx-auto text-primary mb-2" />
                <CardTitle className="text-xl">Lawyer Registration</CardTitle>
                <CardDescription>Submit your details for Super Admin verification</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLawyerRegister} className="space-y-3">
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
                  <div className="relative">
                    <Award className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Qualification (e.g. LLB, LLM)" value={regQualification} onChange={e => setRegQualification(e.target.value)} className="pl-10" required />
                  </div>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Specialization (e.g. Criminal Law)" value={regSpecialization} onChange={e => setRegSpecialization(e.target.value)} className="pl-10" required />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <select
                      value={regDistrict}
                      onChange={e => setRegDistrict(e.target.value)}
                      required
                      className="w-full h-10 pl-10 pr-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Select District</option>
                      {TELANGANA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="relative">
                    <Upload className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={e => setRegFile(e.target.files?.[0] || null)}
                      className="pl-10 cursor-pointer file:mr-2 file:py-0 file:px-2 file:text-xs"
                      required
                    />
                  </div>
                  {regFile && <p className="text-xs text-muted-foreground truncate">📎 {regFile.name}</p>}
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input type="password" placeholder="Password (min 6 characters)" value={regPassword} onChange={e => setRegPassword(e.target.value)} className="pl-10" minLength={6} required />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />} Submit for Approval
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Your account will be activated after Super Admin verification.
                  </p>
                </form>
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
