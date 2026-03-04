import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MessageCircle, Paperclip, Shield, X } from 'lucide-react';
import { EvidenceLocker } from './EvidenceLocker';

export const Contact = () => {
  const { t } = useTranslation();
  const [showEvidence, setShowEvidence] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  const handleAttachEvidence = (files: File[]) => {
    setAttachedFiles(files);
  };

  const handleSendMail = () => {
    const subject = encodeURIComponent('Legal Complaint with Evidence - Lawmate');
    const body = encodeURIComponent(
      `Dear Sir/Madam,\n\nI am writing to report a legal issue that requires your attention.\n\n` +
      (attachedFiles.length > 0
        ? `I have ${attachedFiles.length} evidence file(s) to submit:\n${attachedFiles.map(f => `- ${f.name}`).join('\n')}\n\n`
        : '') +
      `Please take necessary action.\n\nRegards`
    );
    window.open(`mailto:awaisahmedmbnr@outlook.com?subject=${subject}&body=${body}`, '_self');
  };

  return (
    <section id="contact" className="py-20 bg-muted/30">
      <div className="container max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            {t('contact.title')}
          </h2>
          <p className="text-xl text-muted-foreground">
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Head of Area Contact */}
          <Card className="shadow-lg hover-lift">
            <CardHeader className="bg-gradient-hero text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                {t('contact.headTitle')}
              </CardTitle>
              <CardDescription className="text-white/80">
                {t('contact.headDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                {t('contact.headNote')}
              </p>
              <Button className="w-full" size="lg" asChild>
                <a href="tel:+918897166877">
                  <Phone className="mr-2 h-5 w-5" />
                  {t('contact.callHead')}
                </a>
              </Button>
              <p className="text-center text-sm font-semibold">+91 8897166877</p>

              {/* Mail with Evidence */}
              <div className="border-t pt-4 space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  size="lg"
                  onClick={() => setShowEvidence(!showEvidence)}
                >
                  <Paperclip className="mr-2 h-5 w-5" />
                  {showEvidence
                    ? t('contact.hideEvidence', 'Hide Evidence Locker')
                    : t('contact.attachEvidence', 'Attach Evidence & Mail')}
                </Button>

                {attachedFiles.length > 0 && (
                  <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                    <p className="text-xs font-medium flex items-center gap-1">
                      <Shield className="h-3 w-3 text-green-600" />
                      {attachedFiles.length} file(s) attached
                    </p>
                    {attachedFiles.map((f, i) => (
                      <div key={i} className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="truncate">{f.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0"
                          onClick={() => setAttachedFiles(prev => prev.filter((_, idx) => idx !== i))}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleSendMail}
                >
                  <Mail className="mr-2 h-5 w-5" />
                  {t('contact.sendMail', 'Send Mail to Authority')}
                </Button>
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
              <CardDescription className="text-white/80">
                {t('contact.otherDescription', 'Additional ways to reach us')}
              </CardDescription>
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

        {/* Evidence Locker - shown when toggled */}
        {showEvidence && (
          <div className="mt-6 animate-fade-in">
            <EvidenceLocker onFilesChanged={handleAttachEvidence} />
          </div>
        )}
      </div>
    </section>
  );
};
