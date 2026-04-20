import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  CheckCircle, XCircle, ArrowLeft, Shield, Loader2, FileText, Users, LogOut, ExternalLink,
} from 'lucide-react';

const AdminPanel = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('super_admin_session') === '1') setAuthed(true);
    else navigate('/auth', { replace: true });
  }, [navigate]);

  const { data: allLawyers, isLoading } = useQuery({
    queryKey: ['all-lawyers'],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lawyer-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        body: JSON.stringify({ action: 'list-all' }),
      });
      const data = await res.json();
      return (data.lawyers || []) as any[];
    },
    enabled: authed,
  });

  const handleVerify = async (id: string, verified: boolean) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lawyer-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        body: JSON.stringify({ action: 'approve', lawyerId: id, approved: verified }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      queryClient.invalidateQueries({ queryKey: ['all-lawyers'] });
      toast({ title: verified ? 'Lawyer Verified ✅' : 'Marked Not Verified ❌' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const openDoc = async (path: string) => {
    const { data } = await supabase.storage.from('lawyer-docs').createSignedUrl(path, 3600);
    if (data?.signedUrl) window.open(data.signedUrl, '_blank');
    else toast({ title: 'Could not load document', variant: 'destructive' });
  };

  const handleLogout = () => {
    sessionStorage.removeItem('super_admin_session');
    navigate('/auth', { replace: true });
  };

  if (!authed) return null;

  const pending = (allLawyers || []).filter(l => !l.approved);
  const verified = (allLawyers || []).filter(l => l.approved);

  const renderLawyerCard = (l: any, isPending: boolean) => (
    <div key={l.id} className="p-4 bg-background rounded-lg border space-y-3">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div className="space-y-1">
          <p className="font-semibold">{l.name}</p>
          <div className="text-xs text-muted-foreground space-y-0.5">
            <p><strong>Email:</strong> {l.email}</p>
            <p><strong>Phone:</strong> {l.phone}</p>
            <p><strong>District:</strong> {l.district}</p>
            <p><strong>Submitted:</strong> {new Date(l.created_at).toLocaleString()}</p>
          </div>
        </div>
        <Badge variant={l.approved ? 'secondary' : 'outline'}>
          {l.approved ? 'Verified' : 'Pending'}
        </Badge>
      </div>

      {l.verification_file_url ? (
        <Button size="sm" variant="outline" onClick={() => openDoc(l.verification_file_url)}>
          <FileText className="mr-1.5 h-4 w-4" /> View Document <ExternalLink className="ml-1.5 h-3 w-3" />
        </Button>
      ) : (
        <p className="text-xs text-muted-foreground italic">No document uploaded</p>
      )}

      <div className="flex gap-2 pt-1">
        {isPending ? (
          <>
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleVerify(l.id, true)}>
              <CheckCircle className="mr-1.5 h-4 w-4" /> Verified
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleVerify(l.id, false)}>
              <XCircle className="mr-1.5 h-4 w-4" /> Not Verified
            </Button>
          </>
        ) : (
          <Button size="sm" variant="outline" onClick={() => handleVerify(l.id, false)}>
            <XCircle className="mr-1.5 h-4 w-4" /> Revoke Verification
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container max-w-4xl py-8">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Shield className="h-9 w-9 text-primary" />
            <div>
              <h1 className="text-2xl font-heading font-bold">🔐 Super Admin Panel</h1>
              <p className="text-sm text-muted-foreground">Lawyer Verification System</p>
            </div>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-destructive">
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <>
            <Card className="shadow-lg mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-amber-500" /> Pending Verification ({pending.length})
                </CardTitle>
                <CardDescription>Review documents and approve qualified lawyers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {pending.length === 0
                  ? <p className="text-muted-foreground text-center py-4 text-sm">No pending registrations.</p>
                  : pending.map(l => renderLawyerCard(l, true))}
              </CardContent>
            </Card>

            <Card className="shadow-lg mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" /> Verified Lawyers ({verified.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {verified.length === 0
                  ? <p className="text-muted-foreground text-center py-4 text-sm">No verified lawyers yet.</p>
                  : verified.map(l => renderLawyerCard(l, false))}
              </CardContent>
            </Card>
          </>
        )}

        <Button variant="outline" onClick={() => navigate('/auth')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
        </Button>
      </div>
    </div>
  );
};

export default AdminPanel;
