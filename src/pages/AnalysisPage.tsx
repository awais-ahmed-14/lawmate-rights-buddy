import { AppLayout } from '@/components/AppLayout';
import { DataAnalysis } from '@/components/DataAnalysis';

const AnalysisPage = () => (
  <AppLayout title="Case Analysis">
    <div className="max-w-5xl mx-auto">
      <DataAnalysis />
    </div>
  </AppLayout>
);

export default AnalysisPage;
