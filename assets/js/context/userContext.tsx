import { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { Auth, Hub } from 'aws-amplify';

interface UserMetadata {
  full_name: string;
  avatar_url: string;
  email_verified: boolean;
}

interface AppMetadata {
  roles: string[];
}

interface FormattedUser {
  id: string;
  email: string;
  user_metadata: UserMetadata;
  app_metadata: AppMetadata;
}

interface UserContextType {
  user: FormattedUser | null;
  setUser: (user: FormattedUser | null) => void;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FormattedUser | null>(null);
  const [loading, setLoading] = useState(true);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      <UserAuthListener setUser={setUser} setLoading={setLoading} />
      {children}
    </UserContext.Provider>
  );
};

// Nouveau composant pour gérer l'authentification
const UserAuthListener = ({ setUser, setLoading }: { setUser: (user: FormattedUser | null) => void, setLoading: (loading: boolean) => void }) => {
  useEffect(() => {
    checkUser();
    const listener = Hub.listen('auth', ({ payload: { event, data } }) => {
      switch (event) {
        case 'signIn':
          checkUser();
          break;
        case 'signOut':
          setUser(null);
          break;
      }
    });

    return () => listener();
  }, []);

  async function checkUser() {
    try {
      const cognitoUser = await Auth.currentAuthenticatedUser();
      if (cognitoUser) {
        const { idToken, accessToken } = cognitoUser.signInUserSession;
        const userData = {
          id: cognitoUser.username,
          email: idToken.payload.email,
          user_metadata: {
            full_name: idToken.payload.name || '',
            avatar_url: idToken.payload.picture || '',
            email_verified: idToken.payload.email_verified === true,
          },
          app_metadata: {
            roles: accessToken.payload['cognito:groups'] || []
          }
        };
        setUser(userData);
      }
    } catch (error) {
      setUser(null);
    }
    setLoading(false);
  }

  return null;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
