
import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';

interface HeaderProps {
  title?: string;
}

const Header = ({ title = 'Home' }: HeaderProps) => {
  const [showShadow, setShowShadow] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setShowShadow(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-10 bg-background py-4 transition-shadow ${showShadow ? 'shadow-sm' : ''}`}>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{title}</h1>
        <button className="p-2 rounded-full hover:bg-muted">
          <Bell className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default Header;
