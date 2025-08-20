import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { APP_NAME } from '../../constants';
import { HomeIcon, UserGroupIcon, CalendarDaysIcon, CurrencyDollarIcon, PhotoIcon, Cog6ToothIcon, ShieldCheckIcon, ArrowLeftOnRectangleIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { AuthUser } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../hooks/useAppData';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  currentPath: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, currentPath }) => {
  const isActive = currentPath === to || (to !== '/dashboard' && currentPath.startsWith(to)); // Make dashboard exact match
  return (
    <Link
      to={to}
      className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-academy-secondary transition-colors duration-200 ${
        isActive ? 'bg-academy-accent text-white shadow-md' : 'text-academy-text-secondary hover:text-academy-text'
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

interface SidebarProps {
  authUser: AuthUser;
}

const Sidebar: React.FC<SidebarProps> = ({ authUser }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { academySettings } = useAppData();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  let navItems = [];

  if (authUser.role === 'admin') {
    navItems = [
      { to: '/dashboard', icon: <HomeIcon className="h-6 w-6" />, label: 'Painel' },
      { to: '/students', icon: <UserGroupIcon className="h-6 w-6" />, label: 'Alunos' },
      { to: '/attendance', icon: <CalendarDaysIcon className="h-6 w-6" />, label: 'Presença' },
      { to: '/finance', icon: <CurrencyDollarIcon className="h-6 w-6" />, label: 'Financeiro' },
      { to: '/gallery', icon: <PhotoIcon className="h-6 w-6" />, label: 'Galeria' },
      { to: '/settings', icon: <Cog6ToothIcon className="h-6 w-6" />, label: 'Configurações' },
    ];
  } else if (authUser.role === 'student') {
    navItems = [
      { to: `/students/${authUser.id}`, icon: <UserCircleIcon className="h-6 w-6" />, label: 'Meu Perfil' },
      { to: '/gallery', icon: <PhotoIcon className="h-6 w-6" />, label: 'Galeria' },
    ];
  }


  return (
    <div className="w-64 bg-academy-secondary text-academy-text p-5 flex flex-col space-y-6 shadow-lg">
      <div className="flex items-center space-x-2 pb-6 border-b border-gray-700">
        {academySettings.logoUrl ? (
          <img src={academySettings.logoUrl} alt={`${APP_NAME} Logo`} className="h-10 w-auto" />
        ) : (
          <ShieldCheckIcon className="h-10 w-10 text-academy-accent" />
        )}
        <h1 className="text-2xl font-bold text-academy-text">{APP_NAME}</h1>
      </div>
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <NavItem key={item.to} {...item} currentPath={location.pathname} />
        ))}
      </nav>
      <div className="mt-auto space-y-3">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 p-3 rounded-lg text-red-400 hover:bg-red-500 hover:text-white transition-colors duration-200 focus:outline-none"
        >
          <ArrowLeftOnRectangleIcon className="h-6 w-6" />
          <span>Sair</span>
        </button>
        <div className="text-center text-xs text-academy-text-secondary">
          <p>&copy; {new Date().getFullYear()} {APP_NAME}</p>
          <p>Seu Dojo, Mais Inteligente.</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;