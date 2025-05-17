import React from 'react';
import DashboardNav from './DashboardNav';
import { ChartBar, Star, BarChart } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title }) => {
  const navItems = [
    {
      title: "Vue globale",
      href: "/",
      icon: <ChartBar size={16} />,
    },
    {
      title: "Satisfaction client",
      href: "/customer-satisfaction",
      icon: <Star size={16} />,
    },
    {
      title: "Rentabilité produit",
      href: "/product-profitability",
      icon: <BarChart size={16} />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-bagunca-navy text-white px-6 py-4 border-b border-bagunca-green">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img 
              src="/shirt-labagunca.svg" 
              alt="La Bagunça Logo" 
              className="w-8 h-8" 
            />
            <h1 className="text-2xl font-bold text-bagunca-yellow">La Bagunça Analytics</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>
      
      <DashboardNav items={navItems} />
      
      <main className="container py-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-bagunca-navy dark:text-bagunca-yellow">{title}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Analyse des données pour optimiser vos décisions commerciales
          </p>
        </div>
        
        {children}
      </main>
      
      <footer className="bg-bagunca-navy text-white border-t border-bagunca-green py-4 text-center text-sm">
        <div className="flex justify-center items-center gap-2">
          <span>© {new Date().getFullYear()} La Bagunça</span>
          <span className="text-xs">|</span>
          <span className="text-xs">Dashboard développé par <span className="font-bold">Gran🍪Lab</span></span>
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout;
