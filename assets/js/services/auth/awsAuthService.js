import { Auth } from 'aws-amplify';
import { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth';
import { openNotificationWithIcon } from '@/components/common/notification/NotifAlert';

export const signUpWithEmail = async (email, password, fullName, t, navigate, lng) => {
  try {
    await Auth.signUp({
      username: email,
      password,
      attributes: {
        email,
        name: fullName,
      }
    });

    openNotificationWithIcon('success', t('registration_successful'), t('verification_email_sent'));
    return true;
  } catch (error) {
    if (error.code === 'UsernameExistsException') {
      openNotificationWithIcon('error', t('registration_error_title'), t('email_already_registered'));
    } else {
      openNotificationWithIcon('error', t('registration_error_title'), t('registration_error_message'));
    }
    return false;
  }
};

export const signInWithEmail = async (email, password, t, setUser, navigate, lng) => {
  try {
    const cognitoUser = await Auth.signIn(email, password);
    
    // Formatage des données utilisateur
    const userData = {
      id: cognitoUser.username,
      email: cognitoUser.attributes.email,
      user_metadata: {
        full_name: cognitoUser.attributes.name || '',
        avatar_url: cognitoUser.attributes.picture || '',
        email_verified: cognitoUser.attributes.email_verified,
      },
      app_metadata: {
        roles: cognitoUser.signInUserSession.accessToken.payload['cognito:groups'] || []
      }
    };

    if (cognitoUser) {
      openNotificationWithIcon('success', t('login_success'), t('login_success_message'));
      setUser(userData);
      navigate(`/${lng}/dashboard`);
    }
    return { showVerificationModal: false };
  } catch (error) {
    if (error.code === 'UserNotConfirmedException') {
      return { showVerificationModal: true };
    }
    openNotificationWithIcon('error', t('login_error'), t('login_error_message'));
    return { showVerificationModal: false };
  }
};

export const signInWithProvider = async (provider, lng, t) => {
  try {
    const providerName = provider.toLowerCase();
    localStorage.setItem('preferredLanguage', lng);
    
    const redirectUri = encodeURIComponent(`${window.location.origin}/${lng}/auth/callback`);
    console.log('URL de redirection:', redirectUri);
    
    const customState = encodeURIComponent(JSON.stringify({
      lang: lng,
      provider: providerName
    }));
    
    switch (providerName) {
      case 'google':
        await Auth.federatedSignIn({
          provider: CognitoHostedUIIdentityProvider.Google,
          redirectSignIn: redirectUri,
          customState
        });
        break;
      case 'microsoft':
        await Auth.federatedSignIn({
          provider: 'Microsoft',
          redirectSignIn: redirectUri,
          customState
        });
        break;
      default:
        throw new Error(`Fournisseur ${provider} non supporté`);
    }
  } catch (error) {
    console.error('Erreur de connexion:', error);
    console.error('Détails de l\'erreur:', {
      message: error.message,
      code: error.code,
      name: error.name
    });
    throw error;
  }
};

export const resendVerificationEmail = async (email, t) => {
  try {
    await Auth.resendSignUp(email);
    openNotificationWithIcon('success', t('verification_email_resent'), t('check_inbox'));
    return true;
  } catch (error) {
    openNotificationWithIcon('error', t('resend_error'), t('resend_error_message'));
    return false;
  }
};

export const resetPassword = async (email, t) => {
  try {
    await Auth.forgotPassword(email);
    openNotificationWithIcon(
      'success', 
      t('forgot_password.email_sent'), 
      t('forgot_password.check_inbox')
    );
    return true;
  } catch (error) {
    openNotificationWithIcon(
      'error', 
      t('forgot_password.error'), 
      t('forgot_password.error_message')
    );
    return false;
  }
};

export const updatePassword = async (oldPassword, newPassword, t) => {
  try {
    const user = await Auth.currentAuthenticatedUser();
    await Auth.changePassword(user, oldPassword, newPassword);
    openNotificationWithIcon('success', t('success'), t('success_message'));
    return true;
  } catch (error) {
    openNotificationWithIcon('error', t('error'), t('error_message'));
    return false;
  }
};

export const confirmSignUp = async (email, code, t) => {
  try {
    await Auth.confirmSignUp(email, code);
    openNotificationWithIcon('success', t('verification_successful'), t('account_verified'));
    return true;
  } catch (error) {
    if (error.code === 'CodeMismatchException') {
      openNotificationWithIcon('error', t('verification_error'), t('invalid_code'));
    } else {
      openNotificationWithIcon('error', t('verification_error'), t('verification_error_message'));
    }
    return false;
  }
};

export const confirmResetPassword = async (email, code, newPassword, t) => {
  try {
    await Auth.forgotPasswordSubmit(email, code, newPassword);
    openNotificationWithIcon(
      'success', 
      t('forgot_password.success'), 
      t('forgot_password.success_message')
    );
    return true;
  } catch (error) {
    openNotificationWithIcon(
      'error', 
      t('forgot_password.error'), 
      t('forgot_password.error_message')
    );
    return false;
  }
};

export const handleAuthCallback = async (code, state) => {
  try {
    // Traitement du code d'autorisation
    const result = await Auth.federatedSignIn();
    return result;
  } catch (error) {
    throw error;
  }
};

export const signOut = async (t, lng = 'fr') => {
  try {
    // Récupérer l'utilisateur actuel pour vérifier le type d'authentification
    const currentUser = await Auth.currentAuthenticatedUser();
    // Les utilisateurs fédérés auront un type d'authentification différent de 'USER_SRP_AUTH'
    const isFederatedUser = currentUser.authenticationFlowType !== 'USER_SRP_AUTH';

    await Auth.signOut();

    if (isFederatedUser) {
      // Pour les utilisateurs fédérés, utiliser l'URL de déconnexion Cognito
      const cognitoDomain = import.meta.env.VITE_AWS_COGNITO_DOMAIN;
      const clientId = import.meta.env.VITE_AWS_CLIENT_ID;
      const signOutUrl = encodeURIComponent(`${window.location.protocol}//${window.location.host}/${lng}/auth/signin`);

      const logoutUrl = new URL(`https://${cognitoDomain}/logout`);
      logoutUrl.searchParams.append('client_id', clientId);
      logoutUrl.searchParams.append('logout_uri', signOutUrl);

      window.location.replace(logoutUrl.toString());
    } else {
      // Pour les utilisateurs standards, rediriger directement
      window.location.href = `/${lng}/auth/signin`;
    }

  } catch (error) {
    openNotificationWithIcon('error', t('logout_error'), t('logout_error_message'));
    window.location.href = `/${lng}/auth/signin`;
  }
};
