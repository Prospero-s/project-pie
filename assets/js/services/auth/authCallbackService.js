import { Auth } from 'aws-amplify';
import axios from 'axios';

/**
 * Extrait et valide les paramètres d'URL et de hash pour le callback OAuth
 * @returns {Object} Les paramètres extraits ou une erreur
 */
export const extractOAuthParams = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.substring(1));

  const code = searchParams.get('code') || hashParams.get('code');
  const error = searchParams.get('error') || hashParams.get('error');
  const error_description =
    searchParams.get('error_description') ||
    hashParams.get('error_description');

  if (error || error_description) {
    throw new Error(`Erreur OAuth: ${error} - ${error_description}`);
  }

  if (!code) {
    throw new Error("Pas de code d'autorisation trouvé");
  }

  return { code };
};

/**
 * Récupère et formate les informations utilisateur depuis la session Cognito
 * @returns {Object} Informations utilisateur formatées et tokens
 */
export const getUserFromSession = async () => {
  try {
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

    return {
      user: formattedUser,
      idToken: idToken.getJwtToken(),
      userId,
    };
  } catch (error) {
    throw new Error(
      `Erreur lors de la récupération de l'utilisateur: ${error.message}`,
    );
  }
};

/**
 * Configure les headers d'authentification pour axios
 * @param {Object} userData Données utilisateur et token
 */
export const configureAxiosHeaders = ({ user, idToken, userId }) => {
  axios.defaults.headers.common['x-cognito-id'] = userId;
  axios.defaults.headers.common['x-cognito-email'] = user.email;
  axios.defaults.headers.common['x-cognito-name'] =
    user.user_metadata.full_name;
  axios.defaults.headers.common['Authorization'] = `Bearer ${idToken}`;
};

/**
 * Envoie un email de bienvenue si l'utilisateur est nouveau
 * @param {Object} user Informations utilisateur
 * @returns {Promise<Object>} Résultat de l'envoi d'email
 */
export const sendWelcomeEmail = async user => {
  try {
    const welcomeResponse = await axios.post('/api/auth/send-welcome-email', {
      email: user.email,
      fullName: user.user_metadata.full_name || 'Utilisateur',
    });

    return {
      success: true,
      emailSent: welcomeResponse.data.emailSent,
    };
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email de bienvenue:", error);
    return {
      success: false,
      error,
    };
  }
};

/**
 * Vérifie si l'utilisateur appartient à un groupe et détermine la redirection
 * @returns {Promise<Object>} Résultat avec la destination de redirection
 */
export const checkUserGroups = async () => {
  try {
    const response = await axios.get('/api/user-groups');
    const hasGroup = response.data.groups && response.data.groups.length > 0;

    return {
      success: true,
      hasGroup,
      destination: hasGroup ? 'dashboard' : 'group-selection',
    };
  } catch (error) {
    console.error('Erreur lors de la vérification des groupes:', error);
    return {
      success: false,
      hasGroup: false,
      destination: 'group-selection',
      error,
    };
  }
};

/**
 * Gère tout le processus de callback d'authentification OAuth
 * @param {Function} setUser Fonction pour définir l'utilisateur dans le contexte
 * @param {Function} navigate Fonction de navigation React Router
 * @param {string} language Code de langue actuel
 * @returns {Promise<Object>} Résultat du processus de callback
 */
export const handleAuthCallback = async (setUser, navigate, language) => {
  try {
    // Étape 1: Extraire et valider les paramètres OAuth
    const { code } = extractOAuthParams();

    if (code) {
      try {
        // Étape 2: Récupérer les informations utilisateur
        const userData = await getUserFromSession();

        // Étape 3: Configurer axios avec les en-têtes d'authentification
        configureAxiosHeaders(userData);

        // Étape 4: Définir l'utilisateur dans le contexte
        setUser(userData.user);

        // Étape 5: Envoyer l'email de bienvenue si nécessaire
        await sendWelcomeEmail(userData.user);

        // Étape 6: Vérifier l'appartenance à un groupe et rediriger
        const groupCheck = await checkUserGroups();
        navigate(`/${language}/${groupCheck.destination}`, { replace: true });

        return { success: true };
      } catch (error) {
        navigate(`/${language}/auth/signin`, { replace: true });
        throw error;
      }
    }
  } catch (error) {
    navigate(`/${language}/auth/signin`, { replace: true });
    throw error;
  }
};
