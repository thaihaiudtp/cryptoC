import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MagicService } from '../services/magicService';

interface MagicContextType {
  user: any;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isLoggedIn: boolean;
}

const MagicContext = createContext<MagicContextType | undefined>(undefined);

export const MagicProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    try {
      const userInfo = await MagicService.getUserInfo();
      if (userInfo) {
        setUser(userInfo);
        setIsLoggedIn(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setIsLoading(true);
      await MagicService.loginWithGoogle();
      await checkUserStatus();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await MagicService.logout();
      setUser(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <MagicContext.Provider value={{ user, isLoading, loginWithGoogle, logout, isLoggedIn }}>
      {children}
    </MagicContext.Provider>
  );
};

export const useMagic = () => {
  const context = useContext(MagicContext);
  if (!context) {
    throw new Error('useMagic must be used within a MagicProvider');
  }
  return context;
};