import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Target, PieChart, Banknote, Mail, CheckCircle } from 'lucide-react';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-r from-primary to-secondary text-white mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-600">{description}</p>
  </div>
);

const HomePage: React.FC = () => {
  const features = [
    {
      icon: <TrendingUp />,
      title: "Expense Tracking",
      description: "Monitor your spending habits with detailed transaction logs and categorization."
    },
    {
      icon: <Target />,
      title: "Financial Goals",
      description: "Set and track your financial goals, from saving for a vacation to a down payment."
    },
    {
      icon: <PieChart />,
      title: "Powerful Analytics",
      description: "Visualize your financial data with insightful charts and predictive forecasts."
    },
    {
      icon: <Banknote />,
      title: "Smart Budgeting",
      description: "Create monthly budgets to stay on top of your finances and control your spending."
    },
    {
      icon: <Mail />,
      title: "Email Alerts",
      description: "Get timely alerts about your budget status, upcoming bills, and goal progress."
    },
     {
      icon: <CheckCircle />,
      title: "Secure & Reliable",
      description: "Your data is securely saved. You have full control and can remove it at any time."
    }
  ];

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Hero Section */}
      <section className="text-center py-16 sm:py-20 lg:py-24 bg-white rounded-2xl shadow-lg">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight">
            Take Control of Your
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary mt-2">
              Financial Future
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
            SmartFin is the all-in-one platform to track expenses, manage budgets, and achieve your financial goals with powerful, easy-to-understand analytics.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto bg-gradient-to-r from-primary to-secondary text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:opacity-90 transition-all duration-300 transform hover:scale-105"
            >
              Get Started for Free
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto text-primary font-semibold px-8 py-3 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section>
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-slate-800">Why SmartFin?</h2>
          <p className="mt-4 text-lg text-slate-600 text-center max-w-3xl mx-auto">
            Everything you need to manage your money effectively in one place.
          </p>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6">
        <p className="text-slate-500">&copy; {new Date().getFullYear()} SmartFin. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;