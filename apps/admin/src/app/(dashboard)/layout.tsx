import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { getAdminSession } from '@/lib/auth';

// Force all dashboard routes to be dynamic - prevents static generation errors
export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  if (!session) {
    redirect('/login');
  }

  return <DashboardShell>{children}</DashboardShell>;
}
