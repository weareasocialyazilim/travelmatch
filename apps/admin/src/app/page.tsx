import { redirect } from 'next/navigation';

/**
 * Root page redirects to dashboard
 * All admin functionality is within the (dashboard) route group
 */
export default function RootPage() {
  redirect('/dashboard');
}
