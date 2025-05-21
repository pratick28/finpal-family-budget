
import { Home, Wallet, PieChart, User, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const BottomNavigation = () => {
  return (
    <div className="bottom-nav">
      <Link to="/" className="flex flex-col items-center p-1 text-foreground">
        <Home className="w-5 h-5" />
        <span className="text-xs mt-1">Home</span>
      </Link>
      <Link to="/transactions" className="flex flex-col items-center p-1 text-muted-foreground">
        <Wallet className="w-5 h-5" />
        <span className="text-xs mt-1">Transactions</span>
      </Link>
      <Link to="/add" className="relative -mt-6">
        <div className="flex items-center justify-center w-14 h-14 bg-finpal-purple rounded-full shadow-md">
          <Plus className="w-6 h-6 text-white" />
        </div>
      </Link>
      <Link to="/analytics" className="flex flex-col items-center p-1 text-muted-foreground">
        <PieChart className="w-5 h-5" />
        <span className="text-xs mt-1">Analytics</span>
      </Link>
      <Link to="/profile" className="flex flex-col items-center p-1 text-muted-foreground">
        <User className="w-5 h-5" />
        <span className="text-xs mt-1">Profile</span>
      </Link>
    </div>
  );
};

export default BottomNavigation;
