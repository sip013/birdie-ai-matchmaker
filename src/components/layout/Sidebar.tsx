
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, GitCompare, ClipboardList, BarChart3 } from 'lucide-react';

const Sidebar: React.FC = () => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <Home className="h-5 w-5" /> },
    { name: 'Players', path: '/players', icon: <Users className="h-5 w-5" /> },
    { name: 'Team Balancer', path: '/team-balancer', icon: <GitCompare className="h-5 w-5" /> },
    { name: 'Match Logger', path: '/match-logger', icon: <ClipboardList className="h-5 w-5" /> },
    { name: 'Statistics', path: '/statistics', icon: <BarChart3 className="h-5 w-5" /> },
  ];

  return (
    <aside className="bg-sidebar text-sidebar-foreground w-64 flex flex-col">
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
                  `flex items-center px-4 py-3 rounded-md hover:bg-sidebar-accent transition-colors ${
                    isActive ? 'bg-sidebar-accent font-medium' : ''
                  }`
                }
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="px-4 py-6 border-t border-sidebar-border">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center">
              AI
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">AI Powered</p>
            <p className="text-xs opacity-75">Smart Team Balancing</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
