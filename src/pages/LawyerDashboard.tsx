import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  CheckCircle, XCircle, Clock, ArrowLeft, Loader2, Mail,
  MessageSquare, Send, LogOut, Gavel,
} from 'lucide-react';

interface LawyerSession {
  id: string; name: string; email: string; phone: string; district: string;
}

const LawyerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [lawyer, setLawyer] = useState<LawyerSession | null>(null);
  const [expandedCase, setExpandedCase] = useState<string | null>(null);
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});

  useEffect(() => {
    const raw = sessionStorage.getItem('lawyer_session');
    if (!raw) { navigate('/auth', { replace: true }); return; }
    try { setLawyer(JSON.parse(raw)); } catch { navigate('/auth', { replace: true }); }
  }, [navigate]);

  const { data: cases, isLoading } = useQuery({
    queryKey: ['lawyer-cases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('case_records')
        .select('id, status, language, created_at, resolved_at, case_type_id, user_message, user_email, admin_reply')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!lawyer,
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
    mutationFn: async ({ caseId, reply, markAs }: { caseId: string; reply: string; markAs: 'solved' | 'not_solved' }) => {
      const updateData: Record<string, string> = {
        admin_reply: reply,
        status: markAs,
      };
      if (markAs === 'solved') updateData.resolved_at = new Date().toISOString();
      const { error } = await supabase.from('case_records').update(updateData).eq('id', caseId);
      if (error) throw error;
    },
    onSuccess: (_, v) => {
      queryClient.invalidateQueries({ queryKey: ['lawyer-cases'] });
      queryClient.invalidateQueries({ queryKey: ['case-analytics'] });
      setReplyTexts(prev => ({ ...prev, [v.caseId]: '' }));
      setExpandedCase(null);
      toast({ title: v.markAs === 'solved' ? 'Marked Solved ✅' : 'Marked Unsolved ❌' });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const handleLogout = () => {
    sessionStorage.removeItem('lawyer_session');
    navigate('/auth', { replace: true });
  };

  const getCaseTypeName = (id: string) => caseTypes?.find(ct => ct.id === id)?.display_name || 'Unknown';

  if (!lawyer) return null;

  const all = cases || [];
  const pending = all.filter(c => c.status === 'pending');
  const solved = all.filter(c => c.status === 'solved');
  const unsolved = all.filter(c => c.status === 'not_solved');

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container max-w-4xl py-8">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Gavel className="h-9 w-9 text-primary" />
            <div>
              <h1 className="text-2xl font-heading font-bold">{lawyer.name}'s Dashboard</h1>
              <p className="text-sm text-muted-foreground">District: {lawyer.district} · {lawyer.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild><Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> Home</Link></Button>
            <Button variant="ghost" onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <>
            <CaseList
              title="Pending Complaints" icon={<Clock className="h-5 w-5 text-amber-500" />}
              cases={pending} getCaseTypeName={getCaseTypeName}
              expandedCase={expandedCase} setExpandedCase={setExpandedCase}
              replyTexts={replyTexts} setReplyTexts={setReplyTexts}
              onAction={(caseId, reply, markAs) => updateCase.mutate({ caseId, reply, markAs })}
              isPending={updateCase.isPending} showActions
            />
            <CaseList
              title="Solved Cases" icon={<CheckCircle className="h-5 w-5 text-green-600" />}
              cases={solved} getCaseTypeName={getCaseTypeName}
              badgeVariant="secondary" badgeLabel="Solved"
            />
            <CaseList
              title="Unsolved Cases" icon={<XCircle className="h-5 w-5 text-red-500" />}
              cases={unsolved} getCaseTypeName={getCaseTypeName}
              badgeVariant="destructive" badgeLabel="Unsolved"
            />
          </>
        )}
      </div>
    </div>
  );
};

interface CaseListProps {
  title: string; icon: React.ReactNode; cases: any[]; getCaseTypeName: (id: string) => string;
  expandedCase?: string | null; setExpandedCase?: (id: string | null) => void;
  replyTexts?: Record<string, string>; setReplyTexts?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onAction?: (caseId: string, reply: string, markAs: 'solved' | 'not_solved') => void;
  isPending?: boolean; showActions?: boolean;
  badgeVariant?: 'secondary' | 'destructive'; badgeLabel?: string;
}

const CaseList = ({ title, icon, cases, getCaseTypeName, expandedCase, setExpandedCase, replyTexts, setReplyTexts, onAction, isPending, showActions, badgeVariant, badgeLabel }: CaseListProps) => (
  <Card className="shadow-lg mb-6">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-lg">{icon} {title} ({cases.length})</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {cases.length === 0 ? (
        <p className="text-muted-foreground text-center py-4">No {title.toLowerCase()}</p>
      ) : (
        cases.map(c => (
          <div key={c.id} className="p-4 bg-background rounded-lg border space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="space-y-1">
                <p className="font-medium text-sm">{getCaseTypeName(c.case_type_id)}</p>
                <div className="flex gap-2 flex-wrap items-center">
                  {badgeLabel && <Badge variant={badgeVariant}>{badgeLabel}</Badge>}
                  <Badge variant="outline" className="text-xs">{c.language?.toUpperCase()}</Badge>
                  <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span>
                  {c.user_email && <span className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" /> {c.user_email}</span>}
                </div>
              </div>
              {showActions && setExpandedCase && (
                <Button size="sm" variant="outline" onClick={() => setExpandedCase(expandedCase === c.id ? null : c.id)}>
                  <MessageSquare className="mr-1.5 h-4 w-4" /> {expandedCase === c.id ? 'Close' : 'View & Respond'}
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
                <span className="text-xs font-medium text-green-700 dark:text-green-400">Lawyer Reply: </span>{c.admin_reply}
              </div>
            )}
            {showActions && expandedCase === c.id && replyTexts && setReplyTexts && onAction && (
              <div className="space-y-2 pt-2 border-t">
                <Textarea placeholder="Type your response to the user..." value={replyTexts[c.id] || ''}
                  onChange={e => setReplyTexts(prev => ({ ...prev, [c.id]: e.target.value }))}
                  className="min-h-[80px]" />
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => onAction(c.id, replyTexts[c.id] || 'Solved', 'solved')} disabled={isPending}>
                    <CheckCircle className="mr-1.5 h-4 w-4" /> Mark Solved
                  </Button>
                  <Button size="sm" variant="destructive"
                    onClick={() => onAction(c.id, replyTexts[c.id] || 'Unsolved', 'not_solved')} disabled={isPending}>
                    <XCircle className="mr-1.5 h-4 w-4" /> Mark Unsolved
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

export default LawyerDashboard;
