import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAppData } from '../hooks/useAppData';
import { UserRole } from '../types';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { ShieldCheckIcon, UserCircleIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { APP_NAME } from '../constants';


const LoginPage: React.FC = () => {
  const [idOrUsername, setIdOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const { students, addNotification, academySettings } = useAppData();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!idOrUsername || !password) {
      setError('Por favor, insira o ID/Usuário e a Senha.');
      return;
    }

    const success = await login(idOrUsername, password, role, students);
    if (success) {
      if (role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/dashboard'); 
      }
    } else {
      setError('Credenciais inválidas. Por favor, tente novamente.');
    }
  };
  
  const backgroundStyles: React.CSSProperties = academySettings.backgroundUrl ? {
      backgroundImage: `url(${academySettings.backgroundUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
  } : {};

  return (
    <div className="min-h-screen flex items-center justify-center bg-academy-primary p-4 relative" style={backgroundStyles}>
      {academySettings.backgroundUrl && <div className="absolute inset-0 bg-black bg-opacity-60 z-0"></div>}
      <div className="max-w-md w-full bg-academy-secondary shadow-2xl rounded-xl p-8 space-y-8 z-10">
        <div className="text-center">
            {academySettings.logoUrl ? (
                <img src={academySettings.logoUrl} alt={`${APP_NAME} Logo`} className="mx-auto h-16 w-auto mb-3"/>
            ) : (
                <ShieldCheckIcon className="mx-auto h-16 w-16 text-academy-accent mb-3" />
            )}
          <h2 className="text-3xl font-extrabold text-academy-text">
            Acesse o {APP_NAME}
          </h2>
          <p className="mt-2 text-academy-text-secondary">
            Acesse o portal da sua academia.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-academy-text-secondary mb-2">Entrar como:</label>
            <div className="flex space-x-4">
              {(['student', 'admin'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex-1 py-3 px-4 rounded-md text-sm font-medium focus:outline-none transition-all duration-150 ease-in-out
                    ${role === r ? 'bg-academy-accent text-white shadow-md' : 'bg-gray-700 text-academy-text-secondary hover:bg-gray-600'}`}
                >
                  <div className="flex items-center justify-center">
                    {r === 'student' ? <AcademicCapIcon className="h-5 w-5 mr-2" /> : <UserCircleIcon className="h-5 w-5 mr-2" />}
                    {r === 'student' ? 'Aluno' : 'Admin'}
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          <Input
            label={role === 'admin' ? "Usuário" : "ID do Aluno"}
            id="idOrUsername"
            name="idOrUsername"
            type="text"
            autoComplete={role === 'admin' ? "username" : "off"}
            required
            value={idOrUsername}
            onChange={(e) => setIdOrUsername(e.target.value)}
            placeholder={role === 'admin' ? "Digite seu nome de usuário" : "Digite seu ID de Aluno"}
          />
          <Input
            label="Senha"
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={role === 'admin' ? "••••••••" : "Seu Ano de Nascimento (AAAA)"}
          />

          {error && <p className="text-xs text-red-400 text-center">{error}</p>}

          <div>
            <Button type="submit" className="w-full" isLoading={loading} disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </div>
        </form>
        <p className="text-center text-xs text-academy-text-secondary">
            &copy; {new Date().getFullYear()} {APP_NAME}. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;