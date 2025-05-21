
import { Home, Wallet, PieChart, User, Plus, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Sidebar as SidebarContainer, 
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider
} from '@/components/ui/sidebar';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/utils/formatters';
import { calculateBalance } from '@/data/mockData';

const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const balance = calculateBalance();

  return (
    <SidebarProvider>
      <SidebarContainer className="fixed left-0 w-64 h-screen border-r border-border">
        <SidebarHeader className="p-4 border-b">
          <h1 className="text-xl font-bold text-primary flex items-center gap-2">
            <Wallet className="h-5 w-5 text-finpal-purple" />
            <span>FinPal</span>
          </h1>
        </SidebarHeader>
        
        <SidebarContent>
          <div className="p-4">
            <Card className="bg-gradient-card text-white p-4 mb-6">
              <p className="text-sm opacity-80">Current Balance</p>
              <h2 className="text-2xl font-bold">{formatCurrency(balance)}</h2>
            </Card>
            
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={currentPath === '/'}
                >
                  <Link to="/" className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={currentPath === '/transactions'}
                >
                  <Link to="/transactions" className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    <span>Transactions</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/add" className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    <span>Add New</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={currentPath === '/analytics'}
                >
                  <Link to="/analytics" className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    <span>Analytics</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={currentPath === '/profile'}
                >
                  <Link to="/profile" className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
          
          <div className="mt-auto p-4 border-t">
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/login" className="flex items-center gap-2 text-destructive">
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </div>
        </SidebarContent>
      </SidebarContainer>
    </SidebarProvider>
  );
};

export default Sidebar;
