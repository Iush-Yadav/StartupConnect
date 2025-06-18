import { ReactNode, useEffect } from 'react';
import Header from './Header';
import { useStore } from '../../lib/store';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const initializeStore = useStore(state => state.initialize);

  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-pink-50 to-purple-50 overflow-y-auto">
      <Header />
      <main className="flex-grow container mx-auto px-2 sm:px-4 py-4 md:py-8 pt-16">
        {children}
      </main>
    </div>
  );
}