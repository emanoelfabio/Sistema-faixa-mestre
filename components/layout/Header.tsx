
import React from 'react';
import { Link } from 'react-router-dom';
import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useAppData } from '../../hooks/useAppData';
import { AuthUser } from '../../types'; // Import AuthUser
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth for user info

interface HeaderProps {
  authUser: AuthUser; // Pass authenticated user
}

const Header: React.FC<HeaderProps> = ({ authUser }) => {
  const { notifications, dismissNotification } = useAppData();
  const [showNotifications, setShowNotifications] = React.useState(false);

  const unreadNotifications = notifications.slice(0, 3);
  
  const welcomeMessage = authUser.role === 'admin' ? "Bem-vindo, Administrador!" : `Bem-vindo(a), ${authUser.name}!`;

  return (
    <header className="bg-academy-secondary shadow-md p-4 flex justify-between items-center text-academy-text">
      <div>
        <h2 className="text-xl font-semibold">{welcomeMessage}</h2>
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-full hover:bg-gray-700 focus:outline-none"
            aria-label="Notificações"
          >
            <BellIcon className="h-6 w-6" />
            {notifications.length > 0 && (
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-academy-secondary"></span>
            )}
          </button>
          {showNotifications && (
            <div 
              className="absolute right-0 mt-2 w-80 bg-gray-700 border border-gray-600 rounded-md shadow-lg z-20 text-academy-text"
              onMouseLeave={() => setShowNotifications(false)} // Close on mouse leave
            >
              <div className="p-3 border-b border-gray-600">
                <h3 className="text-sm font-semibold">Notificações</h3>
              </div>
              {unreadNotifications.length > 0 ? (
                unreadNotifications.map(notif => (
                  <div key={notif.id} className="p-3 border-b border-gray-600 hover:bg-gray-600 text-xs">
                    <p className={`font-medium ${
                      notif.type === 'error' ? 'text-red-400' : 
                      notif.type === 'warning' ? 'text-yellow-400' :
                      notif.type === 'success' ? 'text-green-400' : 'text-blue-400'
                    }`}>{notif.message}</p>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-gray-400">{new Date(notif.timestamp).toLocaleTimeString()}</p>
                      <button 
                        onClick={() => dismissNotification(notif.id)}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Dispensar
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="p-3 text-sm text-gray-400">Nenhuma notificação nova.</p>
              )}
               {notifications.length > 3 && (
                <div className="p-2 text-center text-xs text-academy-accent hover:underline">
                  Ver todas ({notifications.length})
                </div>
              )}
            </div>
          )}
        </div>
        {/* User profile icon can link to profile page or be a dropdown for settings/logout for students as well */}
        <Link to={authUser.role === 'student' ? `/students/${authUser.id}` : `/settings`} className="p-2 rounded-full hover:bg-gray-700 focus:outline-none" aria-label="Perfil do Usuário">
          <UserCircleIcon className="h-6 w-6" />
        </Link>
      </div>
    </header>
  );
};

export default Header;
