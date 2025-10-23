import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Scale, Bird, Shield, Church, BookOpen, Gavel } from 'lucide-react';

const rights = [
  { key: 'equality', icon: Scale, gradient: 'from-blue-500 to-blue-600' },
  { key: 'freedom', icon: Bird, gradient: 'from-green-500 to-green-600' },
  { key: 'exploitation', icon: Shield, gradient: 'from-red-500 to-red-600' },
  { key: 'religion', icon: Church, gradient: 'from-purple-500 to-purple-600' },
  { key: 'cultural', icon: BookOpen, gradient: 'from-orange-500 to-orange-600' },
  { key: 'remedies', icon: Gavel, gradient: 'from-amber-500 to-amber-600' },
];

export const FundamentalRights = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section id="rights" className="py-20 bg-gradient-hero text-white">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            {t('rights.title')}
          </h2>
          <p className="text-xl text-white/90">
            {t('rights.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rights.map((right) => (
            <Card 
              key={right.key}
              className="hover-lift bg-white/10 backdrop-blur border-white/20 text-white cursor-pointer transition-transform hover:scale-105"
              onClick={() => navigate(`/right/${right.key}`)}
            >
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${right.gradient} flex items-center justify-center mb-3 shadow-lg`}>
                  <right.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">
                  {t(`rights.${right.key}.title`)}
                </CardTitle>
                <CardDescription className="text-white/70 text-sm">
                  {t(`rights.${right.key}.articles`)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-white/80 text-sm">
                  {t(`rights.${right.key}.description`)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
