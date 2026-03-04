import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import {authApi, User} from '../api/auth';
import {getToken, setToken, removeToken, setUser, removeUser} from '../utils/storage';

type AuthState = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};

type AuthContextType = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    displayName?: string,
  ) => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}: {children: React.ReactNode}) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await getToken();
      if (storedToken) {
        const user = await authApi.getMe();
        setState({
          user,
          token: storedToken,
          isLoading: false,
          isAuthenticated: true,
        });
        await setUser(user);
      } else {
        setState(s => ({...s, isLoading: false}));
      }
    } catch {
      await removeToken();
      await removeUser();
      setState({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  };

  const handleAuthResponse = async (response: {
    access_token: string;
    user: User;
  }) => {
    await setToken(response.access_token);
    await setUser(response.user);
    setState({
      user: response.user,
      token: response.access_token,
      isLoading: false,
      isAuthenticated: true,
    });
  };

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.login({email, password});
    await handleAuthResponse(response);
  }, []);

  const register = useCallback(
    async (email: string, password: string, displayName?: string) => {
      const response = await authApi.register({
        email,
        password,
        display_name: displayName,
      });
      await handleAuthResponse(response);
    },
    [],
  );

  const googleLogin = useCallback(async (credential: string) => {
    const response = await authApi.googleAuth(credential);
    await handleAuthResponse(response);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore logout errors
    }
    await removeToken();
    await removeUser();
    setState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const user = await authApi.getMe();
      await setUser(user);
      setState(s => ({...s, user}));
    } catch {
      // ignore
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{...state, login, register, googleLogin, logout, refreshUser}}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
