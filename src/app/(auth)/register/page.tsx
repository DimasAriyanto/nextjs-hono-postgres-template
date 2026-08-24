import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { RegisterWrapper } from '@/features/auth';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.register');
  return { robots: 'noindex, nofollow', title: t('title') };
}

export default function Page() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <RegisterWrapper />
      </div>
    </div>
  )
}
