import React, { createContext, useContext, useState, ReactNode } from 'react';

type User = {
  id: string;
  name: string;
  email: string;
};

type AuthContextValue = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const MOCK_USER: User = {
  id: 'driver-1',
  name: 'Inserir Nome',
  email: 'silvana.driver@biteexpress.com'
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    // validação simples apenas para simular
    if (!email || !password) {
      throw new Error('Preencha email e senha.');
    }

    // Simulação de delay de request
    await new Promise((resolve) => setTimeout(resolve, 800));

    setUser({
      ...MOCK_USER,
      email
    });
  };

  const logout = () => setUser(null);

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};


