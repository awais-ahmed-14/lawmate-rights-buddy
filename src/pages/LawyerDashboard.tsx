import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  CheckCircle, XCircle, Clock, ArrowLeft, Loader2, Mail, LogOut, Gavel, Lock,
} from 'lucide-react';
import { AboutFooter } from '@/components/AboutFooter';

interface LawyerSession {
  id: string; name: string; email: string; phone: string; district: string;
}

const LawyerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [lawyer, setLawyer] = useState<LawyerSession | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem('lawyer_session');
    if (raw) {
      try { setLawyer(JSON.parse(raw)); } catch { /* show login */ }
    }
  }, []);

  const handleLawyerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast({ title: 'Email and password required', variant: 'destructive' }); return;
    }
    setLoggingIn(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lawyer-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        body: JSON.stringify({ action: 'login-simple', email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      sessionStorage.setItem('lawyer_session', JSON.stringify(data.lawyer));
      setLawyer(data.lawyer);
      toast({ title: `Welcome, ${data.lawyer.name} ✅` });
    } catch (err: any) {
      toast({ title: 'Login Failed', description: err.message, variant: 'destructive' });
    } finally { setLoggingIn(false); }
  };

  const { data: cases, isLoading } = useQuery({
    queryKey: ['lawyer-cases', lawyer?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('case_records')
        .select('id, status, language, created_at, resolved_at, case_type_id, user_message, user_email, user_phone, assigned_lawyer_id, proof_files')
        .eq('assigned_lawyer_id', lawyer!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!lawyer?.id,
  });

  const { data: caseTypes } = useQuery({
    queryKey: ['case-types'],
    queryFn: async () => {
      const { data, error } = await supabase.from('case_types').select('id, display_name');
      if (error) throw error;
      return data || [];
    },
    enabled: !!lawyer,
  });

  const updateCase = useMutation({
    mutationFn: async ({ caseId, markAs }: { caseId: string; markAs: 'solved' | 'not_solved' }) => {
      const updateData: Record<string, string | null> = {
        status: markAs,
        resolved_at: markAs === 'solved' ? new Date().toISOString() : null,
      };
      const { error } = await supabase.from('case_records').update(updateData).eq('id', caseId);
      if (error) throw error;
    },
    onSuccess: (_, v) => {
      queryClient.invalidateQueries({ queryKey: ['lawyer-cases'] });
      queryClient.invalidateQueries({ queryKey: ['case-analytics'] });
      toast({ title: v.markAs === 'solved' ? 'Marked Solved ✅' : 'Marked Unsolved ❌' });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const handleLogout = () => {
    sessionStorage.removeItem('lawyer_session');
    navigate('/auth', { replace: true });
  };

  const getCaseTypeName = (id: string) => caseTypes?.find(ct => ct.id === id)?.display_name || 'General';

  if (!lawyer) {
    return (
      <div className="min-h-screen flex flex-col bg-muted/30">
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-xl">
            <CardHeader className="text-center">
              <Gavel className="h-10 w-10 mx-auto text-primary mb-2" />
              <CardTitle>Lawyer Login</CardTitle>
              <CardDescription>Sign in to view assigned complaints</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLawyerLogin} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input type="email" placeholder="Registered Email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="pl-10" required />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input type="password" placeholder="Password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="pl-10" required />
                </div>
                <Button type="submit" className="w-full" disabled={loggingIn}>
                  {loggingIn ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Gavel className="mr-2 h-4 w-4" />} Login
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Lawyer accounts are created by the Super Admin after verification.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
        <AboutFooter />
      </div>
    );
  }

  const all = cases || [];
  const pending = all.filter(c => c.status === 'pending');
  const solved = all.filter(c => c.status === 'solved');
  const unsolved = all.filter(c => c.status === 'not_solved');

  const renderCases = (items: any[], emptyText: string, showActions: boolean, badgeLabel?: string, badgeVariant?: 'secondary' | 'destructive') => {
    if (items.length === 0) return <p className="text-muted-foreground text-center py-4 text-sm">{emptyText}</p>;
    return items.map(c => (
      <div key={c.id} className="p-4 bg-background rounded-lg border space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="space-y-1">
            <p className="font-medium text-sm">{getCaseTypeName(c.case_type_id)}</p>
            <div className="flex gap-2 flex-wrap items-center">
              {badgeLabel && <Badge variant={badgeVariant}>{badgeLabel}</Badge>}
              <Badge variant="outline" className="text-xs">{c.language?.toUpperCase()}</Badge>
              <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {c.user_email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {c.user_email}</span>}
          {c.user_phone && <span className="flex items-center gap-1">📞 {c.user_phone}</span>}
        </div>
        {c.user_message && (
          <div className="bg-muted/50 p-3 rounded-md">
            <p className="text-xs font-medium text-muted-foreground mb-1">User's Complaint:</p>
            <p className="text-sm whitespace-pre-wrap">{c.user_message}</p>
          </div>
        )}
        {Array.isArray(c.proof_files) && c.proof_files.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Uploaded Proof ({c.proof_files.length}):</p>
            <div className="flex flex-wrap gap-2">
              {c.proof_files.map((url: string, i: number) => {
                const isImage = /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url);
                return isImage ? (
                  <a key={i} href={url} target="_blank" rel="noreferrer" className="block">
                    <img src={url} alt={`Proof ${i + 1}`} className="h-20 w-20 object-cover rounded border" />
                  </a>
                ) : (
                  <a key={i} href={url} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-primary/10 text-primary rounded border border-primary/20 hover:bg-primary/20">
                    <Mail className="h-3 w-3" /> File {i + 1}
                  </a>
                );
              })}
            </div>
          </div>
        )}
        {showActions && (
          <div className="flex gap-2 flex-wrap pt-1">
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => updateCase.mutate({ caseId: c.id, markAs: 'solved' })} disabled={updateCase.isPending}>
              <CheckCircle className="mr-1.5 h-4 w-4" /> Mark Solved
            </Button>
            <Button size="sm" variant="destructive"
              onClick={() => updateCase.mutate({ caseId: c.id, markAs: 'not_solved' })} disabled={updateCase.isPending}>
              <XCircle className="mr-1.5 h-4 w-4" /> Mark Unsolved
            </Button>
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <div className="container max-w-4xl py-8 flex-1">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Gavel className="h-9 w-9 text-primary" />
            <div>
              <h1 className="text-2xl font-heading font-bold">{lawyer.name}'s Dashboard</h1>
              <p className="text-sm text-muted-foreground">District: {lawyer.district} · {lawyer.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild><Link to="/auth"><ArrowLeft className="mr-2 h-4 w-4" /> Login Hub</Link></Button>
            <Button variant="ghost" onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <>
            <Card className="shadow-lg mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5 text-amber-500" /> Pending Complaints ({pending.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">{renderCases(pending, 'No pending complaints assigned to you.', true)}</CardContent>
            </Card>

            <Card className="shadow-lg mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" /> Solved Cases ({solved.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">{renderCases(solved, 'No solved cases yet.', false, 'Solved', 'secondary')}</CardContent>
            </Card>

            <Card className="shadow-lg mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <XCircle className="h-5 w-5 text-red-500" /> Unsolved Cases ({unsolved.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">{renderCases(unsolved, 'No unsolved cases.', false, 'Unsolved', 'destructive')}</CardContent>
            </Card>
          </>
        )}
      </div>
      <AboutFooter />
    </div>
  );
};

export default LawyerDashboard;
