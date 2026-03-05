import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Clock, ArrowLeft, Shield, Lock, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const ADMIN_PASSWORD = 'lawmate2026';

const AdminPanel = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  const { data: cases, isLoading } = useQuery({
    queryKey: ['admin-cases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('case_records')
        .select('id, status, language, created_at, resolved_at, case_type_id')
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

  const markSolved = useMutation({
    mutationFn: async (caseId: string) => {
      const { error } = await supabase
        .from('case_records')
        .update({ status: 'solved', resolved_at: new Date().toISOString() })
        .eq('id', caseId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cases'] });
      queryClient.invalidateQueries({ queryKey: ['case-analytics'] });
      toast({ title: 'Case marked as Solved', description: 'Analytics updated.' });
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
            <p className="text-sm text-muted-foreground">Mark cases as "Solved" to update analytics</p>
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
              <CardContent>
                {pendingCases.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No pending cases</p>
                ) : (
                  <div className="space-y-3">
                    {pendingCases.map((c) => (
                      <div key={c.id} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                        <div className="space-y-1">
                          <p className="font-medium text-sm">{getCaseTypeName(c.case_type_id)}</p>
                          <div className="flex gap-2">
                            <Badge variant="outline" className="text-xs">{c.language?.toUpperCase()}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(c.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => markSolved.mutate(c.id)}
                          disabled={markSolved.isPending}
                        >
                          <CheckCircle className="mr-1.5 h-4 w-4" />
                          Mark Solved
                        </Button>
                      </div>
                    ))}
                  </div>
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
              <CardContent>
                {solvedCases.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No solved cases yet</p>
                ) : (
                  <div className="space-y-2">
                    {solvedCases.slice(0, 20).map((c) => (
                      <div key={c.id} className="flex items-center justify-between p-3 bg-background rounded-lg border">
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
                    ))}
                  </div>
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
