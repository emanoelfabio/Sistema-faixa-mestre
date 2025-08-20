
import React, { createContext, useState, useContext, useCallback, ReactNode } from 'react';
import { AuthUser, UserRole, Student } from '../types';
import { useAppData } from '../hooks/useAppData'; // To access students list for login

interface AuthContextType {
  authUser: AuthUser | null;
  loading: boolean;
  login: (idOrUsername: string, passwordAttempt: string, roleAttempt: UserRole, studentsList: Student[]) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hardcoded admin credentials (for demo purposes)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'efcs2703'; // Updated Password

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    const storedUser = localStorage.getItem('authUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(false);
  const { addNotification } = useAppData();


  const login = useCallback(async (idOrUsername: string, passwordAttempt: string, roleAttempt: UserRole, studentsList: Student[]): Promise<boolean> => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    if (roleAttempt === 'admin') {
      if (idOrUsername === ADMIN_USERNAME && passwordAttempt === ADMIN_PASSWORD) {
        const adminUser: AuthUser = { id: 'admin', name: 'Administrador', role: 'admin' };
        setAuthUser(adminUser);
        localStorage.setItem('authUser', JSON.stringify(adminUser));
        addNotification({ type: 'success', message: 'Login de administrador bem-sucedido.' });
        setLoading(false);
        return true;
      }
    } else if (roleAttempt === 'student') {
      const student = studentsList.find(s => s.id === idOrUsername);
      if (student) {
        const studentBirthYear = new Date(student.dateOfBirth).getFullYear().toString();
        if (passwordAttempt === studentBirthYear) {
          const studentUser: AuthUser = { id: student.id, name: student.name, role: 'student' };
          setAuthUser(studentUser);
          localStorage.setItem('authUser', JSON.stringify(studentUser));
          addNotification({ type: 'success', message: `Bem-vindo(a), ${student.name}!` });
          setLoading(false);
          return true;
        }
      }
    }
    
    addNotification({ type: 'error', message: 'Falha no login. Credenciais ou perfil inválidos.' });
    setLoading(false);
    return false;
  }, [addNotification]);

  const logout = useCallback(() => {
    setAuthUser(null);
    localStorage.removeItem('authUser');
    addNotification({ type: 'info', message: 'Você foi desconectado.' });
  }, [addNotification]);

  return (
    <AuthContext.Provider value={{ authUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
