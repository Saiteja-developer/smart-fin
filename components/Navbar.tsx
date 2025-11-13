
import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Menu, X, BarChart2 } from 'lucide-react';

const NavItem: React.FC<{ to: string; children: React.ReactNode, onClick?: () => void }> = ({ to, children, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
        isActive
          ? 'bg-primary text-white'
          : 'text-slate-700 hover:bg-slate-200 hover:text-slate-900'
      }`
    }
  >
    {children}
  </NavLink>
);

const Navbar: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const closeMobileMenu = () => setIsOpen(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="bg-gradient-to-r from-primary to-secondary p-2 rounded-lg">
                <BarChart2 className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-slate-800">SmartFin</span>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {isAuthenticated ? (
                <>
                  <NavItem to="/dashboard">Dashboard</NavItem>
                  <NavItem to="/transactions">Transactions</NavItem>
                  <NavItem to="/budgets">Budgets</NavItem>
                  <NavItem to="/goals">Goals</NavItem>
                  <NavItem to="/analytics">Analytics</NavItem>
                  <NavItem to="/profile">Profile</NavItem>
                  <button
                    onClick={logout}
                    className="bg-red-500 text-white hover:bg-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavItem to="/login">Login</NavItem>
                  <NavLink
                    to="/register"
                    className="ml-4 bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    Register
                  </NavLink>
                </>
              )}
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="bg-slate-100 inline-flex items-center justify-center p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 focus:ring-primary"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {isAuthenticated ? (
              <>
                <NavItem to="/dashboard" onClick={closeMobileMenu}>Dashboard</NavItem>
                <NavItem to="/transactions" onClick={closeMobileMenu}>Transactions</NavItem>
                <NavItem to="/budgets" onClick={closeMobileMenu}>Budgets</NavItem>
                <NavItem to="/goals" onClick={closeMobileMenu}>Goals</NavItem>
                <NavItem to="/analytics" onClick={closeMobileMenu}>Analytics</NavItem>
                <NavItem to="/profile" onClick={closeMobileMenu}>Profile</NavItem>
                <button
                  onClick={() => {
                    logout();
                    closeMobileMenu();
                  }}
                  className="w-full text-left bg-red-500 text-white hover:bg-red-600 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavItem to="/login" onClick={closeMobileMenu}>Login</NavItem>
                <NavItem to="/register" onClick={closeMobileMenu}>Register</NavItem>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
