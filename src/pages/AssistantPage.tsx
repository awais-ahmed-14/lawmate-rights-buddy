import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/AppLayout';
import { Chatbot } from '@/components/Chatbot';
import { FundamentalRights } from '@/components/FundamentalRights';

const AssistantPage = () => {
  const { t } = useTranslation();
  return (
    <AppLayout title={t('sidebar.pageAssistant')}>
      <div className="space-y-6 max-w-5xl mx-auto">
        <Chatbot />
        <FundamentalRights />
      </div>
    </AppLayout>
  );
};

export default AssistantPage;
