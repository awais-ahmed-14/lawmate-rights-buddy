import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Scale, Bird, Shield, Church, BookOpen, Gavel } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const rightIcons = {
  equality: Scale,
  freedom: Bird,
  exploitation: Shield,
  religion: Church,
  cultural: BookOpen,
  remedies: Gavel,
};

const rightGradients = {
  equality: 'from-blue-500 to-blue-600',
  freedom: 'from-green-500 to-green-600',
  exploitation: 'from-red-500 to-red-600',
  religion: 'from-purple-500 to-purple-600',
  cultural: 'from-orange-500 to-orange-600',
  remedies: 'from-amber-500 to-amber-600',
};

export default function RightDetail() {
  const { rightKey } = useParams<{ rightKey: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (!rightKey || !rightIcons[rightKey as keyof typeof rightIcons]) {
    navigate('/');
    return null;
  }

  const Icon = rightIcons[rightKey as keyof typeof rightIcons];
  const gradient = rightGradients[rightKey as keyof typeof rightGradients];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-20 bg-muted/30">
        <div className="container max-w-4xl">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>

          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-hero text-white">
              <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg`}>
                <Icon className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-3xl mb-2">
                {t(`rights.${rightKey}.title`)}
              </CardTitle>
              <p className="text-white/90 text-lg">
                {t(`rights.${rightKey}.articles`)}
              </p>
            </CardHeader>
            <CardContent className="p-8">
              <div className="prose prose-lg max-w-none">
                <h3 className="text-2xl font-semibold mb-4">Overview</h3>
                <p className="text-muted-foreground text-lg mb-6">
                  {t(`rights.${rightKey}.description`)}
                </p>

                <h3 className="text-2xl font-semibold mb-4">Detailed Explanation</h3>
                <p className="text-muted-foreground text-lg mb-6">
                  {t(`rights.${rightKey}.detailed`)}
                </p>

                <h3 className="text-2xl font-semibold mb-4">Key Provisions</h3>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground text-lg mb-6">
                  {t(`rights.${rightKey}.provisions`, { returnObjects: true }) as string[] && 
                    (t(`rights.${rightKey}.provisions`, { returnObjects: true }) as string[]).map((provision: string, index: number) => (
                      <li key={index}>{provision}</li>
                    ))
                  }
                </ul>

                <h3 className="text-2xl font-semibold mb-4">Real-Life Examples</h3>
                <p className="text-muted-foreground text-lg mb-6">
                  {t(`rights.${rightKey}.example`)}
                </p>

                <h3 className="text-2xl font-semibold mb-4">How to Exercise This Right</h3>
                <p className="text-muted-foreground text-lg">
                  {t(`rights.${rightKey}.howTo`)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
