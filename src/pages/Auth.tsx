import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Scale, BookOpen, Landmark, Shield, Loader2, Mail, Lock, Phone, User } from 'lucide-react';

const FloatingIcon = ({ icon: Icon, className }: { icon: any; className: string }) => (
  <div className={`absolute opacity-10 ${className}`}>
    <Icon className="h-16 w-16 text-primary" />
  </div>
);

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

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
    if (error) {
      toast({ title: 'Login Failed', description: error.message, variant: 'destructive' });
    } else {
      navigate('/', { replace: true });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupPhone.trim()) {
      toast({ title: 'Phone Required', description: 'Please enter your phone number.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: {
        data: { full_name: signupName, phone: signupPhone },
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: 'Signup Failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Account Created ✅', description: 'You can now log in.' });
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Floating Legal Symbols */}
      <FloatingIcon icon={Scale} className="top-10 left-10 animate-bounce" />
      <FloatingIcon icon={BookOpen} className="top-1/4 right-16 animate-pulse" />
      <FloatingIcon icon={Landmark} className="bottom-20 left-20 animate-pulse" />
      <FloatingIcon icon={Shield} className="bottom-10 right-10 animate-bounce" />
      <FloatingIcon icon={Scale} className="top-1/2 left-1/3 animate-pulse" />

      {/* Left Decorative Panel (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-gradient-hero relative">
        <div className="text-center text-primary-foreground p-12 animate-fade-in z-10">
          <Scale className="h-24 w-24 mx-auto mb-6 animate-bounce" />
          <h1 className="text-4xl font-heading font-bold mb-4">⚖️ LAWMATE</h1>
          <p className="text-xl opacity-90 mb-2">Know Your Rights</p>
          <p className="text-sm opacity-70 max-w-md mx-auto">
            Empowering every Indian citizen with AI-powered legal guidance and multilingual support.
          </p>
          <div className="mt-10 flex justify-center gap-8 opacity-30">
            <BookOpen className="h-12 w-12" />
            <Landmark className="h-12 w-12" />
            <Shield className="h-12 w-12" />
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-xl animate-scale-in">
          <CardHeader className="text-center">
            <div className="lg:hidden mb-4">
              <Scale className="h-12 w-12 mx-auto text-primary" />
              <h1 className="text-2xl font-heading font-bold text-primary mt-2">⚖️ LAWMATE</h1>
            </div>
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
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                    Login
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
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shield className="mr-2 h-4 w-4" />}
                    Create Account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
