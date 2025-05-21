
import { ReactNode } from 'react';
import BottomNavigation from './BottomNavigation';
import Sidebar from './Sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col min-h-screen bg-background md:flex-row">
      {/* Sidebar for desktop */}
      {!isMobile && <Sidebar />}
      
      {/* Main content */}
      <main className={`flex-1 ${!isMobile ? 'ml-64' : ''}`}>
        <div className={`${isMobile ? 'container max-w-lg mx-auto px-4 py-2 pb-16' : 'p-6 w-full'}`}>
          {children}
        </div>
      </main>
      
      {/* Bottom navigation for mobile only */}
      {isMobile && <BottomNavigation />}
    </div>
  );
};

export default Layout;
