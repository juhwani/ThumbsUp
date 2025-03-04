import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../backend/config';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/router';


const AuthContext = createContext({
  currentUser: null,
  loading: true,
});


export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });


    return unsubscribe;
  }, []);


  const value = {
    currentUser,
    loading,
    isAuthenticated: !!currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function withProtectedRoute(Component) {
  return function ProtectedRoute(props) {
    const { currentUser, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !currentUser) {
        router.push('/login');
      }
    }, [currentUser, loading, router]);
    if (loading) {
      return <div>Loading...</div>;
    }
    return currentUser ? <Component {...props} /> : null;
  };
}