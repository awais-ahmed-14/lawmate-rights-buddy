import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Clock, ArrowLeft, Shield, Lock, Loader2, Mail, MessageSquare, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

const ADMIN_PASSWORD = 'lawmate2026';

const AdminPanel = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
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
    mutationFn: async ({ caseId, reply }: { caseId: string; reply: string }) => {
      const isSolved = reply.toLowerCase().includes('solved');
      const updateData: any = {
        admin_reply: reply,
      };
      if (isSolved) {
        updateData.status = 'solved';
        updateData.resolved_at = new Date().toISOString();
      }
      const { error } = await supabase
        .from('case_records')
        .update(updateData)
        .eq('id', caseId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      const isSolved = variables.reply.toLowerCase().includes('solved');
      queryClient.invalidateQueries({ queryKey: ['admin-cases'] });
      queryClient.invalidateQueries({ queryKey: ['case-analytics'] });
      setReplyTexts(prev => ({ ...prev, [variables.caseId]: '' }));
      setExpandedCase(null);
      toast({
        title: isSolved ? 'Case Marked as Solved ✅' : 'Reply Sent',
        description: isSolved
          ? 'Data analysis statistics updated automatically.'
          : 'Your reply has been recorded.',
      });
    },
  });

  const getCaseTypeName = (id: string) =>
    caseTypes?.find((ct) => ct.id === id)?.display_name || 'Unknown';

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-sm shadow-lg">
          <CardHeader className="text-center">
            <Lock className="h-10 w-10 mx-auto mb-2 text-primary" />
            <CardTitle>Admin Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (password === ADMIN_PASSWORD) setAuthenticated(true);
                  else toast({ title: 'Incorrect password', variant: 'destructive' });
                }
              }}
            />
            <Button
              className="w-full"
              onClick={() => {
                if (password === ADMIN_PASSWORD) setAuthenticated(true);
                else toast({ title: 'Incorrect password', variant: 'destructive' });
              }}
            >
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

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container max-w-4xl py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-heading font-bold">⚖️ Lawmate Admin Panel</h1>
            <p className="text-sm text-muted-foreground">View case messages & reply with "Solved" to update analytics</p>
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
            <Card className="shadow-lg mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5 text-amber-500" />
                  Pending Cases ({pendingCases.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingCases.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No pending cases</p>
                ) : (
                  pendingCases.map((c) => (
                    <div key={c.id} className="p-4 bg-background rounded-lg border space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="font-medium text-sm">{getCaseTypeName(c.case_type_id)}</p>
                          <div className="flex gap-2 flex-wrap">
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
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setExpandedCase(expandedCase === c.id ? null : c.id)}
                        >
                          <MessageSquare className="mr-1.5 h-4 w-4" />
                          {expandedCase === c.id ? 'Close' : 'View & Reply'}
                        </Button>
                      </div>

                      {/* User message */}
                      {c.user_message && (
                        <div className="bg-muted/50 p-3 rounded-md">
                          <p className="text-xs font-medium text-muted-foreground mb-1">User's Message:</p>
                          <p className="text-sm">{c.user_message}</p>
                        </div>
                      )}

                      {/* Reply area */}
                      {expandedCase === c.id && (
                        <div className="space-y-2 pt-2 border-t">
                          <Textarea
                            placeholder='Type your reply... Include the word "Solved" to mark this case as resolved.'
                            value={replyTexts[c.id] || ''}
                            onChange={(e) => setReplyTexts(prev => ({ ...prev, [c.id]: e.target.value }))}
                            className="min-h-[80px]"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => sendReply.mutate({ caseId: c.id, reply: replyTexts[c.id] || '' })}
                              disabled={!replyTexts[c.id]?.trim() || sendReply.isPending}
                            >
                              <Send className="mr-1.5 h-4 w-4" />
                              Send Reply
                            </Button>
                            <Button
                              size="sm"
                              variant="default"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => sendReply.mutate({ caseId: c.id, reply: 'Solved' })}
                              disabled={sendReply.isPending}
                            >
                              <CheckCircle className="mr-1.5 h-4 w-4" />
                              Mark Solved
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Solved Cases */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Solved Cases ({solvedCases.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {solvedCases.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No solved cases yet</p>
                ) : (
                  solvedCases.slice(0, 20).map((c) => (
                    <div key={c.id} className="p-3 bg-background rounded-lg border space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="font-medium text-sm">{getCaseTypeName(c.case_type_id)}</p>
                          <div className="flex gap-2">
                            <Badge variant="secondary" className="text-xs">Solved</Badge>
                            <span className="text-xs text-muted-foreground">
                              {c.resolved_at && new Date(c.resolved_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      {c.admin_reply && (
                        <div className="bg-green-50 dark:bg-green-950/30 p-2 rounded text-sm">
                          <span className="text-xs font-medium text-green-700 dark:text-green-400">Admin Reply: </span>
                          {c.admin_reply}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
