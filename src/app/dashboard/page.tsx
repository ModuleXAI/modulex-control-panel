import StatsCards from '@/components/dashboard/stats-cards';
import LogsSection from '@/components/dashboard/logs-section';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your ModuleX control panel
        </p>
      </div>

      <StatsCards />

      <LogsSection />
    </div>
  );
} 