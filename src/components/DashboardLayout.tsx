
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
      <header className="bg-white dark:bg-gray-950 border-b px-6 py-4 dark:border-gray-800">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold gradient-text dark:text-white">Analytics Dashboard</h1>
          <ThemeToggle />
        </div>
      </header>
      
      <DashboardNav items={navItems} />
      
      <main className="container py-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Analyse des données pour optimiser vos décisions commerciales
          </p>
        </div>
        
        {children}
      </main>
      
      <footer className="bg-white dark:bg-gray-950 border-t dark:border-gray-800 py-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Gran🍪Lab
      </footer>
    </div>
  );
};

export default DashboardLayout;
