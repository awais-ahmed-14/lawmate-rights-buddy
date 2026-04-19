import { AppLayout } from '@/components/AppLayout';
import { Contact } from '@/components/Contact';

const ComplaintPage = () => (
  <AppLayout title="File a Complaint">
    <div className="max-w-4xl mx-auto">
      <Contact />
    </div>
  </AppLayout>
);

export default ComplaintPage;
