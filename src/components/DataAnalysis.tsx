import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, CheckCircle, Users } from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const caseData = [
  { type: 'Police Harassment', total: 1245, solved: 1089, percentage: 87 },
  { type: 'Domestic Violence', total: 892, solved: 756, percentage: 85 },
  { type: 'Workplace Discrimination', total: 634, solved: 521, percentage: 82 },
  { type: 'Landlord/Eviction', total: 478, solved: 412, percentage: 86 },
  { type: 'Women Safety', total: 723, solved: 645, percentage: 89 },
  { type: 'Child Labor', total: 312, solved: 287, percentage: 92 },
];

const totalCases = caseData.reduce((sum, c) => sum + c.total, 0);
const totalSolved = caseData.reduce((sum, c) => sum + c.solved, 0);
const overallRate = Math.round((totalSolved / totalCases) * 100);

const COLORS = [
  'hsl(222, 73%, 32%)',
  'hsl(48, 96%, 56%)',
  'hsl(160, 60%, 45%)',
  'hsl(340, 65%, 50%)',
  'hsl(200, 70%, 50%)',
  'hsl(280, 55%, 55%)',
];

const chartConfig = {
  solved: { label: 'Solved Cases', color: 'hsl(160, 60%, 45%)' },
  total: { label: 'Total Cases', color: 'hsl(222, 73%, 32%)' },
};

export const DataAnalysis = () => {
  const { t } = useTranslation();

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
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-muted-foreground">{item.type}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Table */}
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
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
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
      </div>
    </section>
  );
};
