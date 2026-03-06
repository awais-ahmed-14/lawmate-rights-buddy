import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, ArrowLeft, Shield, Lock, Loader2, Mail, MessageSquare, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

const ADMIN_PASSWORD_1 = 'lawmate2026';
const ADMIN_PASSWORD_2 = 'admin@secure';

const AdminPanel = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [authenticated, setAuthenticated] = useState(false);
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [expandedCase, setExpandedCase] = useState<string | null>(null);

  const { data: cases, isLoading } = useQuery({
    queryKey: ['admin-cases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('case_records')
        .select('id, status, language, created_at, resolved_at, case_type_id, user_message, user_email, admin_reply')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: authenticated,
  });

  const { data: caseTypes } = useQuery({
    queryKey: ['admin-case-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('case_types')
        .select('id, display_name');
      if (error) throw error;
      return data || [];
    },
    enabled: authenticated,
  });

  const sendReply = useMutation({
    mutationFn: async ({ caseId, reply, markAs }: { caseId: string; reply: string; markAs?: 'solved' | 'not_solved' }) => {
      const updateData: any = { admin_reply: reply };
      if (markAs === 'solved') {
        updateData.status = 'solved';
        updateData.resolved_at = new Date().toISOString();
      } else if (markAs === 'not_solved') {
        updateData.status = 'not_solved';
      }
      const { error } = await supabase
        .from('case_records')
        .update(updateData)
        .eq('id', caseId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-cases'] });
      queryClient.invalidateQueries({ queryKey: ['case-analytics'] });
      setReplyTexts(prev => ({ ...prev, [variables.caseId]: '' }));
      setExpandedCase(null);
      const msg = variables.markAs === 'solved'
        ? 'Case Marked as Solved ✅'
        : variables.markAs === 'not_solved'
        ? 'Case Marked as Not Solved ❌'
        : 'Reply Sent';
      toast({ title: msg });
    },
  });

  const getCaseTypeName = (id: string) =>
    caseTypes?.find((ct) => ct.id === id)?.display_name || 'Unknown';

  const handleLogin = () => {
    if (password1 === ADMIN_PASSWORD_1 && password2 === ADMIN_PASSWORD_2) {
      setAuthenticated(true);
    } else {
      toast({ title: 'Access Denied', description: 'One or both passwords are incorrect.', variant: 'destructive' });
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-sm shadow-lg">
          <CardHeader className="text-center">
            <Lock className="h-10 w-10 mx-auto mb-2 text-primary" />
            <CardTitle>Admin Access</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Dual-password authentication required</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Password 1</label>
              <Input
                type="password"
                placeholder="Enter first password"
                value={password1}
                onChange={(e) => setPassword1(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Password 2</label>
              <Input
                type="password"
                placeholder="Enter second password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }}
              />
            </div>
            <Button className="w-full" onClick={handleLogin}>
              <Shield className="mr-2 h-4 w-4" />
              Login
            </Button>
            <Button variant="ghost" className="w-full" asChild>
              <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pendingCases = cases?.filter((c) => c.status === 'pending') || [];
  const solvedCases = cases?.filter((c) => c.status === 'solved') || [];
  const notSolvedCases = cases?.filter((c) => c.status === 'not_solved') || [];

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container max-w-4xl py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-heading font-bold">⚖️ Lawmate Admin Panel</h1>
            <p className="text-sm text-muted-foreground">Review cases and mark as Solved or Not Solved</p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> Home</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Pending Cases */}
            <CaseSection
              title="Pending Cases"
              icon={<Clock className="h-5 w-5 text-amber-500" />}
              cases={pendingCases}
              getCaseTypeName={getCaseTypeName}
              expandedCase={expandedCase}
              setExpandedCase={setExpandedCase}
              replyTexts={replyTexts}
              setReplyTexts={setReplyTexts}
              sendReply={sendReply}
              showActions
            />

            {/* Solved Cases */}
            <CaseSection
              title="Solved Cases"
              icon={<CheckCircle className="h-5 w-5 text-green-600" />}
              cases={solvedCases}
              getCaseTypeName={getCaseTypeName}
              badgeVariant="secondary"
              badgeLabel="Solved"
            />

            {/* Not Solved Cases */}
            <CaseSection
              title="Not Solved Cases"
              icon={<XCircle className="h-5 w-5 text-red-500" />}
              cases={notSolvedCases}
              getCaseTypeName={getCaseTypeName}
              badgeVariant="destructive"
              badgeLabel="Not Solved"
            />
          </>
        )}
      </div>
    </div>
  );
};

interface CaseSectionProps {
  title: string;
  icon: React.ReactNode;
  cases: any[];
  getCaseTypeName: (id: string) => string;
  expandedCase?: string | null;
  setExpandedCase?: (id: string | null) => void;
  replyTexts?: Record<string, string>;
  setReplyTexts?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  sendReply?: any;
  showActions?: boolean;
  badgeVariant?: 'secondary' | 'destructive';
  badgeLabel?: string;
}

const CaseSection = ({
  title, icon, cases, getCaseTypeName,
  expandedCase, setExpandedCase, replyTexts, setReplyTexts, sendReply,
  showActions, badgeVariant, badgeLabel,
}: CaseSectionProps) => (
  <Card className="shadow-lg mb-6">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-lg">
        {icon} {title} ({cases.length})
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {cases.length === 0 ? (
        <p className="text-muted-foreground text-center py-4">No {title.toLowerCase()}</p>
      ) : (
        cases.slice(0, showActions ? undefined : 20).map((c) => (
          <div key={c.id} className="p-4 bg-background rounded-lg border space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium text-sm">{getCaseTypeName(c.case_type_id)}</p>
                <div className="flex gap-2 flex-wrap">
                  {badgeLabel && <Badge variant={badgeVariant}>{badgeLabel}</Badge>}
                  <Badge variant="outline" className="text-xs">{c.language?.toUpperCase()}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(c.created_at).toLocaleDateString()}
                  </span>
                  {c.user_email && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {c.user_email}
                    </span>
                  )}
                </div>
              </div>
              {showActions && setExpandedCase && (
                <Button size="sm" variant="outline" onClick={() => setExpandedCase(expandedCase === c.id ? null : c.id)}>
                  <MessageSquare className="mr-1.5 h-4 w-4" />
                  {expandedCase === c.id ? 'Close' : 'View & Reply'}
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
                <span className="text-xs font-medium text-green-700 dark:text-green-400">Admin Reply: </span>
                {c.admin_reply}
              </div>
            )}

            {showActions && expandedCase === c.id && replyTexts && setReplyTexts && sendReply && (
              <div className="space-y-2 pt-2 border-t">
                <Textarea
                  placeholder="Type your reply..."
                  value={replyTexts[c.id] || ''}
                  onChange={(e) => setReplyTexts(prev => ({ ...prev, [c.id]: e.target.value }))}
                  className="min-h-[80px]"
                />
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" onClick={() => sendReply.mutate({ caseId: c.id, reply: replyTexts[c.id] || '' })} disabled={!replyTexts[c.id]?.trim() || sendReply.isPending}>
                    <Send className="mr-1.5 h-4 w-4" /> Send Reply
                  </Button>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => sendReply.mutate({ caseId: c.id, reply: 'Solved', markAs: 'solved' })} disabled={sendReply.isPending}>
                    <CheckCircle className="mr-1.5 h-4 w-4" /> Mark Solved
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => sendReply.mutate({ caseId: c.id, reply: 'Not Solved', markAs: 'not_solved' })} disabled={sendReply.isPending}>
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
