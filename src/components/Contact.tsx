import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MessageCircle } from 'lucide-react';

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

        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-hero text-white rounded-t-lg">
            <CardTitle className="text-center text-2xl">
              📞 {t('contact.headTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <p className="text-lg font-semibold mb-2">
                {t('contact.headDescription')}
              </p>
              <p className="text-muted-foreground text-sm">
                {t('contact.headNote')}
              </p>
            </div>

            <div className="flex justify-center mb-8">
              <a 
                href="tel:+918897166877"
                className="block w-full max-w-md"
              >
                <Button 
                  size="lg" 
                  className="w-full h-auto flex flex-col items-center gap-4 py-8 text-lg"
                >
                  <Phone className="h-12 w-12" />
                  <div className="flex flex-col items-center">
                    <span className="font-bold">{t('contact.callHead')}</span>
                    <span className="text-sm opacity-90">+91 8897166877</span>
                  </div>
                </Button>
              </a>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <a 
                href="tel:+918001234567"
                className="block"
              >
                <Button 
                  size="lg"
                  variant="outline"
                  className="w-full h-auto flex flex-col items-center gap-3 py-6"
                >
                  <Phone className="h-8 w-8" />
                  <span>{t('contact.callSupport')}</span>
                </Button>
              </a>

              <a 
                href="https://wa.me/918001234567?text=Hi%20Lawmate,%20I%20need%20help"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button 
                  size="lg"
                  variant="outline"
                  className="w-full h-auto flex flex-col items-center gap-3 py-6"
                >
                  <MessageCircle className="h-8 w-8" />
                  <span>{t('contact.whatsapp')}</span>
                </Button>
              </a>
            </div>

            <div className="mt-8 p-6 bg-accent/10 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">
                <strong>Support Helpline:</strong> +91 800 123 4567
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Available: Monday - Saturday, 9 AM - 6 PM IST
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
