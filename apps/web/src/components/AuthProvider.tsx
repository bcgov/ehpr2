import axios from 'axios';
import { useRouter } from 'next/router';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { toast } from 'react-toastify';
import { User } from '@ehpr/common';
import { getLoggedUser } from '@services';
import { Spinner } from './Spinner';
import { getErrorMessage } from '../util';

interface AuthContextType {
  user: User | null;
}

const AuthContext = createContext<AuthContextType>({ user: null });

const PROTECTED_ROUTES = ['/admin'];

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const router = useRouter();
  const { isAuthenticated, isLoading, user: kcUser, signinSilent, signoutSilent } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [silentSigninAttempted, setSilentSigninAttempted] = useState(false);
  const contextValue = useMemo(
    () => ({
      user,
    }),
    [user],
  );

  const isProtected = !router || PROTECTED_ROUTES.includes(router.pathname.split('?')[0]);

  useEffect(() => {
    const isOnLoginPage = router?.pathname === '/login';
    const hasAuthError = router?.query?.error;

    // Reset silent signin flag when we navigate to login page or when authenticated
    if (isOnLoginPage || isAuthenticated) {
      setSilentSigninAttempted(false);
    }

    // Try silent signin if:
    // 1. We're on a protected route
    // 2. Not authenticated
    // 3. Not currently loading
    // 4. Haven't already attempted silent signin
    // 5. Not on login page
    // 6. No auth error in URL
    if (
      !isAuthenticated &&
      isProtected &&
      !isLoading &&
      !silentSigninAttempted &&
      !isOnLoginPage &&
      !hasAuthError
    ) {
      setSilentSigninAttempted(true);
      signinSilent().catch(() => {
        // Silent signin failed, redirect to login page
        router.replace('/login');
      });
    }

    // If we're on a protected route, not authenticated, loading is done, and we've already tried silent signin, redirect to login
    if (!isAuthenticated && isProtected && !isLoading && silentSigninAttempted && !isOnLoginPage) {
      router.replace('/login');
    }

    if (!user && kcUser) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${kcUser.access_token}`;
      getLoggedUser().then(user => {
        setUser(user);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isAuthenticated,
    isLoading,
    kcUser,
    silentSigninAttempted,
    router?.pathname,
    router?.query?.error,
  ]);

  useEffect(() => {
    axios.interceptors.response.use(
      res => res,
      e => {
        const message = getErrorMessage(e);
        const status = e.response?.status;
        if ([401, 403].includes(status) || message?.includes('Authentication token')) {
          signoutSilent();
          location.replace(`${location.origin}/login`);
        } else if (status === 429) {
          // rate limit exceeded error message
          toast.error(
            'Too many requests. Please wait 5 minutes before submitting another request.',
          );
        } else {
          toast.error(message);
        }
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (
    isLoading ||
    (!user &&
      (isProtected || // during redirecting to /login
        (kcUser && router?.pathname.startsWith('/login')))) // during redirecting to /admin
  ) {
    return <Spinner size='2x' />;
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};
