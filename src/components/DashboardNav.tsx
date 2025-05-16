
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavItem {
  title: string;
  href: string;
  icon?: React.ReactNode;
}

interface DashboardNavProps {
  items: NavItem[];
}

const DashboardNav: React.FC<DashboardNavProps> = ({ items }) => {
  const location = useLocation();
  
  return (
    <nav className="flex items-center space-x-1 lg:space-x-2 overflow-x-auto py-2 px-4 bg-white dark:bg-gray-950 border-b dark:border-gray-800">
      {items.map((item) => {
        const isActive = location.pathname === item.href;
        
        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap",
              isActive 
                ? "bg-dashboard-lightPurple text-dashboard-purple dark:bg-violet-900 dark:text-violet-200" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            )}
          >
            {item.icon && <span className="mr-2">{item.icon}</span>}
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
};

export default DashboardNav;
