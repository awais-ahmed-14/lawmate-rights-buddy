import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/AppLayout';
import { Contact } from '@/components/Contact';

const ComplaintPage = () => {
  const { t } = useTranslation();
  return (
    <AppLayout title={t('sidebar.pageComplaint')}>
      <div className="max-w-4xl mx-auto">
        <Contact />
      </div>
    </AppLayout>
  );
};

export default ComplaintPage;
