'use client';

import { AnalyticsDashboard } from '@/components/admin/analytics-dashboard';

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'rgb(var(--admin-foreground))' }}>Analytics</h1>
        <p style={{ color: 'rgb(var(--admin-muted-foreground))' }}>Platform performance and insights</p>
      </div>
      <AnalyticsDashboard />
    </div>
  );
}