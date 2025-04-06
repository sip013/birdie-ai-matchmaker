import React, { useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { Home, Users, GitCompare, ClipboardList, BarChart3, LogOut, LogIn, Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const Sidebar: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home className="h-5 w-5" /> },
    { name: 'Players', path: '/players', icon: <Users className="h-5 w-5" /> },
    { name: 'Team Balancer', path: '/team-balancer', icon: <GitCompare className="h-5 w-5" /> },
    { name: 'Match Logger', path: '/match-logger', icon: <ClipboardList className="h-5 w-5" /> },
    { name: 'Statistics', path: '/statistics', icon: <BarChart3 className="h-5 w-5" /> },
  ];

  const handleSignOut = async () => {
    await signOut();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const SidebarContent = () => (
    <>
      <div className="p-6">
        <h1 className="text-2xl font-bold flex items-center">
          <svg viewBox="0 0 24 24" className="h-8 w-8 mr-2 text-sidebar-primary" fill="currentColor">
            <path d="M12,2C6.48,2 2,6.48 2,12s4.48,10 10,10s10,-4.48 10,-10S17.52,2 12,2zM12,20c-4.41,0 -8,-3.59 -8,-8s3.59,-8 8,-8s8,3.59 8,8S16.41,20 12,20z"/>
            <path d="M12,6c-0.55,0 -1,0.45 -1,1v8c0,0.55 0.45,1 1,1s1,-0.45 1,-1V7C13,6.45 12.55,6 12,6z"/>
            <path d="M12,16m-1,0a1,1 0,1 1,2 0a1,1 0,1 1,-2 0"/>
          </svg>
          BirdieMatch
        </h1>
      </div>
      <nav className="flex-1 px-4 pb-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center px-4 py-3 rounded-md hover:bg-sidebar-accent transition-colors',
                    isActive ? 'bg-sidebar-accent font-medium' : ''
                  )
                }
                onClick={() => setIsOpen(false)}
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="px-4 py-6 border-t border-sidebar-border">
        {user ? (
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>
              <div className="ml-3 flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">{user.email}</p>
                <p className="text-xs opacity-75 truncate">Logged in</p>
              </div>
            </div>
            <div className="mt-auto">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm font-medium text-white bg-sidebar-primary hover:bg-sidebar-primary/90 rounded-lg transition-colors duration-200 shadow-sm"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-auto">
            <Link
              to="/"
              className="flex items-center gap-2 w-full px-4 py-2 text-sm font-medium text-white bg-sidebar-primary hover:bg-sidebar-primary/90 rounded-lg transition-colors duration-200 shadow-sm"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Link>
          </div>
        )}
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72 bg-sidebar-DEFAULT text-sidebar-foreground">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside className="hidden md:flex flex-col w-64 bg-sidebar-DEFAULT text-sidebar-foreground">
      <SidebarContent />
    </aside>
  );
};

export default Sidebar;
