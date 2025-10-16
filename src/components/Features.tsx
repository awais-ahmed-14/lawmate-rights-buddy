import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Bot, Map, Globe } from 'lucide-react';

const features = [
  { 
    icon: BookOpen, 
    key: 'learn',
    gradient: 'from-blue-500 to-blue-600'
  },
  { 
    icon: Bot, 
    key: 'chatbot',
    gradient: 'from-purple-500 to-purple-600'
  },
  { 
    icon: Map, 
    key: 'scenarios',
    gradient: 'from-green-500 to-green-600'
  },
  { 
    icon: Globe, 
    key: 'multilingual',
    gradient: 'from-orange-500 to-orange-600'
  },
];

export const Features = () => {
  const { t } = useTranslation();

  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            {t('features.title')}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Card 
              key={feature.key}
              className="hover-lift border-none shadow-md bg-card"
            >
              <CardContent className="p-6 text-center space-y-4">
                <div className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-heading font-semibold">
                  {t(`features.cards.${feature.key}.title`)}
                </h3>
                <p className="text-muted-foreground">
                  {t(`features.cards.${feature.key}.description`)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
