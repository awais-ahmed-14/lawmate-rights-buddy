import { AppLayout } from '@/components/AppLayout';
import { Chatbot } from '@/components/Chatbot';
import { FundamentalRights } from '@/components/FundamentalRights';

const AssistantPage = () => (
  <AppLayout title="AI Legal Assistant">
    <div className="space-y-6 max-w-5xl mx-auto">
      <Chatbot />
      <FundamentalRights />
    </div>
  </AppLayout>
);

export default AssistantPage;
