import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, MapPin, Send, Users, Gavel, Mail, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';

const DISTRICTS = [
  'Hyderabad', 'Ranga Reddy', 'Warangal', 'Karimnagar', 'Nizamabad',
  'Khammam', 'Nalgonda', 'Mahabubnagar', 'Medak', 'Adilabad',
];

interface ApprovedLawyer {
  id: string;
  name: string;
  email: string;
  phone: string;
  district: string;
}

export const Contact = () => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedLawyerId, setSelectedLawyerId] = useState<string>('');
  const [complaint, setComplaint] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [lawyers, setLawyers] = useState<ApprovedLawyer[]>([]);
  const [caseTopic, setCaseTopic] = useState('');

  useEffect(() => {
    setCaseTopic(localStorage.getItem('lawmate_case_topic') || '');
  }, []);

  useEffect(() => {
    if (profile) {
      setUserEmail(profile.email || '');
      setUserPhone((profile as any).phone || '');
    }
  }, [profile]);

  useEffect(() => {
    const fetchLawyers = async () => {
      const { data } = await supabase
        .from('lawyers')
        .select('id, name, email, phone, district')
        .eq('approved', true);
      if (data) setLawyers(data as ApprovedLawyer[]);
    };
    fetchLawyers();
  }, []);

  const districtLawyers = lawyers.filter(l => l.district === selectedDistrict);

  // Reset selected lawyer when district changes
  useEffect(() => {
    setSelectedLawyerId('');
  }, [selectedDistrict]);

  const submitComplaint = async () => {
    if (!selectedDistrict) {
      toast({ title: 'Please select your district', variant: 'destructive' }); return;
    }
    if (!selectedLawyerId) {
      toast({ title: 'Please select a lawyer', variant: 'destructive' }); return;
    }
    if (!complaint.trim()) {
      toast({ title: 'Please describe your complaint', variant: 'destructive' }); return;
    }
    if (!userPhone.trim() || !/^\+?[\d\s-]{7,15}$/.test(userPhone.trim())) {
      toast({ title: 'Valid phone number required', variant: 'destructive' }); return;
    }
    if (!userEmail.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(userEmail.trim())) {
      toast({ title: 'Valid email required', variant: 'destructive' }); return;
    }
    const topic = caseTopic || complaint.slice(0, 50) || 'Legal Complaint';
    setIsSending(true);
    try {
      const caseTypeName = topic.toLowerCase().replace(/\s+/g, '_').slice(0, 60);
      const { data: existingType } = await supabase.from('case_types').select('id').eq('name', caseTypeName).maybeSingle();

      let caseTypeId: string;
      if (existingType) {
        caseTypeId = existingType.id;
      } else {
        const displayName = topic.replace(/\b\w/g, (c: string) => c.toUpperCase());
        const { data: newType, error: insertErr } = await supabase.from('case_types').insert({ name: caseTypeName, display_name: displayName }).select('id').single();
        if (insertErr) throw insertErr;
        caseTypeId = newType!.id;
      }

      const userEmail = profile?.email || '';

      // Dedup guard: prevent same user + case_type within last 24h
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: dup } = await supabase
        .from('case_records')
        .select('id')
        .eq('case_type_id', caseTypeId)
        .eq('user_email', userEmail)
        .gte('created_at', since)
        .maybeSingle();

      if (dup) {
        toast({
          title: 'Similar complaint already filed',
          description: 'You already filed a complaint of this type within the last 24 hours. Your lawyer will respond soon.',
        });
        setIsSending(false);
        return;
      }

      const { error: insertCaseErr } = await (supabase.from as any)('case_records').insert({
        case_type_id: caseTypeId,
        status: 'pending',
        language: i18n.language || 'en',
        user_message: complaint,
        user_email: userEmail,
        assigned_lawyer_id: selectedLawyerId,
      });
      if (insertCaseErr) throw insertCaseErr;

      queryClient.invalidateQueries({ queryKey: ['case-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['lawyer-cases'] });

      toast({
        title: 'Complaint Sent ✅',
        description: 'Your complaint has been delivered to the selected lawyer.',
      });

      localStorage.removeItem('lawmate_case_topic');
      setCaseTopic('');
      setComplaint('');
      setSelectedLawyerId('');
    } catch (err: any) {
      console.error('Complaint submit error:', err);
      toast({ title: 'Error', description: err.message || 'Failed to send complaint.', variant: 'destructive' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section id="contact" className="py-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-heading font-bold mb-2">
          <MapPin className="inline h-7 w-7 text-primary mr-2" />
          {t('contact.title', 'Need Legal Help?')}
        </h2>
        <p className="text-muted-foreground">
          Select your district, choose a verified lawyer, and submit your complaint directly.
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-hero text-primary-foreground rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" /> File a Complaint
          </CardTitle>
          <CardDescription className="text-primary-foreground/80">
            Choose district → Select lawyer → Write complaint → Send
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Step 1 */}
          <div>
            <label className="text-sm font-medium mb-2 block">Step 1: Select District</label>
            <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
              <SelectTrigger><SelectValue placeholder="Choose a Telangana district..." /></SelectTrigger>
              <SelectContent>
                {DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {selectedDistrict && (
            <>
              {/* Step 2: Lawyer */}
              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Users className="h-4 w-4" /> Step 2: Select Lawyer for {selectedDistrict}
                </label>
                {districtLawyers.length === 0 ? (
                  <div className="bg-muted/50 border border-dashed rounded-lg p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      No approved lawyers in {selectedDistrict} yet. Please try another district or check back later.
                    </p>
                  </div>
                ) : (
                  <Select value={selectedLawyerId} onValueChange={setSelectedLawyerId}>
                    <SelectTrigger><SelectValue placeholder="Choose a verified lawyer..." /></SelectTrigger>
                    <SelectContent>
                      {districtLawyers.map(l => (
                        <SelectItem key={l.id} value={l.id}>
                          <div className="flex items-center gap-2">
                            <Gavel className="h-3.5 w-3.5 text-primary" />
                            <span>{l.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Step 3: Complaint */}
              {districtLawyers.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Step 3: Describe Your Complaint</label>
                  {caseTopic && (
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-3">
                      <p className="text-xs text-muted-foreground mb-1">Detected Case Topic:</p>
                      <p className="font-semibold text-primary text-sm">{caseTopic}</p>
                    </div>
                  )}
                  <Textarea
                    placeholder="Describe your complaint in detail..."
                    value={complaint}
                    onChange={e => setComplaint(e.target.value)}
                    className="min-h-[140px]"
                    maxLength={2000}
                  />
                  <p className="text-[11px] text-muted-foreground mt-1 text-right">{complaint.length}/2000</p>
                </div>
              )}

              {profile && districtLawyers.length > 0 && (
                <div className="bg-muted/50 p-3 rounded-lg text-xs space-y-1">
                  <p><strong>From:</strong> {profile.full_name || profile.email}</p>
                  <p><strong>Email:</strong> {profile.email}</p>
                </div>
              )}

              {districtLawyers.length > 0 && (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={submitComplaint}
                  disabled={isSending || !complaint.trim() || !selectedLawyerId}
                >
                  {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  Send Complaint to Lawyer
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
};
