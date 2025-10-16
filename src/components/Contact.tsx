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
              📞 {t('contact.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid md:grid-cols-3 gap-6">
              <a 
                href="tel:+918001234567"
                className="block"
              >
                <Button 
                  size="lg" 
                  className="w-full h-auto flex flex-col items-center gap-3 py-6 bg-green-600 hover:bg-green-700"
                >
                  <Phone className="h-8 w-8" />
                  <span>{t('contact.call')}</span>
                </Button>
              </a>

              <a 
                href="mailto:support@lawmate.in?subject=Legal%20Help%20Request"
                className="block"
              >
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full h-auto flex flex-col items-center gap-3 py-6"
                >
                  <Mail className="h-8 w-8" />
                  <span>{t('contact.email')}</span>
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
                  className="w-full h-auto flex flex-col items-center gap-3 py-6 bg-green-500 hover:bg-green-600"
                >
                  <MessageCircle className="h-8 w-8" />
                  <span>{t('contact.whatsapp')}</span>
                </Button>
              </a>
            </div>

            <div className="mt-8 p-6 bg-accent/10 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">
                <strong>Helpline:</strong> +91 800 123 4567 | <strong>Email:</strong> support@lawmate.in
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
