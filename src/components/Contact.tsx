import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Loader2, MapPin, Send, Users, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';

const AUTHORITY_EMAIL = 'awaisahmedmbnr@outlook.com';

const DISTRICTS = [
  'Hyderabad', 'Ranga Reddy', 'Warangal', 'Karimnagar', 'Nizamabad',
  'Khammam', 'Nalgonda', 'Mahabubnagar', 'Medak', 'Adilabad',
];

interface ApprovedLawyer {
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
  const [complaint, setComplaint] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [lawyers, setLawyers] = useState<ApprovedLawyer[]>([]);
  const [caseTopic, setCaseTopic] = useState('');

  useEffect(() => {
    const topic = localStorage.getItem('lawmate_case_topic') || '';
    setCaseTopic(topic);
    const interval = setInterval(() => {
      const t = localStorage.getItem('lawmate_case_topic') || '';
      if (t !== caseTopic) setCaseTopic(t);
    }, 2000);
    return () => clearInterval(interval);
  }, [caseTopic]);

  useEffect(() => {
    const fetchLawyers = async () => {
      const { data } = await supabase
        .from('lawyers')
        .select('name, email, phone, district')
        .eq('approved', true);
      if (data) setLawyers(data as ApprovedLawyer[]);
    };
    fetchLawyers();
  }, []);

  const districtLawyers = lawyers.filter(l => l.district === selectedDistrict);

  const registerCaseAndSendMail = async (targetEmail: string, targetName?: string) => {
    if (!complaint.trim()) {
      toast({ title: 'Please enter your complaint', variant: 'destructive' });
      return;
    }
    const topic = caseTopic || complaint.slice(0, 50) || 'Legal Complaint';
    setIsSending(true);
    try {
      const caseTypeName = topic.toLowerCase().replace(/\s+/g, '_');
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
      const userPhone = profile?.phone || '';

      await supabase.from('case_records').insert({
        case_type_id: caseTypeId,
        status: 'pending',
        language: i18n.language || 'en',
        user_message: complaint || `Case filed regarding: ${topic}`,
        user_email: userEmail,
      });

      queryClient.invalidateQueries({ queryKey: ['case-analytics'] });

      toast({
        title: t('contact.caseRegistered', 'Case Registered ✅'),
        description: t('contact.caseRegisteredDesc', 'Your case has been registered. Mail is opening now.'),
      });

      const recipient = targetName || 'Sir/Madam';
      const subject = encodeURIComponent(`Legal Complaint - ${selectedDistrict} - ${topic}`);
      const body = encodeURIComponent(
        `Dear ${recipient},\n\nDistrict: ${selectedDistrict}\n\nI am writing to report a legal issue regarding: ${topic}\n\nComplaint Details:\n${complaint}\n\nContact Details:\nEmail: ${userEmail}\nPhone: ${userPhone}\nName: ${profile?.full_name || 'N/A'}\n\nPlease take necessary action.\n\nRegards`
      );
      window.open(`mailto:${targetEmail}?subject=${subject}&body=${body}`, '_self');

      localStorage.removeItem('lawmate_case_topic');
      setCaseTopic('');
      setComplaint('');
    } catch (err: any) {
      console.error('Case registration error:', err);
      toast({ title: 'Error', description: 'Failed to register case.', variant: 'destructive' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-muted/30">
      <div className="container max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            <MapPin className="inline h-8 w-8 text-primary mr-2" />
            {t('contact.title', 'Need Legal Help?')}
          </h2>
          <p className="text-xl text-muted-foreground">
            {t('contact.subtitle', 'Select your district, describe your issue, and send your complaint directly')}
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-hero text-primary-foreground rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {t('contact.selectDistrict', 'Select Your District & File Complaint')}
            </CardTitle>
            <CardDescription className="text-primary-foreground/80">
              {t('contact.flowDesc', 'Choose district → Write complaint → Send to assigned lawyer or authority')}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Step 1: District Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Step 1: Select District</label>
              <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a Telangana district..." />
                </SelectTrigger>
                <SelectContent>
                  {DISTRICTS.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedDistrict && (
              <>
                {/* Step 2: Complaint */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Step 2: Describe Your Complaint</label>
                  {caseTopic && (
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-3">
                      <p className="text-xs text-muted-foreground mb-1">Detected Case Topic:</p>
                      <p className="font-semibold text-primary text-sm">{caseTopic}</p>
                    </div>
                  )}
                  <Textarea
                    placeholder={t('contact.complaintPlaceholder', 'Describe your complaint in detail...')}
                    value={complaint}
                    onChange={e => setComplaint(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>

                {profile && (
                  <div className="bg-muted/50 p-3 rounded-lg text-xs space-y-1">
                    <p><strong>Your Email:</strong> {profile.email}</p>
                    <p><strong>Your Phone:</strong> {profile.phone || 'Not provided'}</p>
                  </div>
                )}

                {/* Step 3: Send */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Step 3: Send Complaint</label>
                  <div className="space-y-4">
                    {/* Authority Contact */}
                    <Card className="border-2 border-primary/20">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                          <Mail className="h-4 w-4 text-primary" /> District Authority
                        </h4>
                        <p className="text-xs text-muted-foreground mb-3">{AUTHORITY_EMAIL}</p>
                        <Button
                          className="w-full"
                          onClick={() => registerCaseAndSendMail(AUTHORITY_EMAIL)}
                          disabled={isSending || !complaint.trim()}
                        >
                          {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                          Send to District Authority
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Approved Lawyers */}
                    {districtLawyers.length > 0 && (
                      <Card className="border-2 border-accent/20">
                        <CardContent className="p-4">
                          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                            <Users className="h-4 w-4 text-accent-foreground" /> Approved Lawyers for {selectedDistrict}
                          </h4>
                          <div className="space-y-3">
                            {districtLawyers.map((lawyer, i) => (
                              <div key={i} className="p-3 bg-muted/50 rounded-lg flex items-center justify-between gap-3 flex-wrap">
                                <div>
                                  <p className="font-medium text-sm">{lawyer.name}</p>
                                  <p className="text-xs text-muted-foreground">{lawyer.email} · {lawyer.phone}</p>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => registerCaseAndSendMail(lawyer.email, lawyer.name)}
                                    disabled={isSending || !complaint.trim()}
                                  >
                                    <Mail className="h-3 w-3 mr-1" /> Send Mail
                                  </Button>
                                  <Button size="sm" variant="outline" asChild>
                                    <a href={`tel:+91${lawyer.phone}`}><Phone className="h-3 w-3" /></a>
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {districtLawyers.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-2">
                        No approved lawyers for {selectedDistrict} yet. Send your complaint to the district authority above.
                      </p>
                    )}
                  </div>
                </div>

                {!complaint.trim() && (
                  <p className="text-xs text-muted-foreground text-center">
                    Tip: Ask the AI assistant about your issue first — the case topic will auto-fill here.
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
