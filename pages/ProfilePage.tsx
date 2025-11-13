import React from 'react';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/ui/Card';
import { User as UserIcon, Mail, Calendar } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return (
        <div className="text-center">
            <p>Could not load user profile.</p>
        </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Profile</h1>
      <Card>
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="flex-shrink-0">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-4xl font-bold">
              {user.username ? user.username.charAt(0).toUpperCase() : <UserIcon size={48} />}
            </div>
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-semibold">{user.username || 'Anonymous User'}</h2>
            <div className="flex items-center text-slate-500 mt-2 gap-2">
                <Mail size={16} />
                <span>{user.email || 'No email provided.'}</span>
            </div>
            <div className="flex items-center text-slate-500 mt-1 gap-2">
                <Calendar size={16} />
                <span>Joined on {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-8 border-t pt-6">
          <button
            onClick={logout}
            className="w-full sm:w-auto bg-red-500 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </Card>
    </div>
  );
};

export default ProfilePage;
