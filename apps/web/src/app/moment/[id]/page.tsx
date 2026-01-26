import { redirect } from 'next/navigation';
import { Metadata } from 'next';

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Redirect /moment/{id} to /moments/{id} for URL consistency
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: 'Redirecting... | Lovendo',
  };
}

export default async function MomentRedirectPage({ params }: PageProps) {
  const { id } = await params;
  redirect(`/moments/${id}`);
}
