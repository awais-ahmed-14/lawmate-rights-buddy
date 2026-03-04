import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, CheckCircle, Users, Loader2 } from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const COLORS = [
  'hsl(222, 73%, 32%)',
  'hsl(48, 96%, 56%)',
  'hsl(160, 60%, 45%)',
  'hsl(340, 65%, 50%)',
  'hsl(200, 70%, 50%)',
  'hsl(280, 55%, 55%)',
  'hsl(30, 80%, 55%)',
  'hsl(120, 50%, 40%)',
];

const chartConfig = {
  solved: { label: 'Solved Cases', color: 'hsl(160, 60%, 45%)' },
  total: { label: 'Total Cases', color: 'hsl(222, 73%, 32%)' },
};

export const DataAnalysis = () => {
  const { t } = useTranslation();

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['case-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('case_analytics')
        .select('*');
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000,
  });

  const caseData = (analytics || []).map((item: any) => ({
    type: item.display_name,
    total: Number(item.total_cases),
    solved: Number(item.solved_cases),
    percentage: Number(item.success_rate),
  }));

  const totalCases = caseData.reduce((sum, c) => sum + c.total, 0);
  const totalSolved = caseData.reduce((sum, c) => sum + c.solved, 0);
  const overallRate = totalCases > 0 ? Math.round((totalSolved / totalCases) * 100) : 0;

  if (isLoading) {
    return (
      <section id="data-analysis" className="py-20 bg-muted/30">
        <div className="container max-w-6xl flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  return (
    <section id="data-analysis" className="py-20 bg-muted/30">
      <div className="container max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            {t('dataAnalysis.title', 'Case Impact & Analytics')}
          </h2>
          <p className="text-xl text-muted-foreground">
            {t('dataAnalysis.subtitle', 'Real-time effectiveness of Lawmate in solving legal cases')}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <Card className="hover-lift">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-3xl font-bold text-primary">{totalCases.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">{t('dataAnalysis.totalCases', 'Total Cases')}</p>
            </CardContent>
          </Card>
          <Card className="hover-lift">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-3xl font-bold text-green-600">{totalSolved.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">{t('dataAnalysis.solvedCases', 'Cases Solved')}</p>
            </CardContent>
          </Card>
          <Card className="hover-lift">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-3xl font-bold text-primary">{overallRate}%</p>
              <p className="text-sm text-muted-foreground">{t('dataAnalysis.successRate', 'Success Rate')}</p>
            </CardContent>
          </Card>
          <Card className="hover-lift">
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-accent" />
              <p className="text-3xl font-bold gradient-text">{caseData.length}</p>
              <p className="text-sm text-muted-foreground">{t('dataAnalysis.categories', 'Case Categories')}</p>
            </CardContent>
          </Card>
        </div>

        {caseData.length > 0 && totalCases > 0 ? (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Bar Chart */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">{t('dataAnalysis.barTitle', 'Cases by Category')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <BarChart data={caseData} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <XAxis type="number" />
                    <YAxis dataKey="type" type="category" width={100} tick={{ fontSize: 11 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="total" fill="hsl(222, 73%, 32%)" radius={[0, 4, 4, 0]} name="Total" />
                    <Bar dataKey="solved" fill="hsl(160, 60%, 45%)" radius={[0, 4, 4, 0]} name="Solved" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Pie Chart */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">{t('dataAnalysis.pieTitle', 'Success Rate by Category')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <PieChart>
                    <Pie
                      data={caseData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="solved"
                      nameKey="type"
                      label={({ type, percentage }) => `${percentage}%`}
                    >
                      {caseData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {caseData.map((item, i) => (
                    <div key={item.type} className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-muted-foreground">{item.type}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="shadow-lg">
            <CardContent className="p-12 text-center">
              <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-lg text-muted-foreground">
                {t('dataAnalysis.noData', 'No case data yet. Start using Lawmate AI to see real-time analytics here!')}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Detailed Table */}
        {caseData.length > 0 && totalCases > 0 && (
          <Card className="shadow-lg mt-8">
            <CardHeader>
              <CardTitle className="text-lg">{t('dataAnalysis.tableTitle', 'Detailed Case Statistics')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">{t('dataAnalysis.caseType', 'Case Type')}</th>
                      <th className="text-center py-3 px-4 font-semibold">{t('dataAnalysis.totalLabel', 'Total')}</th>
                      <th className="text-center py-3 px-4 font-semibold">{t('dataAnalysis.solvedLabel', 'Solved')}</th>
                      <th className="text-center py-3 px-4 font-semibold">{t('dataAnalysis.rateLabel', 'Success %')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {caseData.map((item, i) => (
                      <tr key={item.type} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-3 px-4 flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          {item.type}
                        </td>
                        <td className="text-center py-3 px-4">{item.total}</td>
                        <td className="text-center py-3 px-4 text-green-600 font-medium">{item.solved}</td>
                        <td className="text-center py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {item.percentage}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
};
