import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/AppLayout';
import { DataAnalysis } from '@/components/DataAnalysis';

const AnalysisPage = () => {
  const { t } = useTranslation();
  return (
    <AppLayout title={t('sidebar.pageAnalysis')}>
      <div className="max-w-5xl mx-auto">
        <DataAnalysis />
      </div>
    </AppLayout>
  );
};

export default AnalysisPage;
