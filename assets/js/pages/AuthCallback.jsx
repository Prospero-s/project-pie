import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from 'aws-amplify';
import { useUser } from '@/context/userContext';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const { i18n } = useTranslation();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1),
        );

        const code = searchParams.get('code') || hashParams.get('code');
        const error = searchParams.get('error') || hashParams.get('error');
        const error_description =
          searchParams.get('error_description') ||
          hashParams.get('error_description');

        if (error || error_description) {
          throw new Error(`Erreur OAuth: ${error} - ${error_description}`);
        }

        if (code) {
          try {
            // Récupérer les tokens de session
            const session = await Auth.currentSession();
            const { idToken, accessToken } = session;

            // Utiliser le sub comme ID Cognito
            const userId = idToken.payload.sub;

            const formattedUser = {
              id: userId,
              email: idToken.payload.email,
              user_metadata: {
                full_name: idToken.payload.name || '',
                avatar_url: idToken.payload.picture || '',
                email_verified: idToken.payload.email_verified === true,
              },
              app_metadata: {
                roles: accessToken.payload['cognito:groups'] || [],
              },
            };

            // Configurer axios avec les headers
            axios.defaults.headers.common['x-cognito-id'] = userId;
            axios.defaults.headers.common['x-cognito-email'] =
              formattedUser.email;
            axios.defaults.headers.common['x-cognito-name'] =
              formattedUser.name;
            axios.defaults.headers.common['Authorization'] =
              `Bearer ${idToken.getJwtToken()}`;

            setUser(formattedUser);

            // Vérifier si l'utilisateur appartient à un groupe
            try {
              const response = await axios.get('/api/user-groups');
              const hasGroup =
                response.data.groups && response.data.groups.length > 0;

              if (hasGroup) {
                navigate(`/${i18n.language}/dashboard`, { replace: true });
              } else {
                navigate(`/${i18n.language}/group-selection`, {
                  replace: true,
                });
              }
            } catch (error) {
              navigate(`/${i18n.language}/group-selection`, { replace: true });
              throw new Error(
                `Erreur lors de la vérification des groupes: ${error.message}`,
              );
            }
          } catch (error) {
            redirectToSignIn();
            throw new Error(
              `Erreur lors de la récupération de l'utilisateur: ${error.message}`,
            );
          }
        } else {
          throw new Error("Pas de code d'autorisation trouvé");
        }
      } catch (error) {
        redirectToSignIn();
        throw new Error(`Erreur: ${error.message}`);
      }
    };

    handleCallback();
  }, [navigate, setUser, i18n.language]);

  const redirectToSignIn = () => {
    navigate(`/${i18n.language}/auth/signin`, { replace: true });
  };

  return null;
};

export default AuthCallback;
