import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Briefcase, Home, Shield } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const scenarios = [
  { 
    key: 'police', 
    icon: AlertCircle,
    color: 'text-red-600'
  },
  { 
    key: 'discrimination', 
    icon: Briefcase,
    color: 'text-blue-600'
  },
  { 
    key: 'eviction', 
    icon: Home,
    color: 'text-green-600'
  },
  { 
    key: 'harassment', 
    icon: Shield,
    color: 'text-purple-600'
  },
];

export const Scenarios = () => {
  const { t } = useTranslation();

  return (
    <section id="scenarios" className="py-20">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            {t('scenarios.title')}
          </h2>
          <p className="text-xl text-muted-foreground">
            {t('scenarios.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {scenarios.map((scenario) => (
            <Dialog key={scenario.key}>
              <DialogTrigger asChild>
                <Card className="hover-lift cursor-pointer border-2 hover:border-primary transition-all">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <scenario.icon className={`h-6 w-6 ${scenario.color}`} />
                      <span>{t(`scenarios.${scenario.key}.title`)}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {t(`scenarios.${scenario.key}.description`)}
                    </p>
                  </CardContent>
                </Card>
              </DialogTrigger>

              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3 text-2xl">
                    <scenario.icon className={`h-7 w-7 ${scenario.color}`} />
                    {t(`scenarios.${scenario.key}.title`)}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  <div className="p-4 bg-primary/10 rounded-lg">
                    <h4 className="font-semibold text-primary mb-2">📜 Relevant Right</h4>
                    <p>{t(`scenarios.${scenario.key}.right`)}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">💡 Guidance</h4>
                    <p className="text-muted-foreground">{t(`scenarios.${scenario.key}.guidance`)}</p>
                  </div>

                  <div className="p-4 bg-accent/10 rounded-lg">
                    <h4 className="font-semibold text-accent-foreground mb-2">⚖️ Real Example</h4>
                    <p className="text-sm">{t(`scenarios.${scenario.key}.example`)}</p>
                  </div>

                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">👉 Next Steps</h4>
                    <p className="text-sm">{t(`scenarios.${scenario.key}.action`)}</p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </div>
    </section>
  );
};
