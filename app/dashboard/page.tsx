import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Header from '@/components/layout/Header';
import LoadingScreen from '@/components/ui/LoadingScreen';

const DashboardView = dynamic(() => import('@/components/dashboard/DashboardView'), {
  ssr: false,
  loading: () => <LoadingScreen />,
});

export default function DashboardPage() {
  return (
    <main className="min-h-screen relative overflow-hidden bg-stellar-void mobile-safe-area">
      <Header />
      <Suspense fallback={<LoadingScreen />}>
        <DashboardView />
      </Suspense>
    </main>
  );
}
