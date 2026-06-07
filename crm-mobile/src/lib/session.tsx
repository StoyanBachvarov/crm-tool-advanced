import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

import { ApiUser, login as loginRequest } from '@/lib/api';

type StoredSession = {
  token: string;
  user: ApiUser;
};

type SessionContextValue = {
  token: string | null;
  user: ApiUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const storageKey = 'crm-mobile-session';
const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<ApiUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      try {
        const storedValue = await AsyncStorage.getItem(storageKey);

        if (!storedValue || !isMounted) {
          return;
        }

        const storedSession = JSON.parse(storedValue) as StoredSession;

        if (storedSession.token && storedSession.user) {
          setToken(storedSession.token);
          setUser(storedSession.user);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      isLoading,
      login: async (email: string, password: string) => {
        const response = await loginRequest(email, password);
        const nextSession = { token: response.token, user: response.user };
        await AsyncStorage.setItem(storageKey, JSON.stringify(nextSession));
        setToken(response.token);
        setUser(response.user);
      },
      logout: async () => {
        await AsyncStorage.removeItem(storageKey);
        setToken(null);
        setUser(null);
      },
    }),
    [isLoading, token, user]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const session = useContext(SessionContext);

  if (!session) {
    throw new Error('useSession must be used inside SessionProvider');
  }

  return session;
}

export function ProtectedRoute({ children }: PropsWithChildren) {
  const { isAuthenticated, isLoading } = useSession();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return children;
}
