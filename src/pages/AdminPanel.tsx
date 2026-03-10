import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  CheckCircle, XCircle, Clock, ArrowLeft, Shield, Lock, Loader2,
  Mail, MessageSquare, Send, UserPlus, LogIn, Phone, MapPin, Upload, Users
} from 'lucide-react';
import { Link } from 'react-router-dom';

const SUPER_ADMIN_P1 = 'lawmate2026';
const SUPER_ADMIN_P2 = 'admin@secure';

const DISTRICTS = [
  'Hyderabad', 'Ranga Reddy', 'Warangal', 'Karimnagar', 'Nizamabad',
  'Khammam', 'Nalgonda', 'Mahabubnagar', 'Medak', 'Adilabad',
];

const AdminPanel = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [view, setView] = useState<'menu' | 'register' | 'lawyer-login' | 'lawyer-dashboard' | 'super-admin' | 'super-dashboard'>('menu');
  const [lawyerId, setLawyerId] = useState<string | null>(null);
  const [lawyerDistrict, setLawyerDistrict] = useState<string>('');

  // Registration state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDistrict, setRegDistrict] = useState('');
  const [regFile, setRegFile] = useState<File | null>(null);
  const [regP1, setRegP1] = useState('');
  const [regP2, setRegP2] = useState('');
  const [registering, setRegistering] = useState(false);

  // Lawyer login state
  const [llEmail, setLlEmail] = useState('');
  const [llPhone, setLlPhone] = useState('');
  const [llP1, setLlP1] = useState('');
  const [llP2, setLlP2] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Super admin state
  const [saP1, setSaP1] = useState('');
  const [saP2, setSaP2] = useState('');

  // Reply state
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [expandedCase, setExpandedCase] = useState<string | null>(null);

  const { data: cases, isLoading: casesLoading } = useQuery({
    queryKey: ['admin-cases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('case_records')
        .select('id, status, language, created_at, resolved_at, case_type_id, user_message, user_email, admin_reply')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: view === 'lawyer-dashboard' || view === 'super-dashboard',
  });

  const { data: caseTypes } = useQuery({
    queryKey: ['admin-case-types'],
    queryFn: async () => {
      const { data, error } = await supabase.from('case_types').select('id, display_name');
      if (error) throw error;
      return data || [];
    },
    enabled: view === 'lawyer-dashboard' || view === 'super-dashboard',
  });

  const { data: pendingLawyers } = useQuery({
    queryKey: ['pending-lawyers'],
    queryFn: async () => {
      // Super admin can see all lawyers via service role (but we query client-side)
      // Since RLS only allows approved=true for SELECT, super admin needs edge function
      // For now, showing approved lawyers. Approval done via edge function.
      const { data, error } = await (supabase.from as any)('lawyers')
        .select('id, name, email, phone, district, approved, created_at');
      if (error) throw error;
      return data || [];
    },
    enabled: view === 'super-dashboard',
  });

  const sendReply = useMutation({
    mutationFn: async ({ caseId, reply, markAs }: { caseId: string; reply: string; markAs?: 'solved' | 'not_solved' }) => {
      const updateData: any = { admin_reply: reply };
      if (markAs === 'solved') { updateData.status = 'solved'; updateData.resolved_at = new Date().toISOString(); }
      else if (markAs === 'not_solved') { updateData.status = 'not_solved'; }
      const { error } = await supabase.from('case_records').update(updateData).eq('id', caseId);
      if (error) throw error;
    },
    onSuccess: (_, v) => {
      queryClient.invalidateQueries({ queryKey: ['admin-cases'] });
      queryClient.invalidateQueries({ queryKey: ['case-analytics'] });
      setReplyTexts(prev => ({ ...prev, [v.caseId]: '' }));
      setExpandedCase(null);
      toast({ title: v.markAs === 'solved' ? 'Marked Solved ✅' : v.markAs === 'not_solved' ? 'Marked Not Solved ❌' : 'Reply Sent' });
    },
  });

  const handleRegister = async () => {
    if (!regName || !regEmail || !regPhone || !regDistrict || !regP1 || !regP2) {
      toast({ title: 'All fields required', variant: 'destructive' }); return;
    }
    setRegistering(true);
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
        password1: regP1, password2: regP2,
      });
      if (error) throw error;
      toast({ title: 'Registration Submitted ✅', description: 'Your registration is pending approval.' });
      setView('menu');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setRegistering(false);
    }
  };

  const handleLawyerLogin = async () => {
    if (!llEmail || !llPhone || !llP1 || !llP2) {
      toast({ title: 'All fields required', variant: 'destructive' }); return;
    }
    setLoggingIn(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lawyer-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        body: JSON.stringify({ action: 'login', email: llEmail, phone: llPhone, password1: llP1, password2: llP2 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      setLawyerId(data.lawyer.id);
      setLawyerDistrict(data.lawyer.district);
      setView('lawyer-dashboard');
      toast({ title: `Welcome, ${data.lawyer.name} ✅` });
    } catch (err: any) {
      toast({ title: 'Login Failed', description: err.message, variant: 'destructive' });
    } finally {
      setLoggingIn(false);
    }
  };

  const handleSuperAdmin = () => {
    if (saP1 === SUPER_ADMIN_P1 && saP2 === SUPER_ADMIN_P2) {
      setView('super-dashboard');
    } else {
      toast({ title: 'Access Denied', variant: 'destructive' });
    }
  };

  const getCaseTypeName = (id: string) => caseTypes?.find(ct => ct.id === id)?.display_name || 'Unknown';

  // Menu screen
  if (view === 'menu') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md shadow-xl animate-scale-in">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 mx-auto mb-2 text-primary" />
            <CardTitle className="text-xl">Admin Panel</CardTitle>
            <CardDescription>Register as a lawyer or login to manage cases</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full h-14 text-base" onClick={() => setView('register')}>
              <UserPlus className="mr-2 h-5 w-5" /> New Lawyer Registration
            </Button>
            <Button className="w-full h-14 text-base" variant="secondary" onClick={() => setView('lawyer-login')}>
              <LogIn className="mr-2 h-5 w-5" /> Lawyer Login
            </Button>
            <Button className="w-full h-14 text-base" variant="outline" onClick={() => setView('super-admin')}>
              <Lock className="mr-2 h-5 w-5" /> Super Admin
            </Button>
            <Button variant="ghost" className="w-full" asChild>
              <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Registration form
  if (view === 'register') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-lg shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5" /> Lawyer Registration</CardTitle>
            <CardDescription>Register as a district lawyer. Your registration will be reviewed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Full Name" value={regName} onChange={e => setRegName(e.target.value)} />
            <Input type="email" placeholder="Email" value={regEmail} onChange={e => setRegEmail(e.target.value)} />
            <Input type="tel" placeholder="Phone Number" value={regPhone} onChange={e => setRegPhone(e.target.value)} />
            <Select value={regDistrict} onValueChange={setRegDistrict}>
              <SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger>
              <SelectContent>
                {DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            <div>
              <label className="text-sm font-medium mb-1 block text-muted-foreground">Upload Verification Document</label>
              <Input type="file" accept=".pdf,.jpg,.png,.doc,.docx" onChange={e => setRegFile(e.target.files?.[0] || null)} />
            </div>
            <Input type="password" placeholder="Set Password 1" value={regP1} onChange={e => setRegP1(e.target.value)} />
            <Input type="password" placeholder="Set Password 2" value={regP2} onChange={e => setRegP2(e.target.value)} />
            <div className="flex gap-2">
              <Button onClick={handleRegister} disabled={registering} className="flex-1">
                {registering ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />} Submit
              </Button>
              <Button variant="outline" onClick={() => setView('menu')}>Back</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Lawyer login
  if (view === 'lawyer-login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-sm shadow-xl">
          <CardHeader className="text-center">
            <LogIn className="h-10 w-10 mx-auto mb-2 text-primary" />
            <CardTitle>Lawyer Login</CardTitle>
            <CardDescription>Dual-password authentication</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input type="email" placeholder="Email" value={llEmail} onChange={e => setLlEmail(e.target.value)} />
            <Input type="tel" placeholder="Phone Number" value={llPhone} onChange={e => setLlPhone(e.target.value)} />
            <Input type="password" placeholder="Password 1" value={llP1} onChange={e => setLlP1(e.target.value)} />
            <Input type="password" placeholder="Password 2" value={llP2} onChange={e => setLlP2(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleLawyerLogin(); }} />
            <Button className="w-full" onClick={handleLawyerLogin} disabled={loggingIn}>
              {loggingIn ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shield className="mr-2 h-4 w-4" />} Login
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => setView('menu')}>Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Super admin login
  if (view === 'super-admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-sm shadow-xl">
          <CardHeader className="text-center">
            <Lock className="h-10 w-10 mx-auto mb-2 text-primary" />
            <CardTitle>Super Admin Access</CardTitle>
            <CardDescription>Dual-password authentication required</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input type="password" placeholder="Password 1" value={saP1} onChange={e => setSaP1(e.target.value)} />
            <Input type="password" placeholder="Password 2" value={saP2} onChange={e => setSaP2(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleSuperAdmin(); }} />
            <Button className="w-full" onClick={handleSuperAdmin}><Shield className="mr-2 h-4 w-4" /> Login</Button>
            <Button variant="ghost" className="w-full" onClick={() => setView('menu')}>Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Case dashboard (shared between lawyer and super admin)
  const filteredCases = view === 'lawyer-dashboard'
    ? cases?.filter(() => true) // Lawyers see all cases for now
    : cases;

  const pendingCases = filteredCases?.filter(c => c.status === 'pending') || [];
  const solvedCases = filteredCases?.filter(c => c.status === 'solved') || [];
  const notSolvedCases = filteredCases?.filter(c => c.status === 'not_solved') || [];

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container max-w-4xl py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-heading font-bold">
              {view === 'super-dashboard' ? '🔐 Super Admin Panel' : '⚖️ Lawyer Dashboard'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {view === 'super-dashboard' ? 'Manage lawyers and review all cases' : `District: ${lawyerDistrict}`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setView('menu')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button variant="outline" asChild>
              <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> Home</Link>
            </Button>
          </div>
        </div>

        {/* Super Admin: Lawyer approvals */}
        {view === 'super-dashboard' && pendingLawyers && pendingLawyers.length > 0 && (
          <Card className="shadow-lg mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-primary" /> Registered Lawyers ({pendingLawyers.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingLawyers.map((l: any) => (
                <div key={l.id} className="p-4 bg-background rounded-lg border flex items-center justify-between">
                  <div>
                    <p className="font-medium">{l.name}</p>
                    <p className="text-xs text-muted-foreground">{l.email} · {l.phone} · {l.district}</p>
                  </div>
                  <Badge variant={l.approved ? 'secondary' : 'destructive'}>
                    {l.approved ? 'Approved' : 'Pending'}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {casesLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <>
            <CaseSection title="Pending Cases" icon={<Clock className="h-5 w-5 text-amber-500" />} cases={pendingCases} getCaseTypeName={getCaseTypeName}
              expandedCase={expandedCase} setExpandedCase={setExpandedCase} replyTexts={replyTexts} setReplyTexts={setReplyTexts} sendReply={sendReply} showActions />
            <CaseSection title="Solved Cases" icon={<CheckCircle className="h-5 w-5 text-green-600" />} cases={solvedCases}
              getCaseTypeName={getCaseTypeName} badgeVariant="secondary" badgeLabel="Solved" />
            <CaseSection title="Not Solved Cases" icon={<XCircle className="h-5 w-5 text-red-500" />} cases={notSolvedCases}
              getCaseTypeName={getCaseTypeName} badgeVariant="destructive" badgeLabel="Not Solved" />
          </>
        )}
      </div>
    </div>
  );
};

interface CaseSectionProps {
  title: string; icon: React.ReactNode; cases: any[]; getCaseTypeName: (id: string) => string;
  expandedCase?: string | null; setExpandedCase?: (id: string | null) => void;
  replyTexts?: Record<string, string>; setReplyTexts?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  sendReply?: any; showActions?: boolean; badgeVariant?: 'secondary' | 'destructive'; badgeLabel?: string;
}

const CaseSection = ({ title, icon, cases, getCaseTypeName, expandedCase, setExpandedCase, replyTexts, setReplyTexts, sendReply, showActions, badgeVariant, badgeLabel }: CaseSectionProps) => (
  <Card className="shadow-lg mb-6">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-lg">{icon} {title} ({cases.length})</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {cases.length === 0 ? (
        <p className="text-muted-foreground text-center py-4">No {title.toLowerCase()}</p>
      ) : (
        cases.slice(0, showActions ? undefined : 20).map(c => (
          <div key={c.id} className="p-4 bg-background rounded-lg border space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium text-sm">{getCaseTypeName(c.case_type_id)}</p>
                <div className="flex gap-2 flex-wrap">
                  {badgeLabel && <Badge variant={badgeVariant}>{badgeLabel}</Badge>}
                  <Badge variant="outline" className="text-xs">{c.language?.toUpperCase()}</Badge>
                  <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span>
                  {c.user_email && <span className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" /> {c.user_email}</span>}
                </div>
              </div>
              {showActions && setExpandedCase && (
                <Button size="sm" variant="outline" onClick={() => setExpandedCase(expandedCase === c.id ? null : c.id)}>
                  <MessageSquare className="mr-1.5 h-4 w-4" /> {expandedCase === c.id ? 'Close' : 'View & Reply'}
                </Button>
              )}
            </div>
            {c.user_message && (
              <div className="bg-muted/50 p-3 rounded-md">
                <p className="text-xs font-medium text-muted-foreground mb-1">User's Message:</p>
                <p className="text-sm">{c.user_message}</p>
              </div>
            )}
            {c.admin_reply && !showActions && (
              <div className="bg-green-50 dark:bg-green-950/30 p-2 rounded text-sm">
                <span className="text-xs font-medium text-green-700 dark:text-green-400">Admin Reply: </span>{c.admin_reply}
              </div>
            )}
            {showActions && expandedCase === c.id && replyTexts && setReplyTexts && sendReply && (
              <div className="space-y-2 pt-2 border-t">
                <Textarea placeholder="Type your reply..." value={replyTexts[c.id] || ''} onChange={e => setReplyTexts(prev => ({ ...prev, [c.id]: e.target.value }))} className="min-h-[80px]" />
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" onClick={() => sendReply.mutate({ caseId: c.id, reply: replyTexts[c.id] || '' })} disabled={!replyTexts[c.id]?.trim() || sendReply.isPending}>
                    <Send className="mr-1.5 h-4 w-4" /> Send Reply
                  </Button>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => sendReply.mutate({ caseId: c.id, reply: replyTexts[c.id] || 'Solved', markAs: 'solved' })} disabled={sendReply.isPending}>
                    <CheckCircle className="mr-1.5 h-4 w-4" /> Mark Solved
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => sendReply.mutate({ caseId: c.id, reply: replyTexts[c.id] || 'Not Solved', markAs: 'not_solved' })} disabled={sendReply.isPending}>
                    <XCircle className="mr-1.5 h-4 w-4" /> Mark Not Solved
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </CardContent>
  </Card>
);

export default AdminPanel;
