import { DashboardShell } from '@/components/layout/dashboard-shell';

// Force all dashboard routes to be dynamic - prevents static generation errors
export const dynamic = 'force-dynamic';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
