import StatsCards from '@/components/dashboard/stats-cards';
import LogsSection from '@/components/dashboard/logs-section';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Monitor your ModuleX system performance and activity
        </p>
      </div>

      <StatsCards />

      <LogsSection />
    </div>
  );
} 