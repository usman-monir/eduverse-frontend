import DashboardLayout from '@/components/Layout/DashboardLayout';

const Messages = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6 flex justify-center">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Messages</h1>
          <p className="text-yellow-600">In development yet!</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Messages;
