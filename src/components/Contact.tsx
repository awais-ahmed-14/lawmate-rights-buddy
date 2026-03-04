import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MessageCircle } from 'lucide-react';
import { EvidenceLocker } from './EvidenceLocker';

export const Contact = () => {
  const { t } = useTranslation();

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
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-4">
                {t('contact.headNote')}
              </p>
              <Button 
                className="w-full" 
                size="lg"
                asChild
              >
                <a href="tel:+918897166877">
                  <Phone className="mr-2 h-5 w-5" />
                  {t('contact.callHead')}
                </a>
              </Button>
              <p className="text-center text-sm font-semibold mt-3">
                +91 8897166877
              </p>
            </CardContent>
          </Card>

          {/* Other Contact Options */}
          <Card className="shadow-lg hover-lift">
            <CardHeader className="bg-gradient-hero text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Other Contact Options
              </CardTitle>
              <CardDescription className="text-white/80">
                Additional ways to reach us
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <Button 
                variant="outline" 
                className="w-full" 
                size="lg"
                asChild
              >
                <a href="mailto:awaisahmedmbnr@outlook.com">
                  <Mail className="mr-2 h-5 w-5" />
                  {t('contact.email')}
                </a>
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                size="lg"
                asChild
              >
                <a href="tel:1800123456">
                  <Phone className="mr-2 h-5 w-5" />
                  {t('contact.callSupport')}
                </a>
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                size="lg"
                asChild
              >
                <a href="https://wa.me/918897166877" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  {t('contact.whatsapp')}
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Evidence Locker */}
        <div className="mt-8">
          <EvidenceLocker />
        </div>
      </div>
    </section>
  );
};
