import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import LoadingScreen from '@/components/ui/LoadingScreen';
import Header from '@/components/layout/Header';

const StorytellingLanding = dynamic(() => import('@/components/landing/StorytellingLanding'), {
  ssr: false,
  loading: () => <LoadingScreen />,
});

export default function Home() {
  return (
    <main className="mobile-safe-area">
      <Header />
      <Suspense fallback={<LoadingScreen />}>
        <StorytellingLanding />
      </Suspense>
    </main>
  );
}
