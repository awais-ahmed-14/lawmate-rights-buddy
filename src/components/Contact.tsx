import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Phone, Mail, MessageCircle, Loader2, Lock, ShieldCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

const CONTACT_PASSWORD = 'lawmate_access';

export const Contact = () => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [caseTopic, setCaseTopic] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [contactUnlocked, setContactUnlocked] = useState(false);
  const [contactPassword, setContactPassword] = useState('');

  useEffect(() => {
    const topic = localStorage.getItem('lawmate_case_topic') || '';
    setCaseTopic(topic);
    const handleStorage = () => setCaseTopic(localStorage.getItem('lawmate_case_topic') || '');
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const topic = localStorage.getItem('lawmate_case_topic') || '';
      if (topic !== caseTopic) setCaseTopic(topic);
    }, 2000);
    return () => clearInterval(interval);
  }, [caseTopic]);

  const handleUnlock = () => {
    if (contactPassword === CONTACT_PASSWORD) {
      setContactUnlocked(true);
      toast({ title: t('contact.unlocked', 'Access Granted ✅'), description: t('contact.unlockedDesc', 'You can now contact the authority.') });
    } else {
      toast({ title: t('contact.wrongPassword', 'Incorrect Password'), variant: 'destructive' });
    }
  };

  const registerCaseAndSendMail = async () => {
    const topic = caseTopic || 'Legal Complaint';
    setIsSending(true);
    try {
      const caseTypeName = topic.toLowerCase().replace(/\s+/g, '_');
      const { data: existingType } = await supabase
        .from('case_types')
        .select('id')
        .eq('name', caseTypeName)
        .maybeSingle();

      let caseTypeId: string;
      if (existingType) {
        caseTypeId = existingType.id;
      } else {
        const displayName = topic.replace(/\b\w/g, (c: string) => c.toUpperCase());
        const { data: newType, error: insertErr } = await supabase
          .from('case_types')
          .insert({ name: caseTypeName, display_name: displayName })
          .select('id')
          .single();
        if (insertErr) throw insertErr;
        caseTypeId = newType!.id;
      }

      await supabase.from('case_records').insert({
        case_type_id: caseTypeId,
        status: 'pending',
        language: i18n.language || 'en',
        user_message: `Case filed regarding: ${topic}`,
      });

      queryClient.invalidateQueries({ queryKey: ['case-analytics'] });

      toast({
        title: t('contact.caseRegistered', 'Case Registered ✅'),
        description: t('contact.caseRegisteredDesc', 'Your case has been registered. Mail is opening now.'),
      });

      const subject = encodeURIComponent(`Legal Complaint - ${topic}`);
      const body = encodeURIComponent(
        `Dear Sir/Madam,\n\nI am writing to report a legal issue regarding: ${topic}\n\nThis case requires your immediate attention.\n\nPlease take necessary action.\n\nRegards`
      );
      window.open(`mailto:awaisahmedmbnr@outlook.com?subject=${subject}&body=${body}`, '_self');

      localStorage.removeItem('lawmate_case_topic');
      setCaseTopic('');
    } catch (err: any) {
      console.error('Case registration error:', err);
      toast({ title: 'Error', description: 'Failed to register case. Please try again.', variant: 'destructive' });
    } finally {
      setIsSending(false);
    }
  };

  // Password gate UI
  if (!contactUnlocked) {
    return (
      <section id="contact" className="py-20 bg-muted/30">
        <div className="container max-w-md">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <Lock className="h-10 w-10 mx-auto mb-2 text-primary" />
              <CardTitle>{t('contact.title')}</CardTitle>
              <CardDescription>{t('contact.passwordRequired', 'Enter the access password to contact the authority.')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="password"
                placeholder={t('contact.enterPassword', 'Enter access password')}
                value={contactPassword}
                onChange={(e) => setContactPassword(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleUnlock(); }}
              />
              <Button className="w-full" onClick={handleUnlock}>
                <ShieldCheck className="mr-2 h-4 w-4" />
                {t('contact.unlock', 'Verify & Access')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="py-20 bg-muted/30">
      <div className="container max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">{t('contact.title')}</h2>
          <p className="text-xl text-muted-foreground">{t('contact.subtitle')}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Head of Area Contact */}
          <Card className="shadow-lg hover-lift">
            <CardHeader className="bg-gradient-hero text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                {t('contact.headTitle')}
              </CardTitle>
              <CardDescription className="text-white/80">{t('contact.headDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {caseTopic && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">{t('contact.detectedTopic', 'Detected Case Topic:')}</p>
                  <p className="font-semibold text-primary text-sm">{caseTopic}</p>
                </div>
              )}
              <p className="text-sm text-muted-foreground">{t('contact.headNote')}</p>
              <Button className="w-full" size="lg" onClick={registerCaseAndSendMail} disabled={isSending}>
                {isSending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Mail className="mr-2 h-5 w-5" />}
                {t('contact.sendMail', 'Send Mail to Authority')}
              </Button>
              {!caseTopic && (
                <p className="text-xs text-muted-foreground text-center">
                  {t('contact.noTopicHint', 'Tip: Ask the AI assistant about your issue first — the case topic will auto-fill here.')}
                </p>
              )}
              <div className="border-t pt-4">
                <Button className="w-full" size="lg" asChild>
                  <a href="tel:+918897166877">
                    <Phone className="mr-2 h-5 w-5" />
                    {t('contact.callHead')}
                  </a>
                </Button>
                <p className="text-center text-sm font-semibold mt-2">+91 8897166877</p>
              </div>
            </CardContent>
          </Card>

          {/* Other Contact Options */}
          <Card className="shadow-lg hover-lift">
            <CardHeader className="bg-gradient-hero text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                {t('contact.otherTitle', 'Other Contact Options')}
              </CardTitle>
              <CardDescription className="text-white/80">{t('contact.otherDescription', 'Additional ways to reach us')}</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <Button variant="outline" className="w-full" size="lg" asChild>
                <a href="mailto:awaisahmedmbnr@outlook.com">
                  <Mail className="mr-2 h-5 w-5" />
                  {t('contact.email')}
                </a>
              </Button>
              <Button variant="outline" className="w-full" size="lg" asChild>
                <a href="tel:1800123456">
                  <Phone className="mr-2 h-5 w-5" />
                  {t('contact.callSupport')}
                </a>
              </Button>
              <Button variant="outline" className="w-full" size="lg" asChild>
                <a href="https://wa.me/918897166877" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  {t('contact.whatsapp')}
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
